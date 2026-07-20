"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group } from "three";

function Yoyo() {
  const ref = useRef<Group>(null);

  // spin lento "in idle": nella 0004 lo sostituirà lo scroll
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.5;
  });

  return (
    <group ref={ref} rotation={[-0.4, 0, 0]}>
      {/* disco davanti */}
      <mesh position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.22, 20]} />
        <meshStandardMaterial color="#2b8cff" metalness={0.35} roughness={0.35} />
      </mesh>
      {/* disco dietro */}
      <mesh position={[0, 0, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1, 1, 0.22, 20]} />
        <meshStandardMaterial color="#2b8cff" metalness={0.35} roughness={0.35} />
      </mesh>
      {/* assale centrale */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.72, 24]} />
        <meshStandardMaterial color="#0a2c66" />
      </mesh>
      {/* riferimento bianco per vedere il giro */}
      <mesh position={[0, 0, 0.45]}>
        <boxGeometry args={[0.9, 0.06, 0.06]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={2} />
        <Yoyo />
      </Canvas>
    </div>
  );
}