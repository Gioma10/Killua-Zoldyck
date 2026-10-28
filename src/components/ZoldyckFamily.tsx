"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Kil from "../assets/Killua.png";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SURNAME = "ZOLDYCK";

// Misure di una scheda in "pixel dell'albero". Non sono i pixel dello schermo:
// la telecamera ingrandisce o rimpicciolisce tutto l'albero in base allo schermo,
// quindi le misure qui dentro restano sempre in proporzione.
const NODE_W = 240; // larghezza di una scheda (e della carta)
const PHOTO_H = 360; // altezza della foto (e della carta)
const NODE_H = 540; // altezza di una scheda, foto + testi
const LINE_GAP = 12; // spazio tra la fine di una linea e la foto o la carta

type FamilyMember = {
  name: string;
  role: string;
  description: string;
  // Percorso della foto dentro public/, ad esempio "/zoldyck-family/zeno.webp".
  image: string;
};

// L'ordine conta: è l'ordine in cui i membri compaiono mentre scrolli.
const FAMILY_MEMBERS: FamilyMember[] = [
  {
    name: "Zeno",
    image: "/zoldyck-family/zeno.webp",
    role: "Il nonno",
    description:
      "Ex capofamiglia e assassino leggendario. In combattimento il suo Nen prende la forma di un drago.",
  },
  {
    name: "Silva",
    image: "/zoldyck-family/silva.webp",
    role: "Il padre",
    description:
      "L'attuale capofamiglia. Killua ha preso da lui i capelli bianchi e il talento.",
  },
  {
    name: "Kikyo",
    image: "/zoldyck-family/kikyo.webp",
    role: "La madre",
    description:
      "Porta sempre un visore sugli occhi. Sogna che Killua diventi il più grande assassino della famiglia.",
  },
  {
    name: "Illumi",
    image: "/zoldyck-family/illumi.webp",
    role: "Il primo figlio",
    description:
      "Freddo e senza emozioni. Usa degli aghi per controllare le persone, anche suo fratello.",
  },
  {
    name: "Milluki",
    image: "/zoldyck-family/milluki.webp",
    role: "Il secondo figlio",
    description:
      "Il genio dei computer. Preferisce restare chiuso in casa tra schermi e collezioni.",
  },
  {
    name: "Killua",
    image: Kil.src,
    role: "Il terzo figlio",
    description:
      "L'erede scelto dalla famiglia. Scappa di casa per diventare Hunter insieme al suo amico Gon.",
  },
  {
    name: "Alluka",
    image: "/zoldyck-family/alluka.webp",
    role: "La quarta figlia",
    description:
      "Custodisce un potere misterioso che la famiglia teme. Killua è l'unico che la protegge.",
  },
  {
    name: "Kalluto",
    image: "/zoldyck-family/kalluto.webp",
    role: "Il più piccolo",
    description: "Veste sempre un kimono e combatte con ventagli di carta.",
  },
];

// Le due "modalità" di ogni scheda:
// - PHOTO: il personaggio con la descrizione sotto, mentre scorri;
// - CARD: alla fine diventa una carta, con il testo dentro.
type Mode = {
  rowGap: number; // distanza tra la cima di una generazione e la successiva
  w: number; // larghezza di quello che si vede (le linee si fermano prima)
  h: number; // altezza di quello che si vede
};

const PHOTO: Mode = { rowGap: 660, w: PHOTO_H / 2, h: PHOTO_H + 130 }; // le foto sono 1:2
const CARD: Mode = { rowGap: 440, w: NODE_W, h: PHOTO_H };

// Le due "forme" dell'albero:
// - WIDE: schermi larghi (computer, iPad orizzontale), i figli tutti in fila;
// - TALL: schermi alti (telefono, iPad verticale), i figli su due file.
// Per ogni membro: centro orizzontale (x) e fila (row: 0 = nonno, 1 = genitori...).
type Shape = {
  width: number;
  rows: number;
  spots: Record<string, { x: number; row: number }>;
};

const WIDE: Shape = {
  width: 1840,
  rows: 3,
  spots: {
    Zeno: { x: 720, row: 0 },
    Silva: { x: 720, row: 1 },
    Kikyo: { x: 1120, row: 1 },
    Illumi: { x: 280, row: 2 },
    Milluki: { x: 600, row: 2 },
    Killua: { x: 920, row: 2 },
    Alluka: { x: 1240, row: 2 },
    Kalluto: { x: 1560, row: 2 },
  },
};

