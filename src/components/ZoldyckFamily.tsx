"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SURNAME = "ZOLDYCK";

// Sizes of a member box in "tree pixels". They are not screen pixels:
// the camera zooms the whole tree in or out based on the screen,
// so the sizes in here always stay in proportion.
const NODE_W = 240; // width of a member box (and of the card)
const PHOTO_H = 360; // height of the photo (and of the card)
const NODE_H = 540; // height of a member box, photo + text
const LINE_GAP = 12; // space between the end of a line and the photo or card

// Role, description and Nen type are in messages/*.json, under ZoldyckFamily.members.
type FamilyMember = {
  name: string;
  // Path of the photo inside public/, for example "/zoldyck-family/zeno.webp".
  image: string;
};

// The order matters: it's the order in which members appear as you scroll.
const FAMILY_MEMBERS: FamilyMember[] = [
  {
    name: "Zeno",
    image: "/zoldyck-family/zeno.webp",
  },
  {
    name: "Silva",
    image: "/zoldyck-family/silva.webp",
  },
  {
    name: "Kikyo",
    image: "/zoldyck-family/kikyo.webp",
  },
  {
    name: "Illumi",
    image: "/zoldyck-family/illumi.webp",
  },
  {
    name: "Milluki",
    image: "/zoldyck-family/milluki.webp",
  },
  {
    name: "Killua",
    image: "/hero/Killua.png",
  },
  {
    name: "Alluka",
    image: "/zoldyck-family/alluka.webp",
  },
  {
    name: "Kalluto",
    image: "/zoldyck-family/kalluto.webp",
  },
];

// The two "modes" of each member box:
// - PHOTO: the character with the description below, while you scroll;
// - CARD: at the end it becomes a card, with the text inside.
type Mode = {
  rowGap: number; // distance between the top of one generation and the next
  w: number; // width of what you see (the lines stop before it)
  h: number; // height of what you see
};

const PHOTO: Mode = { rowGap: 660, w: PHOTO_H / 2, h: PHOTO_H + 130 }; // the photos are 1:2
const CARD: Mode = { rowGap: 440, w: NODE_W, h: PHOTO_H };

// The two "shapes" of the tree:
// - WIDE: wide screens (computer, landscape iPad), all the children in one row;
// - TALL: tall screens (phone, portrait iPad), the children on two rows.
// For each member: horizontal center (x) and row (row: 0 = grandfather, 1 = parents...).
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

// A line goes from point "from" to point "to" and is always straight
// (horizontal or vertical). It is drawn starting from "from".
// "before" is the member that appears right after the line is drawn.
type TreeLine = {
  id: string;
  from: [number, number];
  to: [number, number];
  before: string;
};

