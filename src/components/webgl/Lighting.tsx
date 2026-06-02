"use client";

export default function Lighting() {
  return (
    <>
      <ambientLight color="#FFFAF5" intensity={1.6} />
      <directionalLight
        color="#FFF8F0"
        intensity={4.0}
        position={[5, 3.5, 6]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.00008}
        shadow-normalBias={0.02}
      />
      <directionalLight
        color="#F0F4FF"
        intensity={1.0}
        position={[-3.5, 1, -2.5]}
      />
      <directionalLight
        color="#FFF5EB"
        intensity={2.2}
        position={[0, -0.2, -4.5]}
      />
      <directionalLight
        color="#FFFFFF"
        intensity={0.8}
        position={[0, 5, 0.5]}
      />
    </>
  );
}
