"use client";

import React, { useState, Suspense, useRef, useEffect } from "react";
// Import useThree (will be used in SceneLogic)
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
	Stats,
	useGLTF,
	OrbitControls,
	Sky,
	Clouds,
	Cloud,
	Html,
	SpotLight, // Add SpotLight here
} from "@react-three/drei";
// Add CuboidCollider to the import
import {
	Physics,
	RigidBody,
	TrimeshCollider,
	CuboidCollider,
} from "@react-three/rapier";
import * as THREE from "three";

import ControlsInfo from "./ControlsInfo";
import PlayerControls from "./PlayerControls";
import Pedestal from "./Pedestal";
import DynamicContent from "./DynamicContent"; // Ensure DynamicContent is imported
import Chatbot from "./Chatbot"; // Keep Chatbot import for the overlay
import IronManModel from "./IronManModel"; // Import the new model component
import ShieldModel from "./ShieldModel"; // Import the shield model component
import MjolnirModel from "./MjolnirModel"; // Import the Mjolnir model component
import SpiderManMaskModel from "./SpiderManMaskModel"; // Import the Spider-Man mask model component

// Component to load and display the GLTF model with physics
function GalleryModel() {
	const { scene } = useGLTF("/gallery/scene.gltf");
	const modelRef = useRef();

	// Scale down the model further
	const scale = 0.05; // Halved the scale again (0.1 -> 0.05)
	const position = [0, -0.125, 0]; // Adjusted Y position based on new scale

	// Traverse only for shadows now
	scene.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;

			// Make sure meshes are visible again if previously hidden
			if (child.material) {
				const materialName = child.material.name;
				if (materialName === "Welcome_Sign" || materialName === "Note") {
					child.visible = true; // Ensure they are visible
				}
			}
		}
	});

	return (
		<RigidBody
			type="fixed"
			colliders="trimesh"
			ref={modelRef}
			scale={scale}
			position={position}
		>
			<primitive object={scene} />
		</RigidBody>
	);
}

// --- Internal component using R3F hooks ---
// Add setHighlightedObjectPosition prop
function SceneLogic({
	isChatActive,
	highlightedObjectName,
	setHighlightedObjectName,
	setHighlightedObjectPosition, // New prop
	highlightedObjectPosition, // Add prop
}) {
	const raycaster = useRef(new THREE.Raycaster());
	const { camera, scene: threeScene } = useThree();
	const tempVec = useRef(new THREE.Vector3()).current; // Reusable vector for position

	useFrame(() => {
		let newHighlightedName = null;
		let newHighlightedPosition = null;

		if (!isChatActive) {
			raycaster.current.setFromCamera({ x: 0, y: 0 }, camera);
			const intersects = raycaster.current.intersectObjects(
				threeScene.children,
				true
			);
			let closestInteractable = null;
			let minDistance = Infinity;

			for (const intersect of intersects) {
				let currentObject = intersect.object;
				while (currentObject) {
					if (currentObject.userData.interactable) {
						// Add distance limit (e.g., 10 units)
						if (intersect.distance < minDistance && intersect.distance <= 10) {
							minDistance = intersect.distance;
							closestInteractable = currentObject;
						}
						break;
					}
					if (currentObject === threeScene) break;
					currentObject = currentObject.parent;
				}
			}

			if (closestInteractable) {
				newHighlightedName = closestInteractable.userData.name;
				// Get world position of the highlighted object
				closestInteractable.getWorldPosition(tempVec);
				newHighlightedPosition = tempVec.clone(); // Clone to store
			}
		}

		// Update state only if changed
		if (newHighlightedName !== highlightedObjectName) {
			setHighlightedObjectName(newHighlightedName);
			setHighlightedObjectPosition(newHighlightedPosition); // Update position state
		} else if (
			newHighlightedPosition &&
			highlightedObjectName && // Ensure name is also set
			!highlightedObjectPosition?.equals(newHighlightedPosition) // Check if position actually changed
		) {
			// If name is same but position differs (e.g., moving object), update position
			setHighlightedObjectPosition(newHighlightedPosition);
		} else if (!newHighlightedName && highlightedObjectName) {
			// If previously highlighted but now not, clear both
			setHighlightedObjectName(null);
			setHighlightedObjectPosition(null);
		}
	});

	return null;
}
// --- End Internal Component ---

