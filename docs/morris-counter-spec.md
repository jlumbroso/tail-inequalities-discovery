# Morris Counter Visualization — Complete Specification

A React single-file component (`morris-counter.jsx`) that teaches approximate counting (R. Morris, 1978) through a horizontally-growing tape of coin flips, segmented by heads events, with a live stats panel and a persistent histogram of completed runs.

---

## 1. Educational Purpose

The central insight to communicate: **the Morris counter stores only C (≈ log log n bits), yet recovers an estimate of n via 2^C − 2.** The visualization makes this visible by showing:

- Every single coin flip as a column on a growing tape
- The probability of each flip stamped directly on the column
- Segments (groups of flips between two heads) that visibly *stretch longer* as C increases — because the probability of getting a heads halves each time C increments
- The exact counter always incrementing by 1 in a row below, making the compression contrast tangible

---

## 2. Color Palette

All colors live in a single `C` object. Use them by name throughout — never hardcode hex values elsewhere.

| Token | Hex | Usage |
|---|---|---|
| `C.bg` | `#f5f0e8` | Page background (Claude beige) |
| `C.bgPanel` | `#ede8df` | Panel/card backgrounds |
| `C.bgCard` | `#e8e2d8` | Nested card surfaces |
| `C.border` | `#d0c8bb` | All borders |
| `C.borderLight` | `#e0d9cf` | Light column separators inside tape |
| `C.coral` | `#e8865a` | Heads (H), active state, coral accent |
| `C.coralDim` | `#f2c4ab` | Soft coral for badge borders/tints |
| `C.coralBg` | `#fdf0e8` | Background tint on heads columns |
| `C.lime` | `#7ab830` | PLAY button, progress bar (normal state) |
| `C.limeDim` | `#b8d98a` | Lime gradient top |
| `C.limeBg` | `#f0f7e4` | Lime tint (reserved) |
| `C.text` | `#2c2416` | Primary dark warm text |
| `C.textMid` | `#7a6e60` | Secondary text |
| `C.textDim` | `#b0a898` | Tertiary/label text |
| `C.textFaint` | `#d0c8bb` | Placeholder and very dim text |
| `C.blue` | `#3a6bc0` | Exact counter row |
| `C.blueDim` | `#a0b8e0` | Reserved |

Error percentage colors (used for current/min/max error readouts):
- ≤ 10% → `#5a9a2e` (dark lime green, good)
- ≤ 35% → `#c47c1a` (amber, acceptable)
- > 35% → `#c0442a` (red, far off)

---

## 3. Typography

All UI text uses `fontFamily: "'Georgia', serif"` on the root, with `fontFamily: "monospace"` for all numeric readouts, labels, badges, and the tape content. No other fonts.

---

## 4. Math

```js
morrisEst(c)  = 2^c - 2
flipProb(c)   = 1 / 2^c
probLabel(c)  = "1/${2^c}"          // e.g. "1/4", "1/8"
probPct(c)    = percentage string, 0 decimal places if c ≤ 3, else 1 decimal
errPct(actual, estimate) = |estimate - actual| / actual × 100   (0 if actual === 0)
```

---

## 5. State Architecture

All mutable runtime state lives in **both React state and a `useRef` object called `sr`**. This is critical: the `setInterval` in play mode captures the ref, not stale closures.

```js
sr.current = {
  flips:       [],   // array of flip objects
  c:           1,    // current Morris counter value
  actual:      0,    // exact count
  errHistory:  [],   // array of error % values, one per flip this run
  runs:        [],   // array of completed run records
  maxN:        10,   // kept in sync with maxN state
}
```

Each **flip object** stored in `flips`:
```js
{ result: "H" | "T", cAtFlip: number }
```

Each completed **run record**:
```js
{ actual: number, c: number, estimate: number, error: number }
```

React state mirrors `sr.current` for rendering: `flips`, `c`, `actual`, `errHistory`, `runs`, plus `maxN`, `speed`, `playing`.

---

## 6. Core Step Function

The `step` function (called by ADD ONE and by the play interval) is a `useCallback` with no dependencies that reads and writes exclusively through `sr.current`:

