"use client";

import React from "react";

// Accept expanded state, toggle handler, music state, and music toggle handler
export default function ControlsInfo({
	expanded,
	onToggle,
	isMusicPlaying,
	onToggleMusic,
}) {
	return (
		<div
			style={{
				position: "absolute",
				top: "10px",
				right: "10px",
				backgroundColor: "rgba(0, 0, 0, 0.6)",
				color: "white",
				padding: "10px 15px",
				borderRadius: "5px",
				zIndex: 10,
				fontSize: "12px",
				fontFamily: "sans-serif",
				pointerEvents: "none",
				cursor: "default",
			}}
		>
			{/* Header toggle */}
			<div
				onClick={onToggle}
				style={{
					cursor: "pointer",
					pointerEvents: "auto",
					display: "inline-block",
					marginBottom: "5px", // Always have a small margin below header
					userSelect: "none",
				}}
			>
				<b>Controls:</b> {expanded ? "[Hide]" : "[Show]"}
			</div>

			{/* Conditionally render the main controls list */}
			{expanded && (
				<div style={{ marginBottom: "10px" }}>
					{" "}
					{/* Add margin below list */}
					W / ↑ : Forward
					<br />
					A / ← : Strafe Left
					<br />
					S / ↓ : Backward
					<br />
					D / → : Strafe Right
					<br />
					Shift : Sprint
					<br />
					Click : Lock Mouse
					<br />
					Esc : Unlock Mouse
					<br />P : Toggle AI Alfred
					<br />M : Toggle Music {/* Add M key info */}
				</div>
			)}

			{/* Always visible Music Toggle Button */}
			<button
				onClick={onToggleMusic}
				style={{
					background: "none",
					border: "1px solid white",
					color: "white",
					padding: "2px 5px",
					fontSize: "10px",
					cursor: "pointer",
					pointerEvents: "auto",
					marginTop: expanded ? "0px" : "5px", // Adjust top margin based on expansion
					display: "block", // Make it block to appear below list
					marginBottom: "8px", // Add margin below button
					userSelect: "none",
				}}
			>
				Music: {isMusicPlaying ? "On" : "Off"} (M) {/* Add (M) hint */}
			</button>

			{/* Always visible Attribution text */}
			<div
				style={{
					// Removed marginTop, handled by button margin
					fontSize: "10px",
					opacity: 0.7,
				}}
			>
				<a
					href="https://skfb.ly/oEyUM"
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: "white",
						textDecoration: "none",
						pointerEvents: "auto",
					}}
				>
					"Metallic Showroom Gallery" by jimbogies
				</a>
				<br />
				Licensed under{" "}
				<a
					href="http://creativecommons.org/licenses/by/4.0/"
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: "white",
						textDecoration: "none",
						pointerEvents: "auto",
					}}
				>
					CC BY 4.0
				</a>
				<br />
				{/* Music Attribution */}
				Music by{" "}
				<a
					href="https://pixabay.com/users/fopihe-49678680/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=325508"
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: "white",
						textDecoration: "none",
						pointerEvents: "auto",
					}}
				>
					Fopihe
				</a>{" "}
				from{" "}
				<a
					href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=325508"
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: "white",
						textDecoration: "none",
						pointerEvents: "auto",
					}}
				>
					Pixabay
				</a>
			</div>
		</div>
	);
}
