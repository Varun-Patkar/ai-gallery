import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function SpiderManMaskModel({
	position = [0, 0, 0],
	scale = 1,
	rotation = [0, 0, 0],
}) {
	const groupRef = useRef();
	// Load the Spider-Man mask model from the 'peterparkermask' folder
	const { scene } = useGLTF("/peterparkermask/scene.gltf");

	// Apply userData to the group for easier raycasting target
	useEffect(() => {
		if (groupRef.current) {
			groupRef.current.userData = {
				interactable: true,
				name: "Spider-Man/Peter Parker's Mask (Earth 616)", // Set the name for interaction
			};
		}
	}, []);

	// Traverse the model once on load to set shadows and adjust materials if needed
	useEffect(() => {
		if (!scene) return; // Guard against scene not being loaded yet

		scene.traverse((child) => {
			if (child.isMesh) {
				// Shadows
				child.castShadow = true;
				child.receiveShadow = true;

				// Optional: Material Adjustments (if needed)
				// if (child.material && child.material.isMeshStandardMaterial) {
				//     child.material.metalness = 0.1;
				//     child.material.roughness = 0.8;
				//     child.material.needsUpdate = true;
				// }
			}
		});
	}, [scene]); // Run only when scene object changes

	// Wrap primitive in a group to attach ref and userData
	return (
		<group
			ref={groupRef}
			position={position}
			scale={scale}
			rotation={rotation} // Apply rotation
		>
			<primitive object={scene} />
		</group>
	);
}

// Preload the model for better performance
useGLTF.preload("/peterparkermask/scene.gltf");
