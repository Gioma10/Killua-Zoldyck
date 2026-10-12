"use client";

import { useGLTF } from "@react-three/drei";

export default function Yoyo() {
  const { scene } = useGLTF("/yoyo.glb");

  return (
    <group position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}
