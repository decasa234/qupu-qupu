# Figure-question component build brief (full-SVG quality bar)

Build a bespoke **SVG** illustration (+ animated explainer + steps; + an OPTION renderer
when the A/B/C/D choices are pictures) for ONE paper question, **reusing existing
components**, and RETURN the registry wiring (do NOT edit `registry.ts` or the seed —
the controller applies those). Worktree:
`/Users/vics/Development/Project/qupu-website/.claude/worktrees/claude-mythos-optimization`.

## Read first
- The question in its seed JSON: `body_en/id`, `choices_en/id`, `answer`, and
  `breakdown.quantities` — your visuals MUST bind to these quantities (anti-drift).
- The REAL figure: the MinerU OCR md for the paper (controller gives the path) — find the
  question, view its crop image(s) in the paper's `*.imgs/` dir (a stem crop and, for
  picture-choice questions, the option crops). Reconstruct faithfully so the given answer
  holds.
- **IMPORT-FIRST (before writing any SVG):** read
  `docs/reference/competition-papers/PRIMITIVE-INDEX.md`. If a primitive matches your figure
  type (iso-cubes, grid, balance-scale, maze, polyomino, number-line, node-graph, glyphs),
  **import it from `./primitives/<Name>` and pass data/props — do NOT re-derive the geometry.**
  If no primitive fits, copy-adapt the index's named copy-adapt component for that type. Only
  write fresh SVG when nothing matches; if it is a generic recurring type, add it to
  `./primitives/` + the index. (Skip the 970-entry EXPLAINER_POOL — the index is curated.)
- Reference patterns: `FlagpoleCastle22Illustration/Explainer/Steps` (trio structure +
  shared-primitive co-export + `useBeatControl`); `CubeShapes14Illustration` (co-exported
  `...Option` for picture choices); registry `CHOICE_RENDERERS['WMI-22F3A-Q5']` (loader).

## Build (house style)
- SVG only (NEVER raster). Plain geometric shapes / single-codepoint glyphs only.
- The STEM illustration shows only the PROBLEM, never the answer.
- **Stem vs options rule:**
  - Real stem figure distinct from the choices → build `<Name>Illustration.tsx` (stem).
  - A/B/C/D choices are pictures → ALSO co-export `<Name>Option` (renders ONE choice) for
    `CHOICE_RENDERERS`, drawn to EXACTLY match the source options.
  - The choices ARE the only figures (no separate stem, e.g. the cube-shapes question) →
    build ONLY the `Option` renderer + explainer, **NO stem illustration** (it would
    duplicate the options).
- `<Name>Explainer.tsx` + `<name>Steps.ts`: animate the solution beat-by-beat (one idea
  per beat; show the arithmetic), landing on the answer; import the illustration's primitive.
- All files in `src/components/wmi/PastPapers/WMI/`.

## Verify (do NOT touch registry.ts or the seed)
- **Do NOT run `npm run check`, `npm run lint`, or `npm run build`** — the full-project
  typecheck is memory-heavy and OOM-crashes when several agents run it in parallel. The
  controller runs ONE sequential typecheck at commit time.
- **Only** do a `tsx` SSR smoke: a `__s<N>.tsx` at repo root importing your component(s) via
  `@/components/wmi/PastPapers/WMI/<Name>...`, `renderToStaticMarkup` for lang 'en' and 'id'
  (+ each option for picture-choice questions), assert each contains `<svg`; run
  `./node_modules/.bin/tsx __s<N>.tsx`; then delete it. (tsx compiles only your files — light.)

## Report (≤12 lines)
files created; which pool component you reused/adapted; that the figure + answer are
faithful; smoke result; the EXACT registry lines to add (`VISUALS['<CODE>']` with
`illustration?`+`explainer`, and/or `CHOICE_RENDERERS['<CODE>']`); and a note to set the
question's `figure_url` to `null`.
