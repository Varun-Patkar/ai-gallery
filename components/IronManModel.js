import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Remove isHighlighted prop
export default function IronManModel({ position = [0, 0, 0], scale = 1 }) {
	const groupRef = useRef();
	const { scene } = useGLTF("/ironman/scene.gltf");

	// Apply userData to the group for easier raycasting target
	useEffect(() => {
		if (groupRef.current) {
			groupRef.current.userData = {
				interactable: true,
				name: "Iron Man's Mk 1 (Undamaged)",
			};
		}
	}, []);

	// Traverse the model once on load to set shadows
	useEffect(() => {
		scene.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
	}, [scene]);

	// Wrap primitive in a group
	return (
		<group ref={groupRef} position={position} scale={scale}>
			<primitive object={scene} rotation={[0, Math.PI / 2, 0]} />
		</group>
	);
}

useGLTF.preload("/ironman/scene.gltf");
