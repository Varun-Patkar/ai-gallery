"use client";

import React, { useRef, useEffect, useState } from "react"; // Added useState
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
// Import Rapier components and hooks
import { RigidBody, CapsuleCollider, useRapier } from "@react-three/rapier";
import * as THREE from "three";

// Re-add isChatActive to props
export default function PlayerControls({ onLock, onUnlock, isChatActive }) {
	const { camera, gl } = useThree();
	const controlsRef = useRef();
	const playerRef = useRef(); // Ref for the RigidBody
	const { rapier, world } = useRapier(); // Get physics world
	const initialRotationSet = useRef(false); // Flag for initial rotation

	// Movement states
	const moveForward = useRef(false);
	const moveBackward = useRef(false);
	const moveLeft = useRef(false);
	const moveRight = useRef(false);
	const sprint = useRef(false);
	// Removed jump ref
	// const jump = useRef(false);

	// Movement parameters
	const speed = 2.2; // Increased speed from 1.8 to 2.2
	const sprintMultiplier = 2.0; // Increased sprint multiplier from 1.8 to 2.0
	const airControlFactor = 0.3; // How much control in the air
	const maxVelocity = 5.0; // Increased max velocity
	const maxSprintVelocity = maxVelocity * sprintMultiplier; // Max velocity when sprinting

	// Helper vectors
	const frontVector = new THREE.Vector3();
	const sideVector = new THREE.Vector3();
	const direction = new THREE.Vector3();
	const currentVel = new THREE.Vector3();

	// Ground check state
	const [isOnGround, setIsOnGround] = useState(false);

	// Re-add useEffect that managed pointer lock based on chat state
	useEffect(() => {
		const managePointerLock = () => {
			if (isChatActive) {
				if (
					document.pointerLockElement === gl.domElement ||
					document.pointerLockElement
				) {
					document.exitPointerLock();
				}
			}
		};
		managePointerLock();
		document.addEventListener("pointerlockchange", managePointerLock, false);
		document.addEventListener("mozpointerlockchange", managePointerLock, false);
		document.addEventListener(
			"webkitpointerlockchange",
			managePointerLock,
			false
		);
		return () => {
			document.removeEventListener(
				"pointerlockchange",
				managePointerLock,
				false
			);
			document.removeEventListener(
				"mozpointerlockchange",
				managePointerLock,
				false
			);
			document.removeEventListener(
				"webkitpointerlockchange",
				managePointerLock,
				false
			);
		};
	}, [isChatActive, gl.domElement]);

	useEffect(() => {
		// ... existing keydown/keyup listeners ...
		const onKeyDown = (event) => {
			// Re-add check for isChatActive
			if (isChatActive) {
				switch (event.code) {
					case "KeyW":
					case "ArrowUp":
					case "KeyA":
					case "ArrowLeft":
					case "KeyS":
					case "ArrowDown":
					case "KeyD":
					case "ArrowRight":
					case "ShiftLeft":
					case "ShiftRight":
						return; // Stop processing movement keys if chat is active
				}
			}

			// Process keys only if chat is NOT active
			switch (event.code) {
				case "KeyW":
				case "ArrowUp":
					moveForward.current = true;
					break;
				case "KeyA":
				case "ArrowLeft":
					moveLeft.current = true;
					break;
				case "KeyS":
				case "ArrowDown":
					moveBackward.current = true;
					break;
				case "KeyD":
				case "ArrowRight":
					moveRight.current = true;
					break;
				case "ShiftLeft":
				case "ShiftRight":
					sprint.current = true;
					break;
				// Removed Space case
				// case "Space":
				// 	jump.current = true;
				// 	break;
			}
		};

		const onKeyUp = (event) => {
			// Always reset flags on keyup
			switch (event.code) {
				case "KeyW":
				case "ArrowUp":
					moveForward.current = false;
					break;
				case "KeyA":
				case "ArrowLeft":
					moveLeft.current = false;
					break;
				case "KeyS":
				case "ArrowDown":
					moveBackward.current = false;
					break;
				case "KeyD":
				case "ArrowRight":
					moveRight.current = false;
					break;
				case "ShiftLeft":
				case "ShiftRight":
					sprint.current = false;
					break;
				// No need to track keyUp for jump, it's an impulse
			}
		};

		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("keyup", onKeyUp);

		// ... existing lock/unlock handlers ...
		const handleLock = () => {
			// Re-add check for isChatActive
			if (isChatActive) {
				document.exitPointerLock();
				return;
			}
			if (onLock) {
				onLock();
			}
		};

		const handleUnlock = () => {
			// Re-add check for isChatActive
			if (!isChatActive && onUnlock) {
				onUnlock();
			}
		};

		controlsRef.current?.addEventListener("lock", handleLock);
		controlsRef.current?.addEventListener("unlock", handleUnlock);

		// --- Click Handler ---
		const handleClick = () => {
			// Re-add check for isChatActive
			if (isChatActive) {
				return;
			}

			if (controlsRef.current && !controlsRef.current.isLocked) {
				// Check if pointer lock is allowed by the browser
				if (document.pointerLockElement !== gl.domElement) {
					// Check if lock returns a promise before using .catch
					const lockPromise = controlsRef.current.lock();
					if (lockPromise && typeof lockPromise.catch === "function") {
						lockPromise.catch((err) => {
							// Removed console.error("Failed to lock pointer:", err);
						});
					} else {
						// Removed console.warn(...)
					}
				}
			}
		};
		gl.domElement.addEventListener("click", handleClick);

		// --- Set Initial Camera Rotation ---
		if (camera && !initialRotationSet.current) {
			// Set rotation directly from provided values
			const initialPitch = -0.27; // X rotation
			const initialYaw = 1.58; // Y rotation

			camera.rotation.order = "YXZ"; // Ensure correct rotation order
			camera.rotation.y = initialYaw;
			camera.rotation.x = initialPitch;
			camera.rotation.z = 0; // Ensure Z is zero

			initialRotationSet.current = true; // Mark as set
		}

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("keyup", onKeyUp);
			gl.domElement.removeEventListener("click", handleClick);
			controlsRef.current?.removeEventListener("lock", handleLock);
			controlsRef.current?.removeEventListener("unlock", handleUnlock);
		};
		// Re-add isChatActive to dependency array
	}, [gl, onLock, onUnlock, camera, isChatActive]); // Added camera to dependency array

	useFrame((state, delta) => {
		if (!playerRef.current || !controlsRef.current) return;

		// Get player's current position and velocity
		const playerPosition = playerRef.current.translation();
		currentVel.copy(playerRef.current.linvel());

		// --- Ground Check ---
		// Raycast slightly below the capsule center
		const rayOrigin = { ...playerPosition, y: playerPosition.y - 0.5 }; // Center of bottom sphere
		const rayDir = { x: 0, y: -1, z: 0 };
		const maxDistance = 0.1; // Short distance check
		const groundHit = world.castRay(
			new rapier.Ray(rayOrigin, rayDir),
			maxDistance,
			true,
			rapier.QueryFilterFlags.EXCLUDE_DYNAMIC,
			null,
			playerRef.current.collider(0)
		);
		// Ensure hit is valid and within distance
		const _isOnGround = groundHit !== null && groundHit.toi <= maxDistance;
		if (_isOnGround !== isOnGround) {
			setIsOnGround(_isOnGround);
		}

		// --- Movement Calculation ---
		// Re-add check for isChatActive
		const canMove = controlsRef.current.isLocked && !isChatActive;

		if (canMove) {
			// Get camera direction
			camera.getWorldDirection(frontVector);
			sideVector.copy(frontVector).cross(camera.up);

			// Calculate movement direction based on input
			direction
				.set(0, 0, 0)
				.addScaledVector(
					frontVector,
					(moveForward.current ? 1 : 0) - (moveBackward.current ? 1 : 0)
				)
				.addScaledVector(
					sideVector,
					(moveRight.current ? 1 : 0) - (moveLeft.current ? 1 : 0)
				);
			direction.normalize();

			const isMoving =
				moveForward.current ||
				moveBackward.current ||
				moveLeft.current ||
				moveRight.current;

			// Apply movement impulse only if moving
			if (isMoving) {
				const currentMaxVel = sprint.current ? maxSprintVelocity : maxVelocity;
				const currentSpeed =
					(sprint.current ? speed * sprintMultiplier : speed) *
					(isOnGround ? 1 : airControlFactor);

				// Calculate desired impulse
				const impulse = direction
					.clone()
					.multiplyScalar(currentSpeed * delta * 10); // Adjust multiplier if needed
				impulse.y = 0;

				// Apply impulse
				playerRef.current.applyImpulse(impulse, true);

				// Clamp velocity
				const clampedVel = playerRef.current.linvel();
				const horizontalVel = new THREE.Vector2(clampedVel.x, clampedVel.z);
				if (horizontalVel.length() > currentMaxVel) {
					horizontalVel.normalize().multiplyScalar(currentMaxVel);
					playerRef.current.setLinvel(
						{ x: horizontalVel.x, y: clampedVel.y, z: horizontalVel.y },
						true
					);
				}
			}

			// --- Damping ---
			// If on ground and not actively moving, significantly damp horizontal velocity
			if (isOnGround && !isMoving) {
				playerRef.current.setLinvel(
					{ x: currentVel.x * 0.1, y: currentVel.y, z: currentVel.z * 0.1 },
					true
				);
			}
		} else {
			// Apply strong damping if controls are unlocked OR chat is active
			playerRef.current.setLinvel(
				{ x: currentVel.x * 0.1, y: currentVel.y, z: currentVel.z * 0.1 },
				true
			);
			// Reset movement flags if chat is active or controls just unlocked
			if (isChatActive || !controlsRef.current.isLocked) {
				moveForward.current = false;
				moveBackward.current = false;
				moveLeft.current = false;
				moveRight.current = false;
				sprint.current = false;
			}
		}

		// --- Camera Update ---
		// Keep camera position synced with the RigidBody, raise the eye level
		camera.position.set(
			playerPosition.x,
			playerPosition.y + 1.6, // Increased eye height offset (previously 0.7)
			playerPosition.z
		);
	});

	return (
		<>
			<PointerLockControls ref={controlsRef} />
			{/* Player RigidBody and Collider */}
			<RigidBody
				ref={playerRef}
				colliders={false} // We'll add the collider manually
				// Updated initial position based on provided values (keeping Y offset)
				position={[17.31, 0.67, -12.36]}
				linearDamping={0} // We handle damping manually
				angularDamping={1.0} // Prevent player capsule from rotating
				lockRotations // Lock rotations
				enabledRotations={[false, false, false]} // Explicitly disable rotations
				ccdEnabled // Enable Continuous Collision Detection
			>
				{/* Capsule collider for the player */}
				<CapsuleCollider args={[0.5, 0.3]} /> {/* args: [halfHeight, radius] */}
			</RigidBody>
		</>
	);
}
