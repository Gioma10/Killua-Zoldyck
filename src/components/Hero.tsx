"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const killuaRef = useRef<HTMLDivElement>(null);
  const titleKRef = useRef<HTMLHeadingElement>(null);
  const titleZRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Killua parallax
    if (killuaRef.current) {
      gsap.set(killuaRef.current, { y: 0, x: 0 }); // starting position
      gsap.to(killuaRef.current, {
        
        scrollTrigger: {
          trigger: killuaRef.current, // trigger on the whole container
          start: "top end",
          end: () => `+=${window.innerHeight * 0.3}`,
          pinSpacing: false,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true, // recalculates positions on refresh/resize
        },
      });
    }

    // Lighter parallax for the title
    if (titleKRef.current && titleZRef.current) {
      gsap.set(titleKRef.current, { x: 0 });
      gsap.set(titleZRef.current, { x: 0 });
      gsap.to(titleKRef.current, {
        x: -100, // moves less than Killua
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top end",
          end: "200px top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      gsap.to(titleZRef.current, {
        x: 100, // moves less than Killua
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top end",
          end: "200px top",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
    }
  });

  return (
    <div
      ref={containerRef}
      className="h-screen flex justify-center items-center relative"
    >
      <h1 className="flex gap-[3vw] text-[15vw] leading-none whitespace-nowrap uppercase text-ink">
        <span className="inline-block" ref={titleKRef}>
          Killua
        </span>

        <span className="inline-block" ref={titleZRef}>
          Zoldyck
        </span>
      </h1>

      <div
        ref={killuaRef}
        className="flex justify-center items-end absolute h-full w-64 md:w-96"
      >
        <Image
          src="/hero/Killua.png"
          alt="Killua"
          width={736}
          height={1472}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default Hero;