export default function Scene() {
	const [showAccelTip, setShowAccelTip] = useState(true);
	const [controlsExpanded, setControlsExpanded] = useState(true);
	// Re-add isChatActive state
	const [isChatActive, setIsChatActive] = useState(false);
	const [isMusicPlaying, setIsMusicPlaying] = useState(false); // Music state
	const audioRef = useRef(null); // Ref for the audio element
	const audioPath = "/calm-gaming-flow-325508.mp3"; // Define path clearly
	const [highlightedObjectName, setHighlightedObjectName] = useState(null); // State for highlighted object name
	const [contextObjectName, setContextObjectName] = useState(null); // State for chatbot context
	// Add state for highlighted object position
	const [highlightedObjectPosition, setHighlightedObjectPosition] =
		useState(null);
	const highlightLightTargetRef = useRef(new THREE.Object3D()); // Target for the highlight light

	// Handle lock event
	const handleLock = () => {
		setShowAccelTip(false);
		setControlsExpanded(true);
	};

	// Define handler for unlock event
	const handleUnlock = () => {
		setShowAccelTip(true);
		setControlsExpanded(false);
	};

	// Function to toggle controls expansion manually
	const toggleControls = () => {
		setControlsExpanded(!controlsExpanded);
	};

	// Update useEffect for 'P' and 'M' key press
	useEffect(() => {
		const handleKeyDown = (event) => {
			// Check if focus is on an input element
			const isInputFocused = document.activeElement?.tagName === "INPUT";

			if ((event.key === "p" || event.key === "P") && !isInputFocused) {
				// Toggle chat state and set/clear context object name
				setIsChatActive((prev) => {
					const nextIsActive = !prev;
					if (nextIsActive) {
						// Set context when opening chat
						setContextObjectName(highlightedObjectName);
					} else {
						// Clear context when closing chat
						setContextObjectName(null);
					}
					return nextIsActive;
				});
			} else if (
				(event.key === "m" || event.key === "M") &&
				!isInputFocused &&
				!isChatActive // Only toggle music if chat is NOT active
			) {
				toggleMusic(); // Call the existing toggle function
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
		// Add isChatActive to dependency array as its value is used in the handler
	}, [isChatActive, highlightedObjectName]);

	// --- Chatbot Handlers (used by both overlay and in-scene chatbot) ---
	// Simplify handleSendMessage - it no longer needs to update chatHistory
	const handleSendMessage = (message, contextName) => {
		// Logic for sending message to a real backend API would go here
		console.log(
			`Message to send (Context: ${contextName ?? "Nothing"}):`,
			message
		);
	};

	const handleResetChat = () => {
		// Logic for resetting backend state if needed
		console.log("Chat Reset triggered");
	};

	// Re-add handleCloseChat
	const handleCloseChat = () => {
		setIsChatActive(false);
		setContextObjectName(null); // Ensure context is cleared on manual close
	};

	// Effect to manage audio playback
	useEffect(() => {
		if (!audioRef.current) {
			// NOTE: If you encounter 'MEDIA_ELEMENT_ERROR: Format error',
			// the audio file itself might be corrupted or in an unsupported encoding.
			// Try verifying the file integrity or converting it to another format (e.g., .ogg).
			audioRef.current = new Audio(audioPath); // Use defined path
			audioRef.current.loop = true;
			audioRef.current.volume = 0.3;

			// Add error listener for loading issues
			audioRef.current.addEventListener("error", (e) => {
				if (audioRef.current?.error) {
				}
				// Consider setting isMusicPlaying to false if loading fails
				// setIsMusicPlaying(false);
			});

			// Optional: Listener for when audio can play (successful load)
			audioRef.current.addEventListener("canplaythrough", () => {});
		}

		if (isMusicPlaying) {
			// Play might return a promise, handle potential errors
			const playPromise = audioRef.current.play();
			if (playPromise !== undefined) {
				playPromise.catch((error) => {
					// Log the specific error encountered during play()
					// Maybe set isMusicPlaying back to false if autoplay fails due to browser policy
					// setIsMusicPlaying(false);
				});
			}
		} else {
			// Ensure audioRef.current exists and is not already paused before pausing
			if (audioRef.current && !audioRef.current.paused) {
				audioRef.current.pause();
			}
		}

		// Cleanup function to pause audio if component unmounts
		return () => {
			audioRef.current?.pause();
			// Optional: Remove listeners on cleanup if needed, though often handled by GC
		};
		// Add audioPath to dependencies, although it's constant here, it's good practice
	}, [isMusicPlaying, audioPath]);

	// Handler to toggle music state
	const toggleMusic = () => {
		setIsMusicPlaying((prev) => !prev);
	};

	// Update target position when highlightedObjectPosition changes
	useEffect(() => {
		if (highlightedObjectPosition) {
			highlightLightTargetRef.current.position.copy(highlightedObjectPosition);
		}
	}, [highlightedObjectPosition]);

	return (
		<div
			style={{
				height: "100vh",
				width: "100vw",
				background: "black",
				overflow: "hidden",
				position: "relative",
			}}
		>
			{/* Acceleration Tip Overlay */}
			{showAccelTip && (
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						backgroundColor: "rgba(0, 0, 0, 0.8)",
						color: "white",
						padding: "30px 40px",
						borderRadius: "10px",
						zIndex: 10,
						textAlign: "center",
						fontSize: "24px",
						maxWidth: "80%",
						pointerEvents: "none",
					}}
				>
					For the best performance, please ensure "Use graphics acceleration
					when available" is enabled in your browser settings (e.g., Chrome
					Settings &gt; System). <br />
					<br /> Click screen to start.
				</div>
			)}

			{/* Pass music state and toggle handler to ControlsInfo */}
			<ControlsInfo
				expanded={controlsExpanded}
				onToggle={toggleControls}
				isMusicPlaying={isMusicPlaying} // Pass state
				onToggleMusic={toggleMusic} // Pass handler
			/>

			{/* Re-add Chat Active Prompt Overlay */}
			{isChatActive && (
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						backgroundColor: "rgba(0, 0, 0, 0.8)",
						color: "white",
						padding: "20px 30px",
						borderRadius: "10px",
						zIndex: 15,
						textAlign: "center",
						fontSize: "18px",
						maxWidth: "80%",
						pointerEvents: "none",
					}}
				>
					Chat active: Movement is paused.
					<br />
					Press 'P' to close the chat and resume exploring.
				</div>
			)}

			<Canvas shadows camera={{ fov: 75, position: [0, 1.7, 5], far: 1000 }}>
				{/* --- Render SceneLogic component here --- */}
				<SceneLogic
					isChatActive={isChatActive}
					highlightedObjectName={highlightedObjectName}
					setHighlightedObjectName={setHighlightedObjectName}
					setHighlightedObjectPosition={setHighlightedObjectPosition} // Pass setter
					highlightedObjectPosition={highlightedObjectPosition} // Pass state
				/>
				{/* --- End SceneLogic --- */}

				{/* Keep Sky for background color/sun */}
				<Sky
					distance={450000}
					sunPosition={[0, 1, 0]}
					inclination={0}
					azimuth={0.25}
				/>

				{/* Add Clouds component - Adjusting positions based on height */}
				<Clouds material={THREE.MeshStandardMaterial}>
					{/* Higher cloud - keep relatively centered */}
					<Cloud
						segments={70}
						bounds={[45, 18, 45]} // Increased bounds
						volume={28} // Increased volume
						color="#fafafa"
						position={[25, 35, 25]} // Keep this one higher and closer
					/>
				</Clouds>

				<ambientLight intensity={2.5} />
				{/* Reduce shadow casting lights */}
				<pointLight
					position={[5, 2, 5]}
					intensity={15}
					distance={15}
					castShadow // Keep shadow on this one
				/>
				<pointLight
					position={[-5, 2, 5]}
					intensity={15}
					distance={15}
					castShadow={false} // Disable shadow
				/>
				<pointLight
					position={[5, 2, -5]}
					intensity={15}
					distance={15}
					castShadow={false} // Disable shadow
				/>
				<pointLight
					position={[-5, 2, -5]}
					intensity={15}
					distance={15}
					castShadow // Keep shadow on this one
				/>
				<pointLight position={[0, 3, 0]} intensity={10} distance={10} />

				{/* --- Add Highlight Spotlight --- */}
				{highlightedObjectPosition && !isChatActive && (
					<>
						{/* Add the target object to the scene */}
						<primitive object={highlightLightTargetRef.current} />
						<SpotLight
							// Position light at fixed Y=5, using object's X/Z
							position={[
								highlightedObjectPosition.x,
								5, // Fixed Y height
								highlightedObjectPosition.z,
							]}
							target={highlightLightTargetRef.current} // Target the object's position
							angle={Math.PI / 6} // Narrower angle for focus
							penumbra={0.5} // Softer edge
							intensity={15} // Adjust intensity
							distance={10} // Control range
							color="white" // White light for highlighting
							castShadow={false} // No shadow needed for highlight
							decay={1}
						/>
					</>
				)}
				{/* --- End Highlight Spotlight --- */}

				<Physics gravity={[0, -9.81, 0]}>
					<Suspense fallback={null}>
						<GalleryModel />
						{/* --- Add a simple, large floor collider --- */}
						<RigidBody
							type="fixed"
							colliders="cuboid"
							position={[0, -0.2, 0]}
							rotation={[-Math.PI / 2, 0, 0]}
						>
							<CuboidCollider args={[100, 100, 0.1]} />{" "}
							{/* Large, thin plane */}
						</RigidBody>
						{/* --- End Floor Collider --- */}

						<Pedestal position={[14, 0.5, -12.5]} size={[1, 1, 2]} />
						<Pedestal position={[14, 0.5, -17.5]} size={[1, 1, 1]} />
						{/* Third pedestal */}
						<Pedestal position={[22, 0.5, -17.5]} size={[1, 1, 1]} />
						<Pedestal position={[22, 0.5, -12.5]} size={[1, 1, 1]} />
						{/* Wider pedestal, further back */}

						{/* Add Iron Man Model on the first pedestal */}
						{/* Pedestal top is at Y = 0.5 (pos) + 1 (height) / 2 = 1.0 */}
						<IronManModel position={[14, 1.2, -12.5]} scale={130} />

						{/* Shield Model on second pedestal */}
						{/* Lower Y position to catch pedestal light better */}
						<ShieldModel
							position={[14, 2.5, -17.5]} // Lowered Y from 2 to 1.15 (Pedestal top is Y=1.0)
							scale={0.25} // Adjust scale
							rotation={[0, Math.PI / 2 - Math.PI / 6, 0]} // Example rotation
						/>

						{/* Mjolnir Model on third pedestal */}
						{/* Pedestal top is Y=1.0 */}
						<MjolnirModel
							position={[22, 2, -17.5]} // Position on top of the pedestal
							scale={0.001} // Adjust scale as needed
							rotation={[0, Math.PI / 4, 0]} // Example rotation
						/>

						{/* Spider-Man Mask Model on fourth pedestal */}
						{/* Pedestal top is Y=1.0 */}
						<SpiderManMaskModel
							position={[22, 0.5, -12.5]} // Position on top of the fourth pedestal
							scale={1.2} // Adjust scale as needed
							rotation={[0, -Math.PI / 2, 0]} // Example rotation
						/>

						{/* --- Update "Press P" Prompt --- */}
						{/* Condition on position being set */}
						{highlightedObjectPosition && !isChatActive && (
							<Html
								// Position at fixed Y=2.5, using object's X/Z
								position={[
									highlightedObjectPosition.x,
									1, // Fixed Y height
									highlightedObjectPosition.z,
								]}
								center
								distanceFactor={10}
								zIndexRange={[10, 0]}
								occlude={false} // Re-enable occlusion
								eps={0.05}
							>
								<div
									style={{
										background: "rgba(0, 0, 0, 0.7)",
										color: "white",
										padding: "5px 10px",
										borderRadius: "3px",
										fontSize: "12px",
										whiteSpace: "nowrap", // Prevent wrapping
										pointerEvents: "none", // Don't block clicks
									}}
								>
									Press [P] to ask about the {highlightedObjectName}
								</div>
							</Html>
						)}
						{/* --- End Prompt --- */}

						{/* First Sign - Re-add transform, add eps */}
						{/* <Html
							position={[9.1, 2.2, -12.61]} // Re-apply slight position adjustment
							rotation={[0, 1.57, 0]}
							scale={0.29}
							transform // Re-add this prop
							occlude={true} // Keep boolean occlusion
							eps={0.01} // Add epsilon for raycasting precision
							zIndexRange={[16777271, 0]}
							pointerEvents="none"
						>
							<DynamicContent messages={chatHistory} />
						</Html> */}
					</Suspense>
					<PlayerControls
						onLock={handleLock}
						onUnlock={handleUnlock}
						isChatActive={isChatActive} // Keep passing this for the overlay logic
					/>
				</Physics>

				<Stats />
				{/* <OrbitControls /> */}
			</Canvas>

			{/* Re-add overlay Chatbot instance */}
			<Chatbot
				isActive={isChatActive}
				// Pass contextObjectName to the handler when sending message
				onSendMessage={(message) =>
					handleSendMessage(message, contextObjectName)
				}
				onReset={handleResetChat}
				onClose={handleCloseChat}
				contextObjectName={contextObjectName} // Pass the context name
			/>
		</div>
	);
}