```
1. newActual = sr.actual + 1
2. cAtFlip = sr.c
3. flipResult = Math.random() < flipProb(cAtFlip) ? "H" : "T"
4. newC = flipResult === "H" ? cAtFlip + 1 : cAtFlip
5. newFlip = { result, cAtFlip }
6. Append newFlip to sr.flips
7. Update sr.c = newC, sr.actual = newActual
8. Compute estimate = morrisEst(newC), error = errPct(newActual, estimate)
9. Append error to sr.errHistory
10. Sync all 4 changed values to React state: setFlips, setC, setActual, setErrHistory

If newActual >= sr.maxN:
  - Build run = { actual: newActual, c: newC, estimate, error }
  - newRuns = [...sr.runs, run]
  - Reset sr: flips=[], c=1, actual=0, errHistory=[]
  - sr.runs = newRuns
  - Sync React state: setFlips([]), setC(1), setActual(0), setErrHistory([]), setRuns(newRuns)
  - Persist: window.storage.set(STORAGE_KEY, JSON.stringify(newRuns))
```

The auto-reset fires inside step (with a `setTimeout(..., 80)` so state flushes before reset).

---

## 7. Play Mode

Play uses `setInterval`. The interval ref is `intervalRef.current`.

- `startPlay()`: sets `playing = true`, starts interval at `Math.round(1000 / speed)` ms
- `stopPlay()`: sets `playing = false`, clears interval
- `togglePlay()`: calls one or the other
- When `speed` changes while `playing === true`, the interval is cleared and restarted at the new period
- Speed range: 1–20 flips per second, controlled by a range slider labeled "SPEED"
- While playing, a coral `● recording` label appears to the right of the progress counter

---

## 8. RESET Button

```
1. stopPlay()
2. If sr.actual > 0:
   - record current run to sr.runs
   - persist to window.storage
3. Reset sr: flips=[], c=1, actual=0, errHistory=[]
4. Sync React state
```

---

## 9. Segment Algorithm

`toSegments(flips)` converts the flat flips array into segments:

```
segments = []
current = []
for each flip:
  push flip into current
  if flip.result === "H":
    push { flips: current, closed: true } into segments
    current = []
if current is non-empty:
  push { flips: current, closed: false } into segments
```

A **closed** segment ends with an H. An **open** (trailing) segment is still accumulating tails.

---

## 10. Layout Structure

