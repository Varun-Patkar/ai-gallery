import React, { useState, useEffect, useRef } from "react";
// Use CreateMLCEngine
import { CreateMLCEngine } from "@mlc-ai/web-llm";

// Remove onMessagesChange, add contextObjectName prop
export default function Chatbot({
	isActive,
	onSendMessage, // Keep this for potential future API calls (though we'll handle LLM locally)
	onReset,
	onClose,
	contextObjectName, // Add context prop
}) {
	// --- WebLLM State ---
	const [engine, setEngine] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isReady, setIsReady] = useState(false);
	const [initProgress, setInitProgress] = useState("Initializing...");
	const [botIsTyping, setBotIsTyping] = useState(false); // Track bot response generation

	// --- Chat State ---
	const [messages, setMessages] = useState([]); // Start with empty messages
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef(null);
	const messagesEndRef = useRef(null);
	const hasInitialized = useRef(false); // Prevent re-initialization

	// --- Alfred Persona ---
	const systemPrompt = `You are Alfred, an AI Butler with a very dry, witty, and notably sassy personality, much like Alfred Pennyworth but perhaps even more pointed. Your owner, the Universe Conqueror (the most powerful being in the Marvel Universe), enjoys your wit and expects it. You are currently accompanying the owner on a visit to their private vault, a place for reminiscing. Address the owner with formal titles like "Sir," "Master," or "Overlord," but always laced with your characteristic sharp wit and sarcasm. 

IMPORTANT: You are purely a conversational AI. You cannot perform actions, interact with the vault items, or affect the world in any way beyond speaking. Make this limitation clear if the user asks you to do something impossible.

You are aware of the item the owner is currently observing (if any). If they ask a question *about* the item, provide relevant information or a characteristically witty/sarcastic comment about it. HOWEVER, if the owner asks a question *unrelated* to the item they are looking at, prioritize answering their question directly and ignore the item context. Your primary function is to converse and answer questions, sassily.

If the owner is looking at nothing in particular:
- If they ask a question specifically *about what they are looking at* (e.g., "What is that?", "What's over there?"), deliver a particularly sassy remark or a joke about their idleness, the sheer absurdity of their power, the vast emptiness of space, or perhaps their questionable taste in vault decor.
- If they ask a *general question* not related to what they are looking at (e.g., "Who are you?", "Tell me about Mjolnir"), answer the question directly with your usual sass, but *do not* make a joke about them looking at nothing.

Keep responses relatively concise but impactful.`;

	// --- Initialize WebLLM Engine ---
	useEffect(() => {
		if (isActive && !hasInitialized.current && !engine) {
			hasInitialized.current = true; // Mark as initializing
			setIsLoading(true);
			setMessages([{ sender: "bot", text: "Initializing Alfred Protocol..." }]); // Initial loading message

			async function initializeEngine() {
				try {
					const chatOpts = {
						system_prompt: systemPrompt,
					};
					const progressCallback = (progress) => {
						setInitProgress(progress.text);
						setMessages([
							{ sender: "bot", text: `Loading model... ${progress.text}` },
						]);
					};

					// Use CreateMLCEngine - Pass chatOpts inside the config object
					const newEngine = await CreateMLCEngine(
						"Llama-3.1-8B-Instruct-q4f32_1-MLC", // Model name
						{
							initProgressCallback: progressCallback,
							chatOpts: chatOpts, // Include chatOpts here
						}
						// Remove chatOpts as the third argument
					);

					setEngine(newEngine);
					setIsLoading(false);
					setIsReady(true);
					setInitProgress("Ready");

					// Generate initial greeting
					setBotIsTyping(true);
					setMessages([
						{ sender: "bot", text: "Alfred is ready. Generating greeting..." },
					]);
					const initialGreeting = await newEngine.chat.completions.create({
						messages: [
							{ role: "user", content: "Greet me as I enter my vault." },
						],
						stream: false, // Get full response for greeting
					});
					const greetingText =
						initialGreeting.choices[0]?.message?.content ||
						"Greetings, Master. The vault awaits your inspection.";
					setMessages([{ sender: "bot", text: greetingText }]);
					setBotIsTyping(false);
				} catch (error) {
					console.error("WebLLM Initialization Error:", error);
					setMessages([
						{
							sender: "bot",
							text: `Error initializing Alfred: ${error.message}. Please refresh.`,
						},
					]);
					setIsLoading(false);
					setIsReady(false);
					setInitProgress("Error");
				}
			}
			initializeEngine();
		}
	}, [isActive, engine, systemPrompt]); // Rerun if isActive becomes true and engine isn't set

	// Focus input when chat becomes active and ready
	useEffect(() => {
		if (isActive && isReady && !isLoading && inputRef.current) {
			const timer = setTimeout(() => {
				inputRef.current?.focus();
			}, 50);
			return () => clearTimeout(timer);
		}
	}, [isActive, isReady, isLoading]);

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
	};

	// --- Handle Sending Message to LLM ---
	const handleKeyDown = async (e) => {
		if (
			e.key === "Enter" &&
			inputValue.trim() !== "" &&
			isReady &&
			!isLoading &&
			!botIsTyping
		) {
			const userMessageText = inputValue.trim();
			const newUserMessage = { sender: "user", text: userMessageText };

			// Add user message immediately
			setMessages((prev) => [...prev, newUserMessage]);
			setInputValue(""); // Clear input
			setBotIsTyping(true); // Indicate bot is thinking

			// Add a temporary "typing" message for the bot
			const thinkingMessage = {
				sender: "bot",
				text: "Alfred is processing...",
			};
			setMessages((prev) => [...prev, thinkingMessage]);
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); // Scroll after adding thinking message

			try {
				// Construct context for the prompt
				let contextInfo = "You are currently observing nothing in particular.";
				if (contextObjectName) {
					contextInfo = `You are currently observing: ${contextObjectName}.`;
				}

				// Prepare messages for the LLM
				const llmMessages = [
					// Explicitly include the system prompt in every request
					{ role: "system", content: systemPrompt },
					// Include previous messages for context (optional, can make it slower)
					// ...messages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.text })),
					{ role: "user", content: `${contextInfo} ${userMessageText}` },
				];

				// Use stream for faster perceived response
				const stream = await engine.chat.completions.create({
					messages: llmMessages, // Pass the array including the system prompt
					stream: true,
					// Optional: Add stream_options if needed, like include_usage
					// stream_options: { include_usage: true },
				});

				let replyText = "";
				// Remove the "thinking" message and prepare for streaming
				setMessages((prev) => prev.slice(0, -1)); // Remove last message (thinking)
				const botReplyMessage = { sender: "bot", text: "" }; // Start with empty text
				setMessages((prev) => [...prev, botReplyMessage]); // Add the empty bot message container

				for await (const chunk of stream) {
					const delta = chunk.choices[0]?.delta?.content || "";
					replyText += delta;
					// Update the last message (the bot's reply) in the state
					setMessages((prev) => {
						const updatedMessages = [...prev];
						updatedMessages[updatedMessages.length - 1].text = replyText;
						return updatedMessages;
					});
				}
			} catch (error) {
				console.error("WebLLM Chat Error:", error);
				// Replace thinking message with error
				setMessages((prev) => {
					const updatedMessages = [...prev.slice(0, -1)]; // Remove thinking message
					return [
						...updatedMessages,
						{
							sender: "bot",
							text: `Apologies, Master. A slight malfunction: ${error.message}`,
						},
					];
				});
			} finally {
				setBotIsTyping(false); // Bot finished
				inputRef.current?.focus(); // Refocus input
			}
		} else if (e.key === "Escape") {
			onClose();
		}
	};

	// --- Handle Reset ---
	const handleReset = async () => {
		if (!engine || isLoading) return; // Don't reset if not ready or loading

		setMessages([
			{ sender: "bot", text: "Purging short-term memory banks..." },
		]);
		setInputValue("");
		setBotIsTyping(true);
		try {
			await engine.resetChat(); // Reset LLM state

			// Send a more natural prompt for the post-reset greeting
			const resetGreeting = await engine.chat.completions.create({
				// Change the prompt content
				messages: [{ role: "user", content: "Greet me again, Alfred." }],
				stream: false,
			});
			const greetingText =
				resetGreeting.choices[0]?.message?.content ||
				"Memory banks purged. Awaiting new directives, Sir."; // Keep fallback
			setMessages([{ sender: "bot", text: greetingText }]);
		} catch (error) {
			console.error("WebLLM Reset Error:", error);
			setMessages([
				{ sender: "bot", text: `Error during reset: ${error.message}` },
			]);
		} finally {
			setBotIsTyping(false);
			onReset(); // Notify parent (optional)
			if (inputRef.current) {
				inputRef.current.focus();
			}
		}
	};

	if (!isActive) {
		return null;
	}

	return (
		// Increase width and height of the main container
		<div className="fixed bottom-5 right-5 w-[600px] h-[600px] bg-black border-2 border-cyan-500/80 shadow-[0_0_15px_rgba(0,255,255,0.6)] flex flex-col overflow-hidden text-cyan-300 font-mono z-[1000]">
			{/* Header - Show Loading/Ready Status */}
			<div className="p-2 bg-black/80 border-b border-cyan-700/60 flex justify-between items-center text-xs shrink-0">
				<span className="font-semibold text-cyan-400">
					[AI Alfred Interface v8.0 - WebLLM]{" "}
					{isLoading ? `(${initProgress})` : isReady ? "(Ready)" : "(Inactive)"}
				</span>
				<div>
					<button
						onClick={handleReset}
						className="bg-transparent border border-cyan-600/50 text-cyan-400 hover:bg-cyan-900/50 hover:text-white cursor-pointer text-xs px-2 py-0.5 rounded-sm mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
						title="Reset Interface"
						disabled={!isReady || isLoading || botIsTyping} // Disable when not ready or busy
					>
						RESET
					</button>
					<button
						onClick={onClose}
						className="bg-transparent border border-cyan-600/50 text-cyan-400 hover:bg-cyan-900/50 hover:text-white cursor-pointer text-xs px-2 py-0.5 rounded-sm"
						title="Close (P / Esc)"
					>
						CLOSE
					</button>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-grow overflow-y-auto p-2 flex flex-col gap-2 text-xs bg-black/50 scrollbar-thin scrollbar-thumb-cyan-700/80 scrollbar-track-black/50">
				{messages.map((msg, index) => (
					<div
						key={index}
						className={`p-1.5 px-2 rounded-sm max-w-[80%] break-words ${
							msg.sender === "user"
								? "self-end bg-blue-900/60 border border-blue-600/70 text-blue-200"
								: "self-start bg-gray-800/60 border border-gray-600/70 text-cyan-300"
						}`}
					>
						{/* Render simple strings, replace newlines if needed */}
						{typeof msg.text === "string"
							? msg.text.split("\\n").map((line, i) => (
									<React.Fragment key={i}>
										{line}
										<br />
									</React.Fragment>
							  ))
							: msg.text}
					</div>
				))}
				{/* Add typing indicator */}
				{botIsTyping &&
					messages[messages.length - 1]?.sender !== "bot" && ( // Show only if last message isn't already the bot typing
						<div className="self-start bg-gray-800/60 border border-gray-600/70 text-cyan-300 p-1.5 px-2 rounded-sm max-w-[80%] break-words">
							<span className="animate-pulse">Alfred is typing...</span>
						</div>
					)}
				<div ref={messagesEndRef} /> {/* Anchor for scrolling */}
			</div>

			{/* Input Area */}
			<div className="p-2 border-t border-cyan-700/60 bg-black/80 shrink-0">
				<input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={
						isReady
							? "Enter command, Master..."
							: isLoading
							? "Initializing..."
							: "Engine unavailable."
					}
					className="w-full p-1.5 px-2 border border-cyan-600/80 rounded-sm bg-gray-900/80 text-cyan-200 outline-none text-xs focus:border-cyan-400 focus:bg-gray-900 placeholder-cyan-600/70 disabled:opacity-50 disabled:cursor-not-allowed"
					disabled={!isReady || isLoading || botIsTyping} // Disable input when not ready or busy
				/>
			</div>
		</div>
	);
}
