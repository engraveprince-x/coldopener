"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Envelope() {
  const groupRef = useRef<THREE.Group>(null);

  // Store refs for GSAP to animate
  useFrame(() => {
    // GSAP will drive this group directly
  });

  return (
    <group ref={groupRef} position={[0, 0.05, 0]}>
      {/* Body */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <boxGeometry args={[1.2, 0.82, 0.06, 3, 3, 1]} />
        <meshStandardMaterial
          color="#FAFAF8"
          roughness={0.38}
          metalness={0}
        />
      </mesh>

      {/* Flap */}
      <mesh
        castShadow
        position={[0, 0.41, 0.025]}
        rotation-x={-0.16}
      >
        <shapeGeometry
          args={[
            (() => {
              const s = new THREE.Shape();
              s.moveTo(-0.6, 0);
              s.lineTo(0.6, 0);
              s.lineTo(0, 0.42);
              s.closePath();
              return s;
            })(),
          ]}
        />
        <meshStandardMaterial
          color="#F2F1ED"
          roughness={0.35}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* V-crease left */}
      <mesh
        position={[-0.16, 0.02, 0]}
        rotation-z={0.42}
      >
        <boxGeometry args={[0.38, 0.006, 0.062, 1, 1, 1]} />
        <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
      </mesh>

      {/* V-crease right */}
      <mesh
        position={[0.16, 0.02, 0]}
        rotation-z={-0.42}
      >
        <boxGeometry args={[0.38, 0.006, 0.062, 1, 1, 1]} />
        <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
      </mesh>

      {/* Stamp */}
      <mesh position={[0.46, 0.28, 0.032]}>
        <boxGeometry args={[0.12, 0.16, 0.002, 2, 2, 1]} />
        <meshStandardMaterial color="#F0ECE4" roughness={0.32} metalness={0} />
      </mesh>

      {/* Stamp inner */}
      <mesh position={[0.46, 0.28, 0.033]}>
        <boxGeometry args={[0.08, 0.12, 0.003, 1, 1, 1]} />
        <meshStandardMaterial color="#F2F1ED" roughness={0.35} metalness={0} />
      </mesh>

      {/* Postmark ring */}
      <mesh position={[0.48, 0.3, 0.034]} rotation-z={0.25}>
        <torusGeometry args={[0.048, 0.01, 8, 24]} />
        <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
      </mesh>

      {/* Cancel lines */}
      <mesh position={[0.43, 0.24, 0.033]} rotation-z={-0.35}>
        <boxGeometry args={[0.07, 0.004, 0.062, 1, 1, 1]} />
        <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
      </mesh>
      <mesh position={[0.44, 0.21, 0.033]} rotation-z={-0.25}>
        <boxGeometry args={[0.07, 0.004, 0.062, 1, 1, 1]} />
        <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
      </mesh>

      {/* Return address lines */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={`ret-${i}`} position={[-0.42, 0.22 - i * 0.045, 0]}>
          <boxGeometry args={[0.3, 0.005, 0.062, 1, 1, 1]} />
          <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
        </mesh>
      ))}

      {/* Recipient address lines */}
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh key={`addr-${i}`} position={[0, -0.08 - i * 0.05, 0]}>
          <boxGeometry args={[0.5, 0.005, 0.062, 1, 1, 1]} />
          <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
        </mesh>
      ))}

      {/* Air mail border stripes */}
      <mesh position={[0, 0.37, 0]}>
        <boxGeometry args={[1.16, 0.008, 0.062, 1, 1, 1]} />
        <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
      </mesh>
      <mesh position={[0, -0.37, 0]}>
        <boxGeometry args={[1.16, 0.008, 0.062, 1, 1, 1]} />
        <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
      </mesh>

      {/* Wax seal */}
      <mesh position={[0, 0.24, 0.045]} rotation-x={-0.16}>
        <cylinderGeometry args={[0.07, 0.07, 0.018, 32]} />
        <meshStandardMaterial color="#D4C9B8" roughness={0.2} metalness={0.35} />
      </mesh>

      {/* Seal highlight */}
      <mesh position={[0, 0.24, 0.056]} rotation-x={-0.16}>
        <cylinderGeometry args={[0.025, 0.025, 0.02, 16]} />
        <meshStandardMaterial color="#E8E0D4" roughness={0.15} metalness={0.4} />
      </mesh>
    </group>
  );
}
