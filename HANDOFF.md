# HANDOFF — Progetto "Killua" 🎯

Documento di studio per capire com'è fatto questo progetto e cosa serve
imparare per portarlo avanti. Pensato per essere letto dall'alto verso il basso.

---

## 1. Cos'è

Sito portfolio / landing page a tema **Hunter × Hunter** (personaggio *Killua
Zoldyck*). È un progetto didattico: l'obiettivo principale è imparare le
**animazioni web con GSAP** e il layout con **Tailwind v4** dentro **Next.js**.

Stato: la sezione **Hero** è finita (titolo + immagine con parallax on-scroll),
c'è un **marquee** di loghi che scorre, e la sezione **AboutMe** è ancora vuota
(prossimo pezzo da costruire).

---

## 2. Stack tecnologico

| Tecnologia | Versione | A cosa serve |
|---|---|---|
| Next.js (App Router) | 15.5.3 | Framework React, routing a cartelle, ottimizzazione immagini |
| React | 19.1 | Libreria UI |
| TypeScript | 5 | Tipi statici |
| Tailwind CSS | v4 | Stile tramite classi utility |
| GSAP + @gsap/react | 3.13 | Animazioni (parallax, scroll, marquee) |
| ScrollTrigger (plugin GSAP) | — | Animazioni legate allo scroll |
| DaisyUI | 5.1 | Libreria di componenti su Tailwind — **installata ma non ancora usata** |

Package manager: **pnpm** (c'è `pnpm-lock.yaml`; esiste anche un
`package-lock.json` residuo — meglio tenerne uno solo, vedi §7).

---

## 3. Comandi

```bash
pnpm install     # installa le dipendenze
pnpm dev         # avvia in sviluppo su http://localhost:3000
pnpm build       # build di produzione
pnpm start       # avvia la build di produzione
```

Non ci sono ancora script di lint/test configurati.

---

## 4. Struttura dei file

```
src/
├── app/
│   ├── layout.tsx      # layout radice: <html>/<body>, caricamento font
│   ├── page.tsx        # home page: monta Hero + marquee loghi + AboutMe
│   └── globals.css     # Tailwind + variabili tema + stile <h1>
├── components/
│   ├── Hero.tsx        # titolo "KILLUA ZOLDYCK" + immagine con parallax
│   └── AboutMe.tsx     # ⚠️ ancora vuoto, da costruire
├── assets/             # Killua.png, hxh.png (logo), bg-gradient.png
└── fonts/              # Orbitron, Anton, Muhaqu (file .ttf/.otf locali)
```

---

## 5. Come funzionano le animazioni (il cuore del progetto)

### 5.1 Pattern base: `useGSAP`
In ogni componente animato si usa l'hook `useGSAP(() => { ... })` di
`@gsap/react`. È come uno `useEffect` ma pensato per GSAP: esegue le animazioni
dopo il montaggio e **pulisce automaticamente** le animazioni allo smontaggio
(niente memory leak). Si accede agli elementi DOM tramite `useRef`.

### 5.2 Hero — parallax on-scroll (`src/components/Hero.tsx`)
- Il plugin va registrato una volta: `gsap.registerPlugin(ScrollTrigger)`.
- **Immagine di Killua**: viene "pinnata" (`pin: true`) mentre scrolli, così
  resta ferma sullo schermo per un tratto. `scrub: true` collega l'avanzamento
  dell'animazione alla barra di scroll.
- **Titolo "Killua" / "Zoldyck"**: le due parole si allontanano
  orizzontalmente (`x: -350` e `x: +350`) man mano che scrolli → effetto di
  apertura.
- `start` / `end` / `endTrigger` definiscono *quando* parte e finisce
  l'animazione rispetto alla posizione dell'elemento nel viewport.
- `invalidateOnRefresh: true` ricalcola le misure al resize della finestra.

Concetti GSAP da studiare qui: **timeline vs tween singoli**, `gsap.to` /
`gsap.fromTo` / `gsap.set`, e soprattutto le opzioni di **ScrollTrigger**
(`trigger`, `start`, `end`, `scrub`, `pin`, `pinSpacing`).

### 5.3 Marquee loghi (`src/app/page.tsx`)
- Due container di loghi che scorrono in senso opposto (`xPercent` da 0 a -50 e
  viceversa), `repeat: -1` = loop infinito, `ease: "linear"`.
- Trucco del loop fluido: la lista di loghi è **duplicata** (20 + 20). Si anima
  del 50% (`xPercent: -50`), così quando riparte l'occhio non nota lo stacco.
- I due nastri sono ruotati (`-rotate-6` / `rotate-6`) per l'effetto grafico.

---

## 6. Layout, font e stile

- **Font** (`layout.tsx`): Orbitron, Anton e Geist caricati via
  `next/font/google`. In `<body>` è applicato `anton.className`.
- Esistono anche font **locali** in `src/fonts/` (Muhaqu, Orbitron statici) non
  ancora collegati via `@font-face` — in `globals.css` c'è codice commentato che
  li prepara.
- **Tailwind v4**: si configura *nel CSS*, non più in `tailwind.config.js`.
  In `globals.css`: `@import "tailwindcss"` + blocco `@theme inline` per le
  variabili colore/font.
- **`<h1>` speciale**: usa `-webkit-text-stroke` (contorno bianco) con riempimento
  trasparente → effetto "testo vuoto contornato". Attenzione: fa riferimento a
  `font-family: Muhaqu` che non è ancora caricato (vedi §7).

---

## 7. Punti aperti / cose da sistemare

1. **`AboutMe.tsx` è vuoto** — è il prossimo blocco da costruire (il contenuto).
2. **Metadata di default**: in `layout.tsx` titolo e descrizione sono ancora
   "Create Next App" → da personalizzare (SEO / titolo scheda browser).
3. **Font Muhaqu non caricato**: `globals.css` usa `font-family: Muhaqu` sull'`h1`
   ma la regola `@font-face` è commentata → il font non viene applicato davvero.
4. **Doppio lockfile**: ci sono sia `pnpm-lock.yaml` sia `package-lock.json`.
   Scegli un package manager e cancella l'altro lockfile per evitare confusione.
5. **DaisyUI installato ma inutilizzato**: valuta se serve davvero o rimuovilo.
6. **Niente lint/test**: potresti aggiungere ESLint (Next lo integra) per pulizia.

---

## 8. Cosa studiare, in ordine

1. **App Router di Next.js**: differenza tra Server e Client Component
   (`"use client"` in cima ai file animati — serve perché GSAP tocca il DOM).
2. **`next/image`**: perché si usa `<Image>` invece di `<img>` (ottimizzazione).
3. **GSAP + ScrollTrigger**: è il 70% del valore didattico di questo progetto.
   Doc ufficiale: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
4. **Tailwind v4**: la nuova config CSS-first (`@theme`), differenza con la v3.
5. **`useGSAP` e `useRef`**: come React e GSAP collaborano senza conflitti.

---

## 9. Glossario veloce

- **Parallax**: elementi che si muovono a velocità diverse durante lo scroll.
- **Pin**: "inchiodare" un elemento sullo schermo per un tratto di scroll.
- **Scrub**: legare l'avanzamento dell'animazione alla posizione dello scroll.
- **Marquee**: nastro di contenuti che scorre in loop continuo.
- **Tween**: una singola animazione GSAP (da uno stato A a uno stato B).
