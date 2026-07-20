# LEARNING ROADMAP — Sito Killua 🥋

Percorso per imparare a costruire un sito animato **scrivendo tu il codice**.
Ogni tappa aggiunge UNA tecnica nuova. Non passare alla successiva finché non
sei sicuro di quella prima.

Metodo di lavoro:
1. Ti spiego il concetto + il "perché"
2. Ti do un obiettivo concreto
3. **Scrivi tu il codice**
4. Io revisiono e correggo

---

## Tappa 0 — Fondamenta (già fatte ✅)
- Hero con parallax + pin (ScrollTrigger)
- Marquee loghi in loop
> Le rivedremo insieme per assicurarci che tu capisca OGNI riga.

## Tappa 1 — About / Bio → **Reveal on scroll**
Tecnica: elementi che appaiono (fade + slide) quando entrano nel viewport.
Concetti: `gsap.from()`, ScrollTrigger `toggleActions`, `once`.
Obiettivo: titolo + paragrafo di bio che entrano dal basso allo scroll.

## Tappa 2 — About/Bio avanzato → **Testo animato parola per parola**
Tecnica: `stagger` (animazioni sfalsate). Split del testo in parole/lettere.
Concetti: `gsap.from(..., { stagger: 0.05 })`, timeline.
Obiettivo: la bio si compone parola per parola.

## Tappa 3 — Nen / Abilità → **Cards + micro-interazioni hover**
Tecnica: `stagger` all'ingresso + hover con GSAP (scale, glow).
Concetti: timeline riutilizzabile, `gsap.timeline()`, event handler + GSAP.
Obiettivo: griglia di card poteri (es. Godspeed, Nen elettrico) che entrano a
cascata e reagiscono al mouse.

## Tappa 4 — Galleria → **Scroll orizzontale**
Tecnica: pin della sezione + traslazione orizzontale legata allo scroll.
Concetti: ScrollTrigger `pin` + `scrub`, calcolo della distanza da scrollare.
Obiettivo: fila di immagini che scorre in orizzontale mentre scrolli in verticale.

## Tappa 5 — Timeline / Storia → **Percorso verticale con progress**
Tecnica: barra/linea che si riempie in base allo scroll + tappe che si attivano.
Concetti: più ScrollTrigger coordinati, `scrub`, animazione di una linea SVG/height.
Obiettivo: timeline verticale degli eventi che si "accende" scorrendo.

## Tappa 6 — Amicizia con Gon → **Sezione narrativa / scrollytelling**
Tecnica: due elementi (Killua + Gon) che convergono; testo che cambia con lo scroll.
Concetti: timeline complessa dentro un pin, sincronizzazione di più tween.
Obiettivo: momento "clou" del sito — i due personaggi si avvicinano mentre
scorre il racconto della loro amicizia.

---

## Regole d'oro GSAP (da tenere a mente sempre)
- `gsap.from` = animo DA uno stato VERSO quello attuale (perfetto per i reveal).
- `gsap.to` = animo dallo stato attuale VERSO uno nuovo.
- `scrub: true` = l'animazione è "legata" allo scroll (va avanti/indietro).
- `toggleActions` = cosa fa l'animazione quando entra/esce dal viewport (senza scrub).
- Usa sempre `useGSAP` con uno `scope` (ref del container) per la pulizia automatica.
- `markers: true` in ScrollTrigger = mostra le linee di start/end per debug. TOGLILE dopo.
```
