"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";

// Il vertex shader decide DOVE disegnare: qui il rettangolo copre
// sempre tutta la tela, senza telecamera. Passa le coordinate uv
// (0,0 in basso a sinistra, 1,1 in alto a destra) al fragment shader.
const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Il fragment shader decide il COLORE di ogni pixel.
// Disegna 6 saette che partono dal mouse, cambiano forma a scatti
// (come un fulmine vero) e un bagliore attorno al mouse.
const fragmentShader = /* glsl */ `
  uniform float uTime;   // secondi passati
  uniform vec2 uMouse;   // posizione del mouse, in uv
  uniform float uHover;  // 0 = mouse fuori, 1 = mouse sopra
  uniform float uAspect; // larghezza / altezza della carta

  varying vec2 vUv;

  // Un numero "a caso" tra 0 e 1, sempre uguale per lo stesso n.
  float hash(float n) {
    return fract(sin(n) * 43758.5453);
  }

  // Rumore: valori a caso collegati in modo morbido.
  float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
  }

  // Più strati di rumore, ognuno più fitto e più piccolo:
  // è quello che rende la saetta frastagliata. Va da -1 a 1 circa.
  float fbm(float x) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * (noise(x) * 2.0 - 1.0);
      x *= 2.1;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    // Distanza e direzione di questo pixel dal mouse.
    vec2 p = vUv - uMouse;
    p.x *= uAspect; // senza, i cerchi verrebbero schiacciati
    float r = length(p);
    float angle = atan(p.y, p.x);

    float light = 0.0;

    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      // "jump" cambia 10 volte al secondo: a ogni cambio la saetta
      // prende una direzione, una lunghezza e una forma nuove.
      float jump = floor(uTime * 10.0 + fi * 3.0);
      float direction = hash(jump + fi * 17.0) * 6.2831;
      float len = 0.3 + 0.45 * hash(jump * 1.3 + fi);

      // La direzione trema con la distanza: ecco i zig-zag.
      float boltAngle = direction + fbm(r * 12.0 + jump * 5.1) * 0.6;

      // Quanto questo pixel è lontano dalla linea della saetta.
      float diff = abs(mod(angle - boltAngle + 3.14159, 6.28318) - 3.14159);
      float dist = diff * r;

      // Vicino alla linea = luce forte, lontano = buio.
      // La saetta si spegne man mano che si allontana dal mouse.
      float bolt = 0.003 / max(dist, 0.0008) * smoothstep(len, 0.0, r);
      // Ogni tanto una saetta sparisce: sembra che sfarfalli.
      bolt *= step(0.25, hash(jump + fi * 5.0));
      light += bolt;
    }

    // Bagliore morbido attorno al mouse.
    light += 0.03 / max(r, 0.015);

    // Blu elettrico ai bordi, bianco dove la luce è più forte.
    vec3 blue = vec3(0.45, 0.7, 1.0);
    vec3 color = mix(blue, vec3(1.0), clamp(light - 1.0, 0.0, 1.0));
    float alpha = clamp(light, 0.0, 1.0) * uHover;

    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

type Uniforms = {
  uTime: { value: number };
  uMouse: { value: THREE.Vector2 };
  uHover: { value: number };
  uAspect: { value: number };
};

// Il rettangolo con lo shader. A ogni fotogramma fa avanzare il tempo.
function Bolts({ uniforms }: { uniforms: Uniforms }) {
  // Il materiale lo creo io, così usa proprio questo oggetto "uniforms":
  // quando GSAP o il mouse cambiano un valore, lo shader lo vede subito.
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
      }),
    [uniforms],
  );

  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <mesh frustumCulled={false} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

// Saette sopra la carta che seguono il mouse.
// Va messo dentro la carta: ascolta il mouse sulla carta stessa.
// "enabled" = false sul telefono: lì l'effetto non c'è.
export default function LightningEffect({
  enabled,
  width,
  height,
}: {
  enabled: boolean;
  width: number;
  height: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // La tela disegna solo mentre l'effetto si vede, per non sprecare.
  const [active, setActive] = useState(false);
  const uniforms = useMemo<Uniforms>(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 },
      uAspect: { value: width / height },
    }),
    [width, height],
  );

  useEffect(() => {
    const card = wrapperRef.current!.closest("article")!;
    // Solo con un mouse vero e solo quando l'albero è diventato carte.
    const canPlay = () =>
      enabled &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !!card.closest(".cards-ready");

    const onMove = (e: PointerEvent) => {
      if (!canPlay()) return;
      const rect = wrapperRef.current!.getBoundingClientRect();
      // Nello shader y va dal basso verso l'alto, sullo schermo il contrario: 1 - ...
      uniforms.uMouse.value.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      );
      setActive(true);
      gsap.to(uniforms.uHover, { value: 1, duration: 0.3, overwrite: true });
    };

    const onLeave = () => {
      gsap.to(uniforms.uHover, {
        value: 0,
        duration: 0.4,
        overwrite: true,
        onComplete: () => setActive(false),
      });
    };

    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);
    return () => {
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, uniforms]);

  return (
    <div
      ref={wrapperRef}
      // mix-blend-screen: il nero dello shader non copre, la luce schiarisce.
      className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden rounded-xl mix-blend-screen"
      style={{ height }}
    >
      <Canvas
        frameloop={active ? "always" : "never"}
        gl={{ alpha: true, antialias: false }}
        dpr={[1, 2]}
      >
        <Bolts uniforms={uniforms} />
      </Canvas>
    </div>
  );
}
