import Hero from "@/components/Hero";
import AboutMe from "@/components/AboutMe";

export default function Home() {
  return (
    <>
      {/* Header */}
      <header>
        <Hero />
        <div className="h-[30vh]"></div>
      </header>

      {/* About me  */}
      <main>
        <AboutMe />
        <div className="h-screen"></div>
      </main>
    </>
  );
}
