"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import ScrollToPlugin from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const sections = [
  { id: "about", label: "Chi è" },
  { id: "abilities", label: "Abilità" },
  { id: "story", label: "Storia" },
];

export default function Navbar() {
  const [active, setActive] = useState(sections[0].id);



  return (
    <nav className="sticky top-1/2 -translate-y-1/2 left-8 flex flex-col gap-6 pl-2">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          className="group flex items-center gap-3"
        >
          <span className="text-white">-</span>
          <span
            className={`text-xs uppercase tracking-widest transition-all duration-300 ${
              active === id
                ? "opacity-100 translate-x-0 text-white"
                : "opacity-0 -translate-x-2 text-white/50 group-hover:opacity-70 group-hover:translate-x-0"
            }`}
          >
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}