"use client";

// Yoyo 3D messo in pausa: il codice è commentato, non cancellato.
// I file del modello restano in src/components/3d/ (Yoyo.tsx, YoyoScroll.tsx).

import { useRef } from "react";
// import { Suspense } from "react";
// import { Canvas } from "@react-three/fiber";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
// import { useGSAP } from "@gsap/react";
// import YoyoScroll from "@/components/3d/YoyoScroll";

// gsap.registerPlugin(ScrollTrigger, useGSAP);

export const AboutMe = () => {
  const sectionRef = useRef<HTMLElement>(null);
  // const progress = useRef({ value: 0 });

  // useGSAP(
  //   () => {
  //     gsap.fromTo(
  //       progress.current,
  //       { value: 0 },
  //       {
  //         value: 1,
  //         ease: "none",
  //         scrollTrigger: {
  //           trigger: sectionRef.current,
  //           start: "top top",
  //           end: "+=1200",
  //           pin: true,
  //           scrub: true,
  //         },
  //       }
  //     );
  //   },
  //   { scope: sectionRef }
  // );

  return (
    <section ref={sectionRef} className="relative h-screen">
      <h2 className="absolute top-10 left-1/2 -translate-x-1/2 z-10 text-5xl font-bold text-slate-900">
        About me
      </h2>

      {/* <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[3, 4, 5]} intensity={1} />

        <Suspense fallback={null}>
          <YoyoScroll progress={progress} />
        </Suspense>
      </Canvas> */}
    </section>
  );
};
