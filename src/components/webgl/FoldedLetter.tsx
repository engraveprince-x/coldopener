"use client";

import { useRef } from "react";

export default function FoldedLetter() {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group
      ref={groupRef}
      position={[-1.9, -0.3, -0.4]}
      rotation={[0.08, 0.55, -0.1]}
    >
      {/* Main sheet */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.68, 0.5, 0.016, 2, 2, 1]} />
        <meshStandardMaterial
          color="#FAFAF8"
          roughness={0.46}
          metalness={0}
        />
      </mesh>

      {/* Fold crease */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.68, 0.004, 0.018, 1, 1, 1]} />
        <meshStandardMaterial
          color="#ECEAE6"
          roughness={0.4}
          metalness={0}
        />
      </mesh>

      {/* Bent lower half */}
      <mesh
        castShadow
        position={[0, -0.25, 0]}
        rotation-x={-0.18}
      >
        <boxGeometry args={[0.68, 0.24, 0.016, 2, 2, 1]} />
        <meshStandardMaterial
          color="#FAFAF8"
          roughness={0.46}
          metalness={0}
        />
      </mesh>

      {/* Handwritten text lines */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={`txt-${i}`}
          position={[-0.04, 0.15 - i * 0.055, 0.003]}
        >
          <boxGeometry
            args={[0.35 + Math.sin(i * 0.8) * 0.15, 0.003, 0.019, 1, 1, 1]}
          />
          <meshStandardMaterial
            color="#E8E4DE"
            roughness={0.35}
            metalness={0}
          />
        </mesh>
      ))}

      {/* Signature */}
      <mesh position={[0.2, -0.16, 0.003]}>
        <boxGeometry args={[0.25, 0.003, 0.019, 1, 1, 1]} />
        <meshStandardMaterial
          color="#E8E4DE"
          roughness={0.35}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
