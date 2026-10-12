import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      {/* Mantiene la corsa dello scroll per il pin di Killua. */}
      <div className="h-[30vh]" aria-hidden="true" />
    </main>
  );
}
