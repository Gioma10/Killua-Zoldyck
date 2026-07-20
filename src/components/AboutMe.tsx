"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Scene from "./Scene";

const AboutMe = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 40 },                          // A
      { opacity: 1, y: 0, duration: 1, ease: "power2.out" } // B
    );
  });

  return (
    <div id="about" className="h-[70vh] flex items-center justify-center">
      {/* <Scene /> */}
      <h2 ref={titleRef} className="text-6xl uppercase text-white">
        Chi è Killua
      </h2>
    </div>
  );
};

export default AboutMe;