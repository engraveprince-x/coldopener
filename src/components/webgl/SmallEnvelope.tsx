"use client";

import { useRef } from "react";
import * as THREE from "three";

export default function SmallEnvelope() {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group
      ref={groupRef}
      position={[1.6, -0.55, -1.1]}
      rotation={[-0.15, -0.7, 0.12]}
    >
      {/* Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.36, 0.04, 2, 2, 1]} />
        <meshStandardMaterial
          color="#FAFAF8"
          roughness={0.38}
          metalness={0}
        />
      </mesh>

      {/* Flap */}
      <mesh
        castShadow
        position={[0, 0.18, 0.016]}
        rotation-x={-0.22}
      >
        <shapeGeometry
          args={[
            (() => {
              const s = new THREE.Shape();
              s.moveTo(-0.25, 0);
              s.lineTo(0.25, 0);
              s.lineTo(0, 0.2);
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

      {/* Mini V-crease */}
      <mesh position={[-0.07, 0.02, 0]} rotation-z={0.4}>
        <boxGeometry args={[0.16, 0.003, 0.042, 1, 1, 1]} />
        <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
      </mesh>
      <mesh position={[0.07, 0.02, 0]} rotation-z={-0.4}>
        <boxGeometry args={[0.16, 0.003, 0.042, 1, 1, 1]} />
        <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
      </mesh>

      {/* Mini stamp */}
      <mesh position={[0.19, 0.12, 0.022]}>
        <boxGeometry args={[0.06, 0.08, 0.002, 1, 1, 1]} />
        <meshStandardMaterial color="#F0ECE4" roughness={0.32} metalness={0} />
      </mesh>

      {/* Mini address lines */}
      {Array.from({ length: 2 }).map((_, i) => (
        <mesh key={`s-addr-${i}`} position={[0, -0.02 - i * 0.035, 0]}>
          <boxGeometry args={[0.22, 0.002, 0.042, 1, 1, 1]} />
          <meshStandardMaterial color="#ECEAE6" roughness={0.4} metalness={0} />
        </mesh>
      ))}

      {/* Mini wax seal */}
      <mesh position={[0, 0.12, 0.03]} rotation-x={-0.2}>
        <cylinderGeometry args={[0.03, 0.03, 0.01, 24]} />
        <meshStandardMaterial color="#D4C9B8" roughness={0.2} metalness={0.35} />
      </mesh>
    </group>
  );
}
