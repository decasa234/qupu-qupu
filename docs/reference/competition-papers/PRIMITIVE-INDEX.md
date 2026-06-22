# Primitive index — IMPORT-FIRST for figure builds

Before writing ANY SVG geometry, check this index. If a primitive matches your figure
type, **import it and pass data/props** — do NOT re-derive the math. All primitives live in
`src/components/wmi/PastPapers/WMI/primitives/` → from a component in that dir, import via
relative `./primitives/<Name>`. All are pure-SVG, SSR-safe (no hooks, no framer-motion), so
both the illustration AND the explainer can render them; the explainer adds motion around them.

## Importable primitives (reuse these — don't regenerate)

| Figure type | Import | Key props | Notes |
|---|---|---|---|
| **Isometric cubes / voxel stacks** | `import { IsoCubes, isoProject } from './primitives/IsoCubes'` | `cubes: {x,y,z,color?,faceLabel?}[]`, `size?`, `palette?` | Root `<svg>`, auto viewBox + painter-sort. `<IsoCubes cubes={[{x:0,y:0,z:0},{x:1,y:0,z:0},{x:1,y:0,z:1}]} />` |
| **Cell grids / number tables / sum grids / coloured squares** | `import { GridBoard, gridBoardViewBox } from './primitives/GridBoard'` | `rows, cols, cellSize?, fill?(r,c), label?(r,c), highlight?(r,c)=>'none'|'ring'|'amber'|'green'|'red', rowSums?, colSums?` | Emits `<g>` → wrap: `<svg viewBox={gridBoardViewBox(r,c,cell,rowSums,colSums)}><GridBoard .../></svg>` |
| **Pan-balance weight puzzles** | `import { BalanceScale, WeightBlock } from './primitives/BalanceScale'` | `left, right` (ReactNode pan contents), `tilt: -1|0|1`, `panW?` | Compose several `<BalanceScale>` in one `<svg>` for multi-scale. `WeightBlock({kg})` = cast-iron weight glyph. |
| **Cell-grid mazes / grid-walk** | `import { MazeGrid, bfsPath } from './primitives/MazeGrid'` | `rows, cols, blocked?:[col,row][], cellFill?(col,row), start?{cell,glyph?}, goal?{cell,glyph?}, path?:[col,row][], cellSize?` | **cells are `[col,row]`**. Emits `<g>` → wrap in `<svg>`. `bfsPath(rows,cols,blocked,start,goal)` → shortest `[col,row][]` for trails. |
| **Piece shapes / polyominoes / matchstick shapes** | `import { Polyomino, cellEdges } from './primitives/Polyomino'` | `cells:[row,col][], cellSize?, fill?, stroke?, mode?:'filled'|'matchstick', showGrid?` | Root `<svg>`, normalises to bbox. `cellEdges(cells)` = deduped boundary edges. |
| **Number lines / linear positions / hop sequences** | `import NumberLine from './primitives/NumberLine'` (DEFAULT export) | `min, max, step?, marks?:{value,label?,color?}[], jumps?:{from,to,label?,color?}[], width?, label?` | Root `<svg>`. Arc height auto-scales with jump span. |
| **Node-edge graphs / networks / distance maps / circle-sum** | `import { NodeGraph } from './primitives/NodeGraph'` | `nodes:{id,x,y,fill?,label?}[]` (x,y px), `edges:{a,b,label?,curve?,color?}[]`, `nodeR?, width?, height?` | Root `<svg>`. `curve` = quadratic-bezier bulge px. Edge labels at midpoints. |
| **Common decorative glyphs** | `import { Apple, Banana, Star, Coin, Candle, Balloon, Tree, House, Arrow, Cherry } from './primitives/glyphs'` | each: `{cx?,cy?,size?/r?,color?}` (+ `Coin.label`, `Candle.lit`, `Balloon.points`, `Arrow.dir`) | Emit `<g>` → place inside your own `<svg>`. |

## Copy-adapt catalog (no primitive yet — copy the closest proven component)

When the figure type isn't covered above, copy-adapt the closest **existing** component
(do NOT search the 970-entry pool — go straight to these):

- **Paper fold (+ cut/punch):** `PaperFold10Illustration`, `FoldSquare14ECIllustration`, `FoldCut18ECIllustration`
- **Weave / braid:** `Weave13Illustration` (WeavePanel), `Braid8PEIllustration`
- **Staircase (steps + figures):** `Staircase1PEIllustration`, `KangSteps13ECIllustration`
- **Clock face:** `ClockHoles3ECIllustration`, `Opts20ECIllustration` (AnalogClock), `ClockPieces23G3Illustration`
- **Concentric rings / dartboard / target:** `Rings9ECIllustration`, `Targets5ECIllustration`
- **Height bars / ordering:** `HeightOrder22G1Illustration`, `Candles1ECIllustration`
- **Card row (numbered cards / stacks):** `NumCards24PEIllustration`, `CardStack11Illustration`, `CardLayout24G3Illustration`
- **Map / route (curved roads + houses):** `HomeMap25G1Illustration`, `VillageMap10PEIllustration`, `RouteMap23PEIllustration`
- **Dice / sticker-cube:** `DiceRoll17ECIllustration`, `StickerCube7ECIllustration`
- **Trains / cars in a lane:** `Trains18PEIllustration`, `CarsLane9ECIllustration`
- **Repeating pattern / sequence / necklace:** `Pattern4PEIllustration`, `Necklace3Illustration`
- **Picture-option renderer (the co-exported `<Name>Option` pattern):** `CubeShapes14Illustration` is the canonical reference — always export `<Name>Option` as a NAMED export.

When you DO write a fresh generic primitive (one that will recur), add it to `./primitives/`
and a row to this table so the next build imports it.
