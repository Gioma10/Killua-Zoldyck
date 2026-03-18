"use client";

import { useRef } from "react";
import Image from "next/image";
import Kil from "../assets/Killua.png";
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
      gsap.set(killuaRef.current, { y: 0, x: 0 }); // posizione iniziale
      gsap.to(killuaRef.current, {
        ease: "none",
        scrollTrigger: {
          trigger: killuaRef.current, // trigger sull'intero container
          endTrigger: containerRef.current?.nextElementSibling,
          start: "top end",
          end: "bottom bottom",
          pinSpacing: false,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true, // ricalcola posizioni su refresh/resize
        },
      });
    }

    // Titolo parallax più leggero
    if (titleKRef.current && titleZRef.current) {
      gsap.set(titleKRef.current, { x: 0 });
      gsap.set(titleZRef.current, { x: 0 });
      gsap.to(titleKRef.current, {
        x: -350, // si muove meno di Killua
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top end",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      gsap.to(titleZRef.current, {
        x: 350, // si muove meno di Killua
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top end",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }
  });

  return (
    <div
      ref={containerRef}
      className="mx-20 h-screen flex justify-center items-center relative"
    >
      <h1 className="text-9xl ps-10 flex gap-10 text-center text-white mt-20 uppercase">
        <span className="inline-block" ref={titleKRef}>
          Killua
        </span>

        <span className="inline-block" ref={titleZRef}>
          Zoldyck
        </span>
      </h1>

      <div
        ref={killuaRef}
        className="flex justify-center items-end absolute h-full w-96"
      >
        <Image src={Kil} alt="Killua" className="w-full" />
      </div>
    </div>
  );
};

export default Hero;
