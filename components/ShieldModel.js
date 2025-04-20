import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Remove isHighlighted prop
export default function ShieldModel({
	position = [0, 0, 0],
	scale = 1,
	rotation = [0, 0, 0],
	// isHighlighted = false, // Removed
}) {
	const groupRef = useRef();
	const { scene } = useGLTF("/captamerica/scene.gltf");
	// const originalMaterials = useRef({}); // Removed

	// Apply userData to the group for easier raycasting target
	useEffect(() => {
		if (groupRef.current) {
			groupRef.current.userData = {
				interactable: true,
				name: "Captain America's Shield (Undamaged by Thanos)", // Set the name
			};
		}
	}, []);

	// Remove Handle highlighting effect useEffect
	// useEffect(() => { ... }, [isHighlighted]);

	// Traverse the model once on load to set shadows and adjust materials
	useEffect(() => {
		if (!scene) return; // Guard against scene not being loaded yet

		scene.traverse((child) => {
			if (child.isMesh) {
				// Shadows
				child.castShadow = true;
				child.receiveShadow = true;

				// Material Adjustments
				if (child.material && child.material.isMeshStandardMaterial) {
					child.material.metalness = 0.8; // Keep working value
					child.material.roughness = 0.2; // Keep working value
					child.material.needsUpdate = true;
				}
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
useGLTF.preload("/captamerica/scene.gltf");