const TALL: Shape = {
  width: 880,
  rows: 4,
  spots: {
    Zeno: { x: 240, row: 0 },
    Silva: { x: 240, row: 1 },
    Kikyo: { x: 640, row: 1 },
    Illumi: { x: 300, row: 2 },
    Milluki: { x: 580, row: 2 },
    Killua: { x: 160, row: 3 },
    Alluka: { x: 440, row: 3 },
    Kalluto: { x: 720, row: 3 },
  },
};

const spot = (shape: Shape, mode: Mode, name: string) => ({
  x: shape.spots[name].x,
  top: shape.spots[name].row * mode.rowGap,
});

// Una linea va dal punto "from" al punto "to" ed è sempre dritta
// (orizzontale o verticale). Si disegna partendo da "from".
// "before" è il membro che compare subito dopo che la linea è disegnata.
type TreeLine = {
  id: string;
  from: [number, number];
  to: [number, number];
  before: string;
};

// Calcola tutte le linee a partire da dove stanno le schede.
// Ogni linea si ferma a LINE_GAP dalla foto o dalla carta: non la tocca mai.
const treeLines = (shape: Shape, mode: Mode): TreeLine[] => {
  const zeno = spot(shape, mode, "Zeno");
  const silva = spot(shape, mode, "Silva");
  const kikyo = spot(shape, mode, "Kikyo");
  const marriageY = silva.top + PHOTO_H / 2; // a metà delle foto di Silva e Kikyo
  const middle = (silva.x + kikyo.x) / 2; // da qui scendono i figli

  const lines: TreeLine[] = [
    // Arriva dall'alto, come se l'albero continuasse con gli antenati.
    {
      id: "zeno-in",
      from: [zeno.x, -400],
      to: [zeno.x, zeno.top - LINE_GAP],
      before: "Zeno",
    },
    {
      id: "zeno-silva",
      from: [zeno.x, zeno.top + mode.h + LINE_GAP],
      to: [silva.x, silva.top - LINE_GAP],
      before: "Silva",
    },
    // Il matrimonio: da fianco a fianco, tra Silva e Kikyo.
    {
      id: "marriage",
      from: [silva.x + mode.w / 2 + LINE_GAP, marriageY],
      to: [kikyo.x - mode.w / 2 - LINE_GAP, marriageY],
      before: "Kikyo",
    },
  ];

  // I figli, fila per fila. Per ogni fila: il tronco scende dal centro
  // fino a una sbarra orizzontale; la sbarra si allunga verso ogni figlio
  // e da lì una linea corta scende fino alla sua scheda.
  const children = FAMILY_MEMBERS.slice(3).map((m) => m.name);
  const childRows = [...new Set(children.map((n) => shape.spots[n].row))];
  let stemTop = marriageY;

  childRows.forEach((row, r) => {
    const names = children.filter((n) => shape.spots[n].row === row);
    const rowTop = row * mode.rowGap;
    const barY = rowTop - 40;
    lines.push({
      id: `stem-${r}`,
      from: [middle, stemTop],
      to: [middle, barY],
      before: names[0],
    });

    // Fin dove è già arrivata la sbarra, a sinistra e a destra del tronco.
    let left = middle;
    let right = middle;
    names.forEach((name) => {
      const { x } = shape.spots[name];
      if (x < left) {
        lines.push({
          id: `bar-${name}`,
          from: [left, barY],
          to: [x, barY],
          before: name,
        });
        left = x;
      }
      if (x > right) {
        lines.push({
          id: `bar-${name}`,
          from: [right, barY],
          to: [x, barY],
          before: name,
        });
        right = x;
      }
      lines.push({
        id: `drop-${name}`,
        from: [x, barY],
        to: [x, rowTop - LINE_GAP],
        before: name,
      });
    });
    stemTop = barY;
  });

  return lines;
};

// Posizione e misure del div che disegna la linea (spesso 2px).
const lineBox = ({ from: [x1, y1], to: [x2, y2] }: TreeLine) => ({
  left: Math.min(x1, x2) - 1,
  top: Math.min(y1, y2) - 1,
  width: Math.abs(x2 - x1) || 2,
  height: Math.abs(y2 - y1) || 2,
});

// Sceglie la forma in base allo schermo: più alto che largo = TALL.
// Si aggiorna da sola se giri il telefono o cambi la grandezza della finestra.
function useShape() {
  const [shape, setShape] = useState(WIDE);
  useEffect(() => {
    const portrait = window.matchMedia("(orientation: portrait)");
    const update = () => setShape(portrait.matches ? TALL : WIDE);
    update();
    portrait.addEventListener("change", update);
    return () => portrait.removeEventListener("change", update);
  }, []);
  return shape;
}

