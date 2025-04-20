import React, { useRef } from "react"; // Import useRef
// Import useTexture - Remove SpotLight import
import { Box, useTexture } from "@react-three/drei";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three"; // Import THREE for texture settings

export default function Pedestal({ position = [0, 0, 0], size = [1, 1, 1] }) {
	const pedestalHeight = size[1];
	const pedestalBaseSize = [size[0], size[2]]; // Width and depth
	// Remove spotLightTargetRef
	// const spotLightTargetRef = useRef();

	// Load textures using the provided filenames
	const texturePaths = [
		"/gallery/textures/Metal01_baseColor.jpeg", // Updated base color
		"/gallery/textures/Metal02_normal.png", // Updated normal map
		"/gallery/textures/Metal03_metallicRoughness.png", // Combined metallic/roughness
	];
	// Adjust destructuring based on loaded textures
	const textures = useTexture(texturePaths);
	const [baseColorMap, normalMap, metallicRoughnessMap] = textures;

	// Check if all textures loaded successfully
	const texturesLoaded = textures.every(
		(texture) => texture instanceof THREE.Texture
	);

	if (texturesLoaded) {
		// Optional: Adjust texture wrapping if needed
		textures.forEach((texture) => {
			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			// texture.repeat.set(1, 1); // Adjust repeat values if necessary
		});
	} else {
		// Removed console.error(...)
	}

	// Calculate collider position relative to the RigidBody center
	// Since the Box origin is at its center, and RigidBody origin is also at its center,
	// the collider args match the Box args directly.
	const colliderArgs = [
		pedestalBaseSize[0] / 2,
		pedestalHeight / 2,
		pedestalBaseSize[1] / 2,
	];

	return (
		<RigidBody
			type="fixed" // Make it static
			colliders={false} // Disable auto-collider, we'll add manually
			position={position} // Position the whole pedestal
		>
			<Box args={size} castShadow receiveShadow>
				{/* Apply textures only if loaded, otherwise use fallback color */}
				<meshStandardMaterial
					map={texturesLoaded ? baseColorMap : null}
					normalMap={texturesLoaded ? normalMap : null}
					// Apply the combined map to both roughness and metalness
					roughnessMap={texturesLoaded ? metallicRoughnessMap : null}
					metalnessMap={texturesLoaded ? metallicRoughnessMap : null}
					color={texturesLoaded ? "white" : "grey"} // Use white base if textured, grey otherwise
					// Ensure metalness is 1.0 if using a map that defines it
					metalness={texturesLoaded ? 1.0 : 0.0}
					// Roughness is controlled by the map, no need to set a value here unless map is missing
					// roughness={texturesLoaded ? 1.0 : 0.5}
				/>
			</Box>
			<CuboidCollider args={colliderArgs} />

			{/* Remove the invisible object that acted as the SpotLight target */}
			{/* <object3D
				ref={spotLightTargetRef}
				position={[0, -pedestalHeight, 0]}
			/> */}

			{/* Remove the SpotLight component */}
			{/* <SpotLight
				// ... props ...
			/> */}
		</RigidBody>
	);
}