```
┌─ Root (max-width 980px, centered, beige bg, 16px 14px padding) ──────────────┐
│                                                                                │
│  ┌─ Header (flex, space-between, wrap) ────────────────────────────────────┐  │
│  │  Title: "Morris Counter"  (Georgia, clamp 17–25px, bold)                │  │
│  │  Subtitle: "approximate counting · R. Morris, 1978" (monospace, 10px)   │  │
│  │  Controls row: [MAX slider] [SPEED slider] [+ADD ONE] [▶PLAY] [↺RESET] │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  ┌─ Main row (flex, gap 10) ───────────────────────────────────────────────┐  │
│  │  ┌─ Tape area (flex:1, min-width:0) ─────────────────────────────────┐  │  │
│  │  │  ┌─ Tape container (flex row, bgPanel, border, radius 10) ──────┐ │  │  │
│  │  │  │  Row labels column │ Scrolling tape                          │ │  │  │
│  │  │  └───────────────────────────────────────────────────────────────┘ │  │  │
│  │  │  Progress bar (4px, lime→coral at 85%)                             │  │  │
│  │  │  "{actual} / {maxN}  ● recording"                                  │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                           │  │
│  │  ┌─ Stats panel (width 170, bgPanel, border, radius 10) ─────────────┐  │  │
│  │  │  Actual count  (big, 22px)                                         │  │  │
│  │  │  ── divider ──                                                      │  │  │
│  │  │  Morris C                                                           │  │  │
│  │  │  Morris value  "2^C − 2"                                           │  │  │
│  │  │                "= {estimate}"                                       │  │  │
│  │  │  ── divider ──                                                      │  │  │
│  │  │  Current error  (color-coded)                                       │  │  │
│  │  │  Min error      (color-coded, "—" when empty)                       │  │  │
│  │  │  Max error      (color-coded, "—" when empty)                       │  │  │
│  │  │  ── divider ──                                                      │  │  │
│  │  │  "next flip:"  {probLabel(c)}  "= {probPct(c)}"                    │  │  │
│  │  └────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
│  Legend row (flex, gap 16, wrap)                                               │
│  ┌─ Histogram box (bgPanel, border, radius 10) ──────────────────────────┐    │
│  │  "FINAL ESTIMATE DISTRIBUTION — N runs"                                │    │
│  │  Stats tags: "{n} runs"  "μ = X.X"  "σ = X.X"  [clear]               │    │
│  │  Bar chart (lime gradient bars, height 90px area)                      │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Tape Component

The tape is a horizontally-scrolling area that auto-scrolls to the rightmost column on every new flip.

**Column width:** `COL = 38px` per flip column.

**Three rows inside the tape (top to bottom):**

### Row 1 — Morris row (height ~74px, border-bottom)
One cell per flip, 38px wide. Contains three stacked elements, vertically centered:

1. **Result letter** — `"H"` or `"T"`, 16px, weight 900, monospace
   - H: color `C.coral`, text-shadow `0 0 8px C.coralDim`
   - T: color `C.textFaint`

2. **Probability badge** — pill showing `probLabel(cAtFlip)` (e.g. `"1/4"`)
   - 9px monospace, weight 700, border-radius 3, padding `1px 4px`
   - H: color `C.coral`, background `C.coralDim + "55"`, border `C.coralDim`
   - T: color `C.textMid`, background `C.bgCard`, border `C.borderLight`

3. **Percentage line** — `probPct(cAtFlip)` (e.g. `"25%"`)
   - 8px monospace
   - H: `C.coral` | T: `C.textFaint`

**Column background:**
- H column: `C.coralBg` (coral tint)
- T column: `transparent`

**Column right border:** `1px solid C.borderLight`

### Row 2 — Exact counter row (height ~30px, border-bottom)
One cell per flip, 38px wide. Contains `+1` centered.
- 9px monospace, weight 700, color `C.blue`
- Right border: `1px solid C.borderLight`

### Row 3 — Segment label row (height ~22px)
One label spanning the full width of the segment (`seg.flips.length × COL` px).
- Closed segment: `"{n} flip(s)"`, color `C.textMid`
- Open segment: `"{n}…"`, color `C.textFaint`
- Text-align center, 9px monospace, padding `3px 0`

### Segment divider
After each closed segment, a 4px-wide vertical bar:
```
background: linear-gradient(to bottom, transparent, C.coral + "88", transparent)
```
This is the visual separator that shows where each "H" occurred.

**Empty state:** when `flips.length === 0`, show `"press ADD ONE or ▶ PLAY to start →"` in 13px monospace, `C.textFaint`, padding `28px 16px`.

---

## 12. Row Labels Column

Fixed-width column to the left of the scrollable tape, inside the same tape container, separated by a right border. Three sections matching the three tape rows:

| Section | Height | Content |
|---|---|---|
| Morris | 74px | "MORRIS" (9px, C.textMid, bold, uppercase, 1px letter-spacing) + "coin flip" (8px, C.textFaint) |
| Exact | 30px | "EXACT" (9px, C.blue, bold, uppercase) + "+1 always" (8px, C.textFaint) |
| Segment | 22px | "segment" (8px, C.textFaint) |

---

## 13. Stats Panel

Width: 170px, `align-self: flex-start` (doesn't stretch with tape).

Uses a `StatRow` component: `{ label, value, color, dim, big }`. Layout is `flex space-between baseline`. Label is 9px uppercase monospace with 1.1px letter-spacing. Value is 13px (or 22px if `big=true`) monospace weight 700/900.

Rows in order:
1. `"Actual count"` / `{actual}` / big=true, color=C.text
2. Divider
3. `"Morris C"` / `{c}` / color=C.coral
4. `"Morris value"` / `"2^{c} − 2"` / color=C.textMid
5. `""` / `"= {estimate}"` / color=C.coral
6. Divider
7. `"Current error"` / `"{pct}%"` or `"—"` / errColor(pct) or C.textFaint
8. `"Min error"` / dim when null
9. `"Max error"` / dim when null
10. Divider
11. Plain text block: `"next flip:\n{probLabel(c)} = {probPct(c)}"` — label in C.coral bold, percentage in C.textMid

---

## 14. Progress Bar

Sits below the tape container, margin-top 5px, height 4px, border-radius 2, overflow hidden.

- Background track: `C.bgCard`
- Fill: `progress > 0.85 ? C.coral : C.lime`, width `${progress * 100}%`, transition `width 0.1s linear`
- Below the bar: `"{actual} / {maxN}"` right-aligned, 9px, C.textFaint
- When playing: coral dot `● recording` appended with margin-left 8px

---

## 15. Controls

### Slider widgets
Both sliders share a container style: bgPanel background, border, borderRadius 8, padding `5px 10px`, flex row, gap 5.

**MAX slider:**
- Range: 5–30, step 1, default 10
- Label: "MAX" (9px uppercase monospace, C.textDim)
- Width: 70px, accent-color: C.coral
- Value display: current value + no unit

**SPEED slider:**
- Range: 1–20, step 1, default 4
- Label: "SPEED"
- Value display: `"{n}/s"`

### ADD ONE button
- Background: C.bgPanel, border 1.5px solid C.border, radius 8
- Color: C.text, 13px, weight 800, padding `9px 18px`
- Calls `step()` directly

### PLAY / PAUSE button
- No border, radius 8, 13px, weight 800, padding `9px 18px`, letter-spacing 0.3
- PLAY state: background C.lime, color white, label `"▶ PLAY"`
- PAUSE state: background C.coral, color white, label `"⏸ PAUSE"`

### RESET button
- Background transparent, border 1px solid C.border, radius 8
- Color: C.textMid, 12px, weight 700, padding `9px 14px`

---

## 16. Legend Row

Flex row, gap 16, flex-wrap, align-items center, margin-bottom 10.

Four entries with a 9×9px colored swatch (borderRadius 2) followed by 9px monospace C.textMid text:
1. Swatch C.coral — `"H — heads: C increments, segment closes"`
2. Swatch C.textFaint — `"T — tails: C unchanged"`
3. Swatch C.coral + "88" — `"│ — segment boundary"`
4. Swatch C.blue — `"exact counter row"`

Right side (margin-left auto): `"segments grow longer as C increases → more flips needed per increment"` in 9px C.textFaint monospace.

---

## 17. Histogram

Lives inside `S.histBox` (bgPanel, border, radius 10, padding `12px 14px`).

Title: `"FINAL ESTIMATE DISTRIBUTION — N run(s)"` in 9px uppercase monospace, C.textDim, 2px letter-spacing.

**Empty state:** `"completed runs will appear here after RESET or auto-reset at MAX"` centered, 11px, C.textFaint.

**When runs exist:**

Stats tags row (flex, gap 6, margin-bottom 10): three pill tags showing `"{n} runs"`, `"μ = X.X"`, `"σ = X.X"` plus a `[clear]` button. Pills: bgCard background, border, radius 4, padding `2px 8px`, 11px monospace, C.textMid. Clear button: no background, same border, 10px, C.textDim.

Bar chart area: height 90px, overflow-x auto, flex row aligned to bottom, gap 4.

Each bar:
- Width: `Math.max(20, Math.min(36, Math.floor(260 / keys.length)))` px
- Height: `Math.max(4, (count / maxCount) × 72)` px
- Background: `linear-gradient(to top, C.lime, C.limeDim)`
- Border-radius: `3px 3px 0 0`
- Transition: `height 0.3s ease`
- Count label above (9px, C.textMid)
- Estimate value below (8px, C.textMid)

Footer: `"x-axis = final Morris estimate per completed run"` in 10px C.textFaint monospace, margin-top 6.

---

## 18. Persistence

Storage key: `"morris-v6-runs"`.

On mount: `window.storage.get(STORAGE_KEY)` → parse JSON → `setRuns()` and `sr.current.runs = ...`.

On each auto-reset or manual reset (with actual > 0): `window.storage.set(STORAGE_KEY, JSON.stringify(newRuns))`.

On clear: `window.storage.delete(STORAGE_KEY)`.

All storage calls wrapped in try/catch (silent failure).

---

## 19. Global CSS (injected via `<style>` tag)

```css
* { box-sizing: border-box; }

