"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import Yoyo from "./Yoyo";

type Props = {
  progress: RefObject<{ value: number }>;
};

export default function YoyoScroll({ progress }: Props) {
  const yoyoRef = useRef<Group>(null);
  const filoRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!yoyoRef.current || !filoRef.current) return;

    const avanzamento = progress.current.value;

    const cimaFilo = 3;
    const posizioneIniziale = 1.5;
    const discesa = avanzamento * 3;
    const posizioneYoyo = posizioneIniziale - discesa;

    // Il corpo scende e ruota attorno al proprio asse.
    yoyoRef.current.position.y = posizioneYoyo;
    yoyoRef.current.rotation.z = -discesa / 0.15;

    // Il filo resta ancorato in alto.
    const lunghezza = cimaFilo - posizioneYoyo;

    filoRef.current.scale.y = lunghezza;
    filoRef.current.position.y = (cimaFilo + posizioneYoyo) / 2;
  });

  return (
    <>
      <group ref={yoyoRef} position={[0, 1.5, 0]}>
        <Yoyo />
      </group>

      <mesh ref={filoRef} position={[0, 2.25, 0]} scale={[1, 1.5, 1]}>
        <cylinderGeometry args={[0.015, 0.025, 1, 8]} />
        <meshStandardMaterial
          color="#b8bec7"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>
    </>
  );
}