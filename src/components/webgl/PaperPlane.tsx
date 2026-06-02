"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";

export default function PaperPlane() {
  const groupRef = useRef<THREE.Group>(null);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const v = new Float32Array([
      // Left wing top
      0, 0.04, 0.48,
      0, 0.04, -0.38,
      -0.42, -0.14, -0.14,
      // Right wing top
      0, 0.04, 0.48,
      0.42, -0.14, -0.14,
      0, 0.04, -0.38,
      // Left wing bottom
      0, 0.04, 0.48,
      -0.42, -0.14, -0.14,
      0, -0.04, -0.38,
      // Right wing bottom
      0, 0.04, 0.48,
      0, -0.04, -0.38,
      0.42, -0.14, -0.14,
      // Back top
      0, 0.04, -0.38,
      -0.42, -0.14, -0.14,
      0.42, -0.14, -0.14,
      // Back bottom
      0, -0.04, -0.38,
      0.42, -0.14, -0.14,
      -0.42, -0.14, -0.14,
    ]);
    g.setAttribute("position", new THREE.BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group
      ref={groupRef}
      position={[2.0, 0.6, -0.8]}
      rotation={[0.3, -0.5, 0.2]}
    >
      {/* Paper airplane body */}
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial
          color="#FCFCFA"
          roughness={0.22}
          metalness={0.05}
        />
      </mesh>

      {/* Center ridge */}
      <mesh position={[0, 0.02, 0.03]}>
        <boxGeometry args={[0.008, 0.02, 0.82, 1, 1, 1]} />
        <meshStandardMaterial
          color="#F0EDE7"
          roughness={0.3}
          metalness={0}
        />
      </mesh>

      {/* Wing fold lines */}
      <mesh position={[-0.12, -0.04, -0.02]} rotation-z={0.35}>
        <boxGeometry args={[0.18, 0.003, 0.008, 1, 1, 1]} />
        <meshStandardMaterial
          color="#F0EDE7"
          roughness={0.3}
          metalness={0}
        />
      </mesh>
      <mesh position={[0.12, -0.04, -0.02]} rotation-z={-0.35}>
        <boxGeometry args={[0.18, 0.003, 0.008, 1, 1, 1]} />
        <meshStandardMaterial
          color="#F0EDE7"
          roughness={0.3}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
