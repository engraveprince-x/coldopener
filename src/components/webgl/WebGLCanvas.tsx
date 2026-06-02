"use client";

import { useRef, useLayoutEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lighting from "./Lighting";
import Envelope from "./Envelope";
import PaperPlane from "./PaperPlane";
import FoldedLetter from "./FoldedLetter";
import SmallEnvelope from "./SmallEnvelope";

gsap.registerPlugin(ScrollTrigger);

function SceneContent() {
  const envelopeRef = useRef<THREE.Group>(null);
  const planeRef = useRef<THREE.Group>(null);
  const letterRef = useRef<THREE.Group>(null);
  const smallEnvRef = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const env = envelopeRef.current;
    const plane = planeRef.current;
    const letter = letterRef.current;
    const smallEnv = smallEnvRef.current;

    if (!env || !plane || !letter || !smallEnv) return;

    // Store initial rotations for animation offsets
    const planeInitRot = plane.rotation.clone();
    const letterInitRot = letter.rotation.clone();
    const smallInitRot = smallEnv.rotation.clone();

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.0,
      },
    });

    // Main envelope: rotateX flip + wobble + drift
    tl.to(env.rotation, { x: Math.PI * 2.05, duration: 1, ease: "none" }, 0);
    tl.to(env.rotation, { y: 0.6, duration: 0.25, ease: "power2.out" }, 0);
    tl.to(env.rotation, { y: -0.5, duration: 0.3, ease: "power2.inOut" }, 0.35);
    tl.to(env.rotation, { y: 0.2, duration: 0.25, ease: "power2.in" }, 0.7);
    tl.to(env.position, { y: 0.55, duration: 0.3, ease: "power2.out" }, 0);
    tl.to(env.position, { y: -0.35, duration: 0.4, ease: "power2.inOut" }, 0.3);
    tl.to(env.position, { y: 0.05, duration: 0.3, ease: "power2.in" }, 0.7);
    tl.to(env.position, { z: 0.5, duration: 0.2, ease: "power2.out" }, 0.15);
    tl.to(env.position, { z: 0, duration: 0.3, ease: "power2.in" }, 0.5);

    // Paper plane: swooping arc
    tl.to(plane.position, { x: -2.0, y: -0.5, z: 0.6, duration: 0.5, ease: "power2.inOut" }, 0);
    tl.to(plane.position, { x: 1.6, y: 1.0, z: -1.0, duration: 0.5, ease: "power2.inOut" }, 0.5);
    tl.to(plane.rotation, { z: planeInitRot.z + Math.PI * 0.7, y: -2.0, x: -0.4, duration: 0.5, ease: "power2.inOut" }, 0);
    tl.to(plane.rotation, { z: planeInitRot.z - Math.PI * 0.3, y: -3.5, x: 0.6, duration: 0.5, ease: "power2.inOut" }, 0.5);

    // Folded letter: drift + unfold
    tl.to(letter.position, { x: 1.6, y: 0.4, z: -0.8, duration: 0.45, ease: "power2.inOut" }, 0);
    tl.to(letter.position, { x: -1.2, y: -0.25, z: 0.3, duration: 0.55, ease: "power2.inOut" }, 0.45);
    tl.to(letter.rotation, { y: letterInitRot.y + 2.4, x: -0.3, duration: 0.5, ease: "none" }, 0);
    tl.to(letter.rotation, { y: letterInitRot.y - 1.0, x: 0.2, duration: 0.5, ease: "none" }, 0.5);

    // Small envelope: orbiting drift
    tl.to(smallEnv.position, { x: -1.5, y: 0.5, z: 0.4, duration: 0.4, ease: "power2.inOut" }, 0);
    tl.to(smallEnv.position, { x: 0.8, y: -0.1, z: -1.2, duration: 0.35, ease: "power2.inOut" }, 0.4);
    tl.to(smallEnv.position, { x: -0.5, y: -0.7, z: 0.1, duration: 0.25, ease: "power2.inOut" }, 0.75);
    tl.to(smallEnv.rotation, { y: smallInitRot.y - 3.0, x: 0.5, duration: 0.5, ease: "none" }, 0);
    tl.to(smallEnv.rotation, { y: smallInitRot.y + 1.5, x: -0.2, duration: 0.5, ease: "none" }, 0.5);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <>
      <Lighting />

      {/* Fog */}
      <fog attach="fog" args={["#FCFCFA", 7, 22]} />

      {/* Ground shadow catcher */}
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, -2.8, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.2} />
      </mesh>

      {/* 3D Objects */}
      <group ref={envelopeRef}>
        <Envelope />
      </group>
      <group ref={planeRef}>
        <PaperPlane />
      </group>
      <group ref={letterRef}>
        <FoldedLetter />
      </group>
      <group ref={smallEnvRef}>
        <SmallEnvelope />
      </group>
    </>
  );
}

export default function WebGLCanvas() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none">
      <Canvas
        shadows="soft"
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        camera={{
          fov: 42,
          near: 0.1,
          far: 40,
          position: [0, 0.1, 6.5],
        }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
