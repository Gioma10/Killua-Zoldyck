"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";

// The vertex shader decides WHERE to draw: here the rectangle always
// covers the whole canvas, with no camera. It passes the uv coordinates
// (0,0 bottom left, 1,1 top right) to the fragment shader.
const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// The fragment shader decides the COLOR of each pixel.
// It draws 6 bolts that start from the mouse and change shape in jumps
// (like real lightning), plus a glow around the mouse.
const fragmentShader = /* glsl */ `
  uniform float uTime;   // seconds passed
  uniform vec2 uMouse;   // mouse position, in uv
  uniform float uHover;  // 0 = mouse outside, 1 = mouse over
  uniform float uAspect; // width / height of the card

  varying vec2 vUv;

  // A "random" number between 0 and 1, always the same for the same n.
  float hash(float n) {
    return fract(sin(n) * 43758.5453);
  }

  // Noise: random values joined together smoothly.
  float noise(float x) {
    float i = floor(x);
    float f = fract(x);
    return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f));
  }

  // Several layers of noise, each one denser and smaller:
  // this is what makes the bolt jagged. Goes from about -1 to 1.
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
    // Distance and direction of this pixel from the mouse.
    vec2 p = vUv - uMouse;
    p.x *= uAspect; // without this, circles would come out squashed
    float r = length(p);
    float angle = atan(p.y, p.x);

    float light = 0.0;

    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      // "jump" changes 10 times per second: at each change the bolt
      // gets a new direction, length and shape.
      float jump = floor(uTime * 10.0 + fi * 3.0);
      float direction = hash(jump + fi * 17.0) * 6.2831;
      float len = 0.3 + 0.45 * hash(jump * 1.3 + fi);

      // The direction shakes with distance: that makes the zig-zags.
      float boltAngle = direction + fbm(r * 12.0 + jump * 5.1) * 0.6;

      // How far this pixel is from the line of the bolt.
      float diff = abs(mod(angle - boltAngle + 3.14159, 6.28318) - 3.14159);
      float dist = diff * r;

      // Close to the line = bright light, far away = dark.
      // The bolt fades out as it gets further from the mouse.
      float bolt = 0.003 / max(dist, 0.0008) * smoothstep(len, 0.0, r);
      // Every now and then a bolt disappears: it looks like it flickers.
      bolt *= step(0.25, hash(jump + fi * 5.0));
      light += bolt;
    }

    // Soft glow around the mouse.
    light += 0.03 / max(r, 0.015);

    // Electric blue at the edges, white where the light is strongest.
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

// The rectangle with the shader. On every frame it moves time forward.
function Bolts({ uniforms }: { uniforms: Uniforms }) {
  // I create the material myself, so it uses exactly this "uniforms" object:
  // when GSAP or the mouse changes a value, the shader sees it right away.
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

// Lightning bolts over the card that follow the mouse.
// It goes inside the card: it listens to the mouse on the card itself.
// "enabled" = false on phones: there's no effect there.
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
  // The canvas only draws while the effect is visible, to avoid waste.
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
    // Only with a real mouse and only once the tree has turned into cards.
    const canPlay = () =>
      enabled &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !!card.closest(".cards-ready");

    const onMove = (e: PointerEvent) => {
      if (!canPlay()) return;
      const rect = wrapperRef.current!.getBoundingClientRect();
      // In the shader y goes from bottom to top, on screen the opposite: 1 - ...
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
      // mix-blend-screen: the shader's black doesn't cover anything, the light brightens.
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
