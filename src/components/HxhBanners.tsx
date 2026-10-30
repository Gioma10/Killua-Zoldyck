"use client";

// The logo is in public/hero/hxh.png (660x404).
const LOGO_SRC = "/hero/hxh.png";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";

export default function HxhBanners() {
  const t = useTranslations("HxhBanners");
  const containerRef = useRef<HTMLDivElement>(null);
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
    { scope: containerRef }
  );
  return (
        <div ref={containerRef} className="relative -translate-y-32 h-52 w-full">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] overflow-hidden border bg-[#F9F2E0] p-1 md:p-2 -rotate-6 pointer-events-none z-10">
            <div ref={firstContainerLogosRef} className="flex logo-track w-[200%]">
              {Array.from({ length: 20 }, (_, i) => (
                <Image
                  key={i}
                  src={LOGO_SRC}
                  alt={t("logoAlt")}
                  width={100}
                  height={61}
                  className="w-16 md:w-[100px]"
                />
              ))}
              {Array.from({ length: 20 }, (_, i) => (
                <Image
                  key={i + 20}
                  src={LOGO_SRC}
                  alt={t("logoAlt")}
                  width={100}
                  height={61}
                  className="w-16 md:w-[100px]"
                />
              ))}
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] overflow-hidden border bg-[#F9F2E0] p-1 md:p-2 rotate-6 pointer-events-none z-0">
            <div ref={secondContainerLogosRef} className="flex logo-track w-[200%]">
              {Array.from({ length: 20 }, (_, i) => (
                <Image
                  key={i}
                  src={LOGO_SRC}
                  alt={t("logoAlt")}
                  width={100}
                  height={61}
                  className="w-16 md:w-[100px]"
                />
              ))}
              {Array.from({ length: 20 }, (_, i) => (
                <Image
                  key={i + 20}
                  src={LOGO_SRC}
                  alt={t("logoAlt")}
                  width={100}
                  height={61}
                  className="w-16 md:w-[100px]"
                />
              ))}
            </div>
          </div>
        </div>
  );
}
