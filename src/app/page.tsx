import Hero from "@/components/Hero";
import HxhBanners from "@/components/HxhBanners";
import { AboutMe } from "./AboutMe";

export default function Home() {
  return (
    <main >
      <div className="overflow-hidden">

      {/* Mantiene la corsa dello scroll per il pin di Killua. */}
      <Hero />
      <div className="h-[30vh]" aria-hidden="true" />
      <HxhBanners />
      </div>

      <div>
        <AboutMe/>
      </div>
    </main>
  );
}
