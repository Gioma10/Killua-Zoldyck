"use client";

import Hero from "@/components/Hero";
import AboutMe from "@/components/AboutMe";
import LogoHxH from "../assets/hxh.png";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";

export default function Home() {
  const firstContainerLogosRef = useRef(null);
  const secondContainerLogosRef = useRef(null);

  useGSAP(
    () => {
      if (firstContainerLogosRef.current && secondContainerLogosRef.current) {
        gsap.fromTo(
          firstContainerLogosRef.current,
          { xPercent: 0 },
          { xPercent: -50, duration: 20, ease: "linear", repeat: -1 }
        );
        gsap.fromTo(
          secondContainerLogosRef.current,
          { xPercent: -50 },
          { xPercent: 0, duration: 20, ease: "linear", repeat: -1 }
        );
      }
    },
    { scope: firstContainerLogosRef && secondContainerLogosRef }
  );
  return (
    <>
      {/* Header */}
      <header className="overflow-hidden">
        <Hero />
        <div className="h-[30vh]"></div>
        <div className="relative -translate-y-32 h-52 w-full overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] overflow-hidden border bg-[#F9F2E0] p-2 -rotate-6 pointer-events-none z-10">
            <div ref={firstContainerLogosRef} className="flex logo-track w-[200%]">
              {Array.from({ length: 20 }, (_, i) => (
                <Image
                  key={i}
                  src={LogoHxH}
                  alt="Logo HunterxHunter"
                  width={100}
                />
              ))}
              {Array.from({ length: 20 }, (_, i) => (
                <Image
                  key={i + 20}
                  src={LogoHxH}
                  alt="Logo HunterxHunter"
                  width={100}
                />
              ))}
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] overflow-hidden border bg-[#F9F2E0] p-2 rotate-6 pointer-events-none z-0">
            <div ref={secondContainerLogosRef} className="flex logo-track w-[200%]">
              {Array.from({ length: 20 }, (_, i) => (
                <Image
                  key={i}
                  src={LogoHxH}
                  alt="Logo HunterxHunter"
                  width={100}
                />
              ))}
              {Array.from({ length: 20 }, (_, i) => (
                <Image
                  key={i + 20}
                  src={LogoHxH}
                  alt="Logo HunterxHunter"
                  width={100}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* About me  */}
      <main>
        <AboutMe />
        <div className="h-screen"></div>
      </main>
    </>
  );
}