::-webkit-scrollbar { height: 5px; background: C.bgCard; }
::-webkit-scrollbar-thumb { background: C.border; border-radius: 3px; }

button { cursor: pointer; font-family: monospace; }
button:active { opacity: 0.7 !important; }

input[type=range] { accent-color: C.coral; }
```

---

## 20. Initial State

On mount: `c = 1`, `actual = 0`, `flips = []`, `errHistory = []`. Morris estimate = `2^1 − 2 = 0`. The tape is empty and shows the placeholder text.

---

## 21. What Makes This Work Pedagogically

The key design decisions that should never be changed:

1. **No animation delays.** Each column appears complete and final the moment ADD ONE is pressed. The result, the probability, the badge — all visible immediately. Students read a column, then press again.

2. **The probability is stamped on every column.** Students can see `1/1` on early columns, then watch it become `1/2`, `1/4`, `1/8` — the denominator doubling explains visually why segments grow.

3. **Segments are the unit of understanding.** The coral divider bar + flip count label below (`"7 flips"`) is the key gestalt. After a classroom run, you can point to the tape and say: "Look at how many tails it took to get each heads as we went further right."

4. **The exact counter row never changes.** The monotone `+1 +1 +1` row visually anchors the contrast — Morris's row has huge empty stretches with one gold H, while the exact row just marches forward one step at a time.

5. **PLAY mode + histogram.** The instructor can run 10 trials in 30 seconds at speed 4/s, then pause and point to the histogram to discuss variance. Students see that the estimate is sometimes very close and sometimes off by 50%.
