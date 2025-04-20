import React, { useEffect, useRef } from "react";

// Accept messages prop
// Wrap the component definition with React.memo
const DynamicContent = React.memo(({ messages }) => {
	const messagesEndRef = useRef(null);

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		// Container with futuristic styling, matching Chatbot dimensions
		// Add explicit width and height styles here
		<div
			className="w-[400px] h-[400px] bg-black border-2 border-cyan-500/80 shadow-[0_0_15px_rgba(0,255,255,0.6)] flex flex-col overflow-hidden text-cyan-300 font-mono"
			style={{ width: "400px", height: "400px" }} // Add fixed dimensions
		>
			{/* Header */}
			<div className="p-2 bg-black/80 border-b border-cyan-700/60 flex justify-between items-center text-xs shrink-0">
				<span className="font-semibold text-cyan-400">[AI Alfred - Log]</span>
				{/* No buttons needed for display */}
			</div>

			{/* Messages Area - Copied structure and styling from Chatbot */}
			<div className="flex-grow overflow-y-auto p-2 flex flex-col gap-2 text-xs bg-black/50 scrollbar-thin scrollbar-thumb-cyan-700/80 scrollbar-track-black/50">
				{/* Map over the messages prop - Add check for messages array */}
				{Array.isArray(messages) &&
					messages.map((msg, index) => (
						<div
							key={index} // Keep React list key
							className={`p-1.5 px-2 rounded-sm max-w-[80%] break-words ${
								msg.sender === "user"
									? "self-end bg-blue-900/60 border border-blue-600/70 text-blue-200"
									: "self-start bg-gray-800/60 border border-gray-600/70 text-cyan-300"
							}`}
						>
							{/* Add safety check for msg.text */}
							{msg?.text ?? ""}
						</div>
					))}
				<div ref={messagesEndRef} /> {/* Anchor for scrolling */}
			</div>
			{/* No Input Area needed */}
		</div>
	);
}); // Close React.memo

// Set display name for better debugging
DynamicContent.displayName = "DynamicContent";

export default DynamicContent;