const isHorizontal = (line: TreeLine) => line.from[1] === line.to[1];

export default function ZoldyckFamily() {
  const sectionRef = useRef<HTMLElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const shape = useShape();
  const lines = treeLines(shape, PHOTO);
  const cardsHeight = (shape.rows - 1) * CARD.rowGap + PHOTO_H;

  useGSAP(
    () => {
      // 1. Lo sfondo di tutta la pagina passa dal grigio-azzurro al vino scuro
      //    mentre la sezione sale dal fondo dello schermo fino in cima.
      // I colori arrivano dalla palette in globals.css.
      const palette = getComputedStyle(document.documentElement);
      const color = (name: string) => palette.getPropertyValue(name).trim();

      gsap.fromTo(
        document.body,
        { backgroundColor: color("--steel") },
        {
          backgroundColor: color("--wine"),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom", // la cima della sezione tocca il fondo dello schermo
            end: "top top", // la cima della sezione tocca la cima dello schermo
            scrub: true,
          },
        },
      );

      // La "telecamera": sposta e ingrandisce l'albero in modo che il punto
      // (x, y) dell'albero finisca al centro dello schermo.
      // Sono funzioni, così GSAP le ricalcola se la finestra cambia grandezza.
      const camera = (x: number, y: number, scale: () => number) => ({
        x: () => window.innerWidth / 2 - x * scale(),
        y: () => window.innerHeight / 2 - y * scale(),
        scale,
      });
      // Da vicino: grandezza piena, ma rimpicciolisce se lo schermo è basso o stretto.
      const closeUp = () =>
        Math.min(
          1,
          window.innerHeight / (NODE_H + 160),
          window.innerWidth / (NODE_W + 80),
        );

      // 2. La sezione resta ferma sullo schermo e, mentre scrolli,
      //    prima compare il titolo, poi l'albero si costruisce un membro alla volta.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=9000", // quanti pixel di scroll dura la sezione
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true, // ricalcola le misure se la finestra cambia grandezza
        },
      });

      tl.from(".family-label", { opacity: 0, y: 40 })
        .from(".letter", { opacity: 0, y: 80, stagger: 0.1 })
        .from(".family-intro", { opacity: 0, y: 40 })
        // Il titolo esce dall'alto.
        .to(
          ".family-header",
          { y: () => -window.innerHeight, ease: "none", duration: 1 },
          "+=0.5",
        );

      FAMILY_MEMBERS.forEach((member, i) => {
        const { x, top } = spot(shape, PHOTO, member.name);
        const focus = camera(x, top + NODE_H / 2, closeUp);

        // La telecamera va sul membro (sul primo ci salta, senza viaggio).
        if (i === 0) tl.set(treeRef.current, focus);
        else
          tl.to(treeRef.current, {
            ...focus,
            ease: "power1.inOut",
            duration: 1,
          });

        // Le linee che portano a questo membro si disegnano una dopo l'altra:
        // la prima parte insieme alla telecamera ("<"), le altre in fila.
        lines
          .filter((line) => line.before === member.name)
          .forEach((line, j) => {
            tl.from(
              `.line-${line.id}`,
              isHorizontal(line)
                ? { scaleX: 0, ease: "none", duration: 0.5 }
                : { scaleY: 0, ease: "none", duration: 0.5 },
              j === 0 ? "<" : ">",
            );
          });

        // Poi compare la scheda.
        tl.from(`.member-${member.name}`, { opacity: 0, y: 40, duration: 0.6 });
      });

      // 3. Alla fine ogni scheda diventa una carta e la telecamera
      //    si allontana per mostrare tutto l'albero. Tutto insieme ("<").
      // Da lontano: quanto basta per far entrare l'albero di carte.
      const overview = () =>
        Math.min(
          window.innerWidth / shape.width,
          window.innerHeight / cardsHeight,
        ) * 0.92;

      tl.to(
        treeRef.current,
        {
          ...camera(shape.width / 2, cardsHeight / 2, overview),
          ease: "power2.inOut",
          duration: 1.5,
        },
        "+=0.5",
      );

      // Le generazioni si avvicinano...
      FAMILY_MEMBERS.forEach((member) => {
        const { top } = spot(shape, CARD, member.name);
        tl.to(`.member-${member.name}`, { top, duration: 1.5 }, "<");
      });
      // ...e le linee si accorciano per seguirle.
      treeLines(shape, CARD).forEach((line) => {
        tl.to(`.line-${line.id}`, { ...lineBox(line), duration: 1.5 }, "<");
      });

      // Compaiono cornice e sfumatura della carta.
      tl.to(".member-card", { opacity: 1, duration: 1 }, "<")
        // La descrizione sparisce e si chiude (altezza 0)...
        .to(
          ".member-description",
          { opacity: 0, height: 0, marginTop: 0, duration: 0.8 },
          "<",
        )
        // ...così il testo può salire dentro la carta, appoggiato in basso:
        // yPercent -100 lo alza di tutta la sua altezza.
        .to(".member-text", { yPercent: -100, y: -12, x: 12, duration: 1 }, "<")
        // Da lontano i nomi diventano più grandi, così sul telefono si leggono.
        .to(
          ".member-name",
          { fontSize: () => `${Math.max(30, 12 / overview())}px`, duration: 1 },
          "<",
        )
        // Sul telefono il ruolo sarebbe troppo piccolo: sparisce.
        .to(
          ".member-role",
          { opacity: () => (overview() < 0.5 ? 0 : 1), duration: 1 },
          "<",
        );
    },
    // Se la forma cambia (giri il telefono), l'animazione si rifà da capo.
    { scope: sectionRef, dependencies: [shape], revertOnUpdate: true },
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden text-cream"
    >
      <div className="family-header absolute inset-0 flex flex-col items-center justify-center gap-8 text-center px-6">
        <h2 className="flex flex-col items-center leading-none">
          <span className="family-label text-[5vw] uppercase tracking-[0.2em]">
            La famiglia
          </span>
          <span className="flex text-[18vw]">
            {SURNAME.split("").map((letter, i) => (
              <span key={i} className="letter inline-block">
                {letter}
              </span>
            ))}
          </span>
        </h2>

        <p className="family-intro text-xl max-w-2xl">
          La famiglia di assassini più temuta al mondo. Vivono nella dimora sul
          monte Kukuroo e ogni figlio viene addestrato a uccidere fin da
          bambino. Killua è il terzo figlio.
        </p>
      </div>

      {/* Il foglio dell'albero: la telecamera lo muove partendo dall'angolo in alto a sinistra. */}
      <div
        ref={treeRef}
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: shape.width,
          height: (shape.rows - 1) * PHOTO.rowGap + NODE_H,
        }}
      >
        {lines.map((line) => {
          const [x1, y1] = line.from;
          const [x2, y2] = line.to;
          return (
            <div
              key={line.id}
              className={`line-${line.id} absolute bg-cream/40`}
              style={{
                ...lineBox(line),
                // La linea cresce dal lato di "from".
                transformOrigin: `${x2 < x1 ? "right" : "left"} ${y2 < y1 ? "bottom" : "top"}`,
              }}
            />
          );
        })}

        {FAMILY_MEMBERS.map((member) => {
          const { x, top } = spot(shape, PHOTO, member.name);
          return (
            <article
              key={member.name}
              className={`member-${member.name} absolute`}
              style={{
                left: x - NODE_W / 2,
                top,
                width: NODE_W,
                height: NODE_H,
              }}
            >
              {/* Sfondo della carta, dietro al personaggio. Invisibile finché non diventa carta. */}
              <div
                className="member-card absolute inset-x-0 top-0 rounded-xl bg-linear-to-b from-cream/5 to-rose/20 opacity-0"
                style={{ height: PHOTO_H }}
              />

              {/* Le immagini sono già scontornate: niente riquadro.
                In basso sfumano, così il taglio del corpo non si vede. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={member.image}
                alt={member.name}
                className="relative w-full object-contain object-bottom mask-b-from-75%"
                style={{ height: PHOTO_H }}
              />

              {/* Bordo della carta e sfumatura scura in basso, davanti al personaggio,
                così il nome si legge quando sale dentro la carta. */}
              <div
                className="member-card absolute inset-x-0 top-0 rounded-xl border border-rose/40 bg-linear-to-t from-wine via-transparent via-40% opacity-0"
                style={{ height: PHOTO_H }}
              />

              <div
                className="member-text absolute inset-x-0 pt-4"
                style={{ top: PHOTO_H }}
              >
                <p className="member-role text-xs uppercase tracking-[0.3em] text-rose">
                  {member.role}
                </p>
                <h3 className="member-name text-3xl uppercase">
                  {member.name}
                </h3>
                <p className="member-description mt-1 overflow-hidden text-sm text-cream/80">
                  {member.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