// Works out all the lines from where the member boxes are.
// Each line stops LINE_GAP away from the photo or card: it never touches it.
const treeLines = (shape: Shape, mode: Mode): TreeLine[] => {
  const zeno = spot(shape, mode, "Zeno");
  const silva = spot(shape, mode, "Silva");
  const kikyo = spot(shape, mode, "Kikyo");
  const marriageY = silva.top + PHOTO_H / 2; // halfway down the photos of Silva and Kikyo
  const middle = (silva.x + kikyo.x) / 2; // the children come down from here

  const lines: TreeLine[] = [
    // Comes from above, as if the tree went on with the ancestors.
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
    // The marriage: side to side, between Silva and Kikyo.
    {
      id: "marriage",
      from: [silva.x + mode.w / 2 + LINE_GAP, marriageY],
      to: [kikyo.x - mode.w / 2 - LINE_GAP, marriageY],
      before: "Kikyo",
    },
  ];

  // The children, row by row. For each row: the trunk goes down from the center
  // to a horizontal bar; the bar stretches toward each child
  // and from there a short line goes down to their box.
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

    // How far the bar has already reached, left and right of the trunk.
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

// Position and size of the div that draws the line (2px thick).
const lineBox = ({ from: [x1, y1], to: [x2, y2] }: TreeLine) => ({
  left: Math.min(x1, x2) - 1,
  top: Math.min(y1, y2) - 1,
  width: Math.abs(x2 - x1) || 2,
  height: Math.abs(y2 - y1) || 2,
});

// Picks the shape based on the screen: taller than wide = TALL.
// It updates by itself if you rotate the phone or resize the window.
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
  const t = useTranslations("ZoldyckFamily");
  // A member's text in the current language, e.g. text(member, "role").
  const text = (member: FamilyMember, field: "role" | "description" | "nen") =>
    t(`members.${member.name.toLowerCase()}.${field}`);
  const sectionRef = useRef<HTMLElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const shape = useShape();
  const lines = treeLines(shape, PHOTO);
  const cardsHeight = (shape.rows - 1) * CARD.rowGap + PHOTO_H;
  // true when the tree has turned into cards: only then can you play with the cards.
  const cardsReady = useRef(false);
  // The card that is flipped right now (at most one).
  const openCard = useRef<HTMLElement | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      // 1. The background of the whole page goes from blue-gray to dark wine
      //    while the section rises from the bottom of the screen to the top.
      // The colors come from the palette in globals.css.
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
            start: "top bottom", // the top of the section touches the bottom of the screen
            end: "top top", // the top of the section touches the top of the screen
            scrub: true,
          },
        },
      );

      // The "camera": moves and zooms the tree so that the point
      // (x, y) of the tree ends up in the center of the screen.
      // They are functions, so GSAP recalculates them if the window is resized.
      const camera = (x: number, y: number, scale: () => number) => ({
        x: () => window.innerWidth / 2 - x * scale(),
        y: () => window.innerHeight / 2 - y * scale(),
        scale,
      });
      // Close up: full size, but it shrinks if the screen is short or narrow.
      const closeUp = () =>
        Math.min(
          1,
          window.innerHeight / (NODE_H + 160),
          window.innerWidth / (NODE_W + 80),
        );

      // 2. The section stays still on the screen and, as you scroll,
      //    first the title appears, then the tree builds up one member at a time.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=9000", // how many pixels of scroll the section lasts
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true, // recalculates the sizes if the window is resized
        },
        // On every step of the animation, checks whether we have reached the end.
        // The "cards-ready" class on the tree shows the hand cursor on the cards.
        onUpdate: () => {
          cardsReady.current = tl.progress() > 0.99;
          treeRef.current!.classList.toggle("cards-ready", cardsReady.current);
        },
      });

      tl.from(".family-label", { opacity: 0, y: 40 })
        .from(".letter", { opacity: 0, y: 80, stagger: 0.1 })
        .from(".family-intro", { opacity: 0, y: 40 })
        // The title leaves through the top.
        .to(
          ".family-header",
          { y: () => -window.innerHeight, ease: "none", duration: 1 },
          "+=0.5",
        );

      FAMILY_MEMBERS.forEach((member, i) => {
        const { x, top } = spot(shape, PHOTO, member.name);
        const focus = camera(x, top + NODE_H / 2, closeUp);

        // The camera goes to the member (it jumps straight to the first one, no travel).
        if (i === 0) tl.set(treeRef.current, focus);
        else
          tl.to(treeRef.current, {
            ...focus,
            ease: "power1.inOut",
            duration: 1,
          });

        // The lines leading to this member are drawn one after the other:
        // the first starts together with the camera ("<"), the others in a row.
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

        // Then the member box appears.
        tl.from(`.member-${member.name}`, { opacity: 0, y: 40, duration: 0.6 });
      });

      // 3. At the end each member box becomes a card and the camera
      //    pulls back to show the whole tree. All at once ("<").
      // From far away: just enough to fit the tree of cards.
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

      // The generations move closer...
      FAMILY_MEMBERS.forEach((member) => {
        const { top } = spot(shape, CARD, member.name);
        tl.to(`.member-${member.name}`, { top, duration: 1.5 }, "<");
      });
      // ...and the lines get shorter to follow them.
      treeLines(shape, CARD).forEach((line) => {
        tl.to(`.line-${line.id}`, { ...lineBox(line), duration: 1.5 }, "<");
      });

      // The card's border and fade appear.
      tl.to(".member-card", { opacity: 1, duration: 1 }, "<")
        // The description disappears and closes up (height 0)...
        .to(
          ".member-description",
          { opacity: 0, height: 0, marginTop: 0, duration: 0.8 },
          "<",
        )
        // ...so the text can move up inside the card, resting at the bottom:
        // yPercent -100 lifts it by its full height.
        .to(".member-text", { yPercent: -100, y: -12, x: 12, duration: 1 }, "<")
        // From far away the names get bigger, so you can read them on a phone.
        .to(
          ".member-name",
          { fontSize: () => `${Math.max(30, 12 / overview())}px`, duration: 1 },
          "<",
        )
        // On a phone the role would be too small: it disappears.
        .to(
          ".member-role",
          { opacity: () => (overview() < 0.5 ? 0 : 1), duration: 1 },
          "<",
        );

      // If you scroll while a card is flipped, the card goes back to its place.
      const onScroll = () => {
        if (openCard.current) closeCard(openCard.current);
      };
      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    },
    // If the shape changes (you rotate the phone), the animation starts over.
    { scope: sectionRef, dependencies: [shape], revertOnUpdate: true },
  );

  // --- The cards can be used with the mouse ---
  // Each card is made of 3 layers, one inside the other, and each does one thing only:
  // - member-zoom: brings the card to the center of the screen and makes it bigger;
  // - member-tilt: tilts the card toward the mouse;
  // - member-flip: flips the card to show the back.
  const layer = (card: HTMLElement, name: string) =>
    card.querySelector<HTMLElement>(`.member-${name}`)!;

  // The mouse moves over the card: the card tilts toward it
  // and a light reflection follows it.
  // The effect is only on wide screens with a real mouse:
  // on a phone (TALL shape) or touch screens, tapping the card just flips it.
  const canTilt = () =>
    shape === WIDE &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const onCardMove = contextSafe((e: React.PointerEvent<HTMLElement>) => {
    if (!cardsReady.current || openCard.current || !canTilt()) return;
    const tilt = layer(e.currentTarget, "tilt");
    const rect = tilt.getBoundingClientRect();
    // Where the mouse is inside the card, from 0 (left/top) to 1 (right/bottom).
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    gsap.to(tilt, {
      rotationY: (px - 0.5) * 30, // at most 15 degrees per side
      rotationX: (0.5 - py) * 30,
      scale: 1.06,
      transformPerspective: 800, // how "deep" the tilt is
      duration: 0.4,
      ease: "power2.out",
    });
    // The reflection uses these two CSS variables to know where to draw itself.
    tilt.style.setProperty("--mx", `${px * 100}%`);
    tilt.style.setProperty("--my", `${py * 100}%`);
    gsap.to(layer(e.currentTarget, "glare"), { opacity: 1, duration: 0.3 });
  });

  // The mouse leaves the card: it goes back straight and the reflection disappears.
  const onCardLeave = contextSafe((e: React.PointerEvent<HTMLElement>) => {
    if (openCard.current === e.currentTarget) return;
    gsap.to(layer(e.currentTarget, "tilt"), {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.6,
      ease: "power3.out",
    });
    gsap.to(layer(e.currentTarget, "glare"), { opacity: 0, duration: 0.3 });
  });

  // Flips the card and brings it, big, to the center of the screen.
  const showCard = contextSafe((card: HTMLElement) => {
    const tree = treeRef.current!;
    const treeScale = gsap.getProperty(tree, "scale") as number;
    // Where the center of the card is on the screen right now.
    const screenX =
      (gsap.getProperty(tree, "x") as number) +
      (card.offsetLeft + NODE_W / 2) * treeScale;
    const screenY =
      (gsap.getProperty(tree, "y") as number) +
      (card.offsetTop + PHOTO_H / 2) * treeScale;
    // How much to enlarge it: 70% of the screen height, but never wider than 85%.
    const zoom =
      Math.min(
        (window.innerHeight * 0.7) / PHOTO_H,
        (window.innerWidth * 0.85) / NODE_W,
      ) / treeScale;

    openCard.current = card;
    card.style.zIndex = "20"; // in front of all the other cards
    gsap.to(layer(card, "tilt"), {
      rotationX: 0,
      rotationY: 0,
      scale: 1,
      duration: 0.4,
    });
    gsap.to(layer(card, "glare"), { opacity: 0, duration: 0.3 });
    gsap.to(layer(card, "zoom"), {
      // The movement is divided by treeScale because the card is inside the tree,
      // which the camera has already shrunk.
      x: (window.innerWidth / 2 - screenX) / treeScale,
      y: (window.innerHeight / 2 - screenY) / treeScale,
      scale: zoom,
      duration: 0.7,
      ease: "power3.inOut",
    });
    gsap.to(layer(card, "flip"), {
      rotationY: 180,
      transformPerspective: 1200,
      duration: 0.8,
      ease: "power3.inOut",
    });
    gsap.to(".family-backdrop", { autoAlpha: 1, duration: 0.5 });
  });

  // Flips the card back and puts it back in its place in the tree.
  const closeCard = contextSafe((card: HTMLElement) => {
    openCard.current = null;
    gsap.to(layer(card, "zoom"), {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: "power3.inOut",
    });
    gsap.to(layer(card, "flip"), {
      rotationY: 0,
      duration: 0.8,
      ease: "power3.inOut",
      onComplete: () => {
        card.style.zIndex = "";
      },
    });
    gsap.to(".family-backdrop", { autoAlpha: 0, duration: 0.5 });
  });

  const onCardClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardsReady.current) return;
    const card = e.currentTarget;
    if (openCard.current === card) return closeCard(card);
    if (openCard.current) closeCard(openCard.current);
    showCard(card);
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden text-cream"
    >
      <div className="family-header absolute inset-0 flex flex-col items-center justify-center gap-8 text-center px-6">
        <h2 className="flex flex-col items-center leading-none">
          <span className="family-label text-[5vw] uppercase tracking-[0.2em]">
            {t("label")}
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
          {t("intro")}
        </p>
      </div>

      {/* The tree sheet: the camera moves it starting from the top left corner. */}
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
                // The line grows from the "from" side.
                transformOrigin: `${x2 < x1 ? "right" : "left"} ${y2 < y1 ? "bottom" : "top"}`,
              }}
            />
          );
        })}

        {/* Dark veil behind the flipped card. It's huge because it's inside the tree,
            which moves and shrinks: this way it always covers the whole screen.
            Clicking it closes the card. */}
        <div
          className="family-backdrop invisible absolute -inset-[4000px] z-10 bg-wine/80 opacity-0"
          onClick={() => openCard.current && closeCard(openCard.current)}
        />

        {FAMILY_MEMBERS.map((member) => {
          const { x, top } = spot(shape, PHOTO, member.name);
          // The center of the card: from here the card grows, tilts and flips.
          const cardCenter = { transformOrigin: `50% ${PHOTO_H / 2}px` };
          return (
            <article
              key={member.name}
              className={`member-${member.name} absolute in-[.cards-ready]:cursor-pointer`}
              style={{
                left: x - NODE_W / 2,
                top,
                width: NODE_W,
                height: NODE_H,
              }}
              onPointerMove={onCardMove}
              onPointerLeave={onCardLeave}
              onClick={onCardClick}
            >
              <div className="member-zoom" style={cardCenter}>
                <div className="member-tilt" style={cardCenter}>
                  <div
                    className="member-flip relative transform-3d"
                    style={cardCenter}
                  >
                    {/* --- Front --- */}
                    <div className="relative backface-hidden">
                      {/* Card background, behind the character. Invisible until it becomes a card. */}
                      <div
                        className="member-card absolute inset-x-0 top-0 rounded-xl bg-linear-to-b from-cream/5 to-rose/20 opacity-0"
                        style={{ height: PHOTO_H }}
                      />

                      {/* The images already have the background removed: no frame.
                They fade out at the bottom, so the cut of the body doesn't show. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.image}
                        alt={member.name}
                        className="relative w-full object-contain object-bottom mask-b-from-75%"
                        style={{ height: PHOTO_H }}
                      />

                      {/* Card border and dark fade at the bottom, in front of the character,
                so the name is readable when it moves up inside the card. */}
                      <div
                        className="member-card absolute inset-x-0 top-0 rounded-xl border border-rose/40 bg-linear-to-t from-wine via-transparent via-40% opacity-0"
                        style={{ height: PHOTO_H }}
                      />


                      <div
                        className="member-text absolute inset-x-0 pt-4"
                        style={{ top: PHOTO_H }}
                      >
                        <p className="member-role text-xs uppercase tracking-[0.3em] text-rose">
                          {text(member, "role")}
                        </p>
                        <h3 className="member-name text-3xl uppercase">
                          {member.name}
                        </h3>
                        <p className="member-description mt-1 overflow-hidden text-sm text-cream/80">
                          {text(member, "description")}
                        </p>
                      </div>

                      {/* Light reflection that follows the mouse (position from --mx and --my). */}
                      <div
                        className="member-glare pointer-events-none absolute inset-x-0 top-0 rounded-xl opacity-0 mix-blend-overlay"
                        style={{
                          height: PHOTO_H,
                          background:
                            "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.7), transparent 60%)",
                        }}
                      />
                    </div>

                    {/* --- Back: already turned 180 degrees, only visible when the card flips --- */}
                    <div
                      className="absolute inset-x-0 top-0 flex flex-col rounded-xl border border-rose/40 bg-linear-to-b from-wine to-ink p-5 backface-hidden rotate-y-180"
                      style={{ height: PHOTO_H }}
                    >
                      <p className="text-[10px] uppercase tracking-[0.3em] text-rose">
                        {text(member, "role")}
                      </p>
                      <h3 className="text-4xl uppercase leading-none">
                        {member.name}
                      </h3>
                      <div className="my-4 h-px bg-rose/40" />
                      <p className="text-sm leading-snug text-cream/85">
                        {text(member, "description")}
                      </p>
                      <div className="mt-auto">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-rose">
                          {t("nenType")}
                        </p>
                        <p className="text-lg uppercase">{text(member, "nen")}</p>
                        <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-cream/40">
                          {t("clickToClose")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
