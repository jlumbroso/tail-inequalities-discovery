# Tail Inequalities Progressive Activity — Complete Specification

**Artifact:** `tail_inequalities_v7.jsx`
**Title:** "What Can You Prove With Less?"
**Context:** CIS 3200 / algorithms course, used after Bloom filters and Morris approximate counters
**Leitmotiv:** "What do I know about my random variable?"


## 1. Educational Purpose

This is a **problem-posing activity** (Freire) for teaching four tail inequalities — Markov, Chebyshev, Chernoff–Hoeffding, and (in future work) Talagrand. It is designed to be used alongside, not instead of, a companion **sandbox visualization** (v4) that lets students freely explore the bounds.

The activity inverts the traditional pedagogy. Instead of presenting formulas and then illustrating them on examples (banking model), it:

1. Poses a question (bound a tail probability)
2. Progressively reveals information, one fact at a time
3. Shows which bound each fact unlocks
4. Asks students to identify assumptions in novel scenarios
5. Bridges from abstract formulas to concrete substitutions

The core pedagogical innovation is that **assumptions are the interface**. Students don't choose bounds from a menu — they identify what properties their random variable has, and the bounds that are available follow mechanically. The question is never "which bound is best?" but **"What do I know about my random variable?"**


## 2. Relationship to the Visualization Suite

| Artifact | Role | Metaphor |
|----------|------|----------|
| **v4** (sandbox) | Free exploration. Move sliders, toggle assumptions, see bounds change. Build intuition. | The playground |
| **v7** (this spec) | Guided activity. Progressive revelation, then challenge scenarios. Practice applying intuition. | The guided hike |
| **v_future** (Talagrand zoorium) | Separate activity showing scenarios only Talagrand can handle. Not a hierarchy — breadth of application is the strength. | The exotic wing |

Suggested lecture flow: v7 Part 1 on the projector (3 minutes of "reveal" drama) → v4 handed to students for free exploration → v7 Part 2 as a self-check exercise.


## 3. Color Palette

Uses the **Claude Code Extended** palette throughout. Colors are semantically coded for the three bounds:

| Token | Hex | Role |
|-------|-----|------|
| `bg` | `#f5f0e8` | Page background (warm beige) |
| `bgPanel` | `#ede8df` | Panel backgrounds (Part 1, Part 2 containers) |
| `bgCard` | `#e8e2d8` | Card backgrounds, formula boxes, collapsible interiors |
| `border` | `#d0c8bb` | Panel borders |
| `borderLight` | `#e0d9cf` | Card borders, dividers |
| `coral` | `#e8865a` | **Markov** — weakest bound, warm/caution tone |
| `coralDim` | `#f2c4ab` | Coral at reduced intensity |
| `coralBg` | `#fdf0e8` | Setup boxes, question boxes |
| `lime` | `#7ab830` | **Chernoff–Hoeffding** — strongest bound, success tone |
| `limeBg` | `#f0f7e4` | Revealed-info boxes, summary boxes |
| `blue` | `#3a6bc0` | **Chebyshev** — middle bound, informational tone |
| `blueBg` | `#eef2fa` | Blue background variant |
| `text` | `#2c2416` | Primary text |
| `textMid` | `#7a6e60` | Secondary text (narratives, explanations) |
| `textDim` | `#b0a898` | Tertiary text (details, captions) |
| `textFaint` | `#d0c8bb` | Version label |
| `good` | `#5a9a2e` | Correct answer feedback |
| `ok` | `#c47c1a` | Partial answer feedback |
| `bad` | `#c0442a` | Incorrect answer feedback, Pareto sketch color |

### Semantic color coding for bounds

This is deliberate, not accidental. The three bound colors map to an intuitive traffic-light metaphor:

- **Coral (red-adjacent):** Markov. The weakest, loosest bound. "Caution — this is often terrible."
- **Blue (neutral/informational):** Chebyshev. The middle ground. "You know more, but not everything."
- **Lime (green):** Chernoff. The strongest. "Full information, exponential concentration."

This coding is consistent across: bound bars, tags, stage headers, formula bridges, challenge feedback, and the ladder summary.


## 4. Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| Prose | `'Georgia', serif` | 0.82–0.88rem | 400 |
| Headings | `'Georgia', serif` | 0.9–1.5rem | 700 |
| Monospace labels | `monospace` | 0.65–0.82rem | 600 |
| Tags | `monospace` | 0.7rem | 600 |
| Section labels | `monospace` | 0.68–0.72rem | 700, uppercase, letter-spacing 0.06–0.08em |
| KaTeX formulas | KaTeX default (Computer Modern) | display: ~1rem, inline: inherit | varies |

### Tags vs. KaTeX: The Boundary Rule

**Tags** (monospace, plain text): Used for knowledge labels, bound availability indicators, and any inline annotation. These are designed to be **glanceable** — scanned in a fraction of a second. Examples: `S ≥ 0`, `𝔼[S] = 50`, `Var(S) = 25`, `Xᵢ independent`.

**KaTeX** (display math): Used only for **formulas that need proper mathematical typesetting** — fractions, exponents, display-mode equations. Examples: the Markov/Chebyshev/Chernoff formulas in stage cards, the setup question P(S ≥ 60), challenge questions, and formula bridges.

The principle: if the reader needs to *parse structure* (fractions, nested exponents), use KaTeX. If the reader needs to *scan identity* (what assumptions hold), use monospace tags. Never cross these boundaries.


## 5. Mathematical Notation — The Consistency Contract

### The problem this solves

Traditional probability pedagogy freely swaps between functional notation (E[X], Var(X)) and parametric notation (μ, σ², δ). For students comfortable with both, this is shorthand. For students still building fluency, it introduces **discriminatory cognitive load** — they must simultaneously learn the concept and decode which symbol means what in which context. This fragments understanding and gates learning on symbol fluency rather than conceptual insight.

### The rules

The following notation is used **everywhere** in this visualization — in prose, in tags, in detail strings, in number debriefs, and in formula bridges. The only exception is inside KaTeX formulas where the LaTeX commands differ syntactically but render to the same glyphs.

| Concept | Notation | Never use |
|---------|----------|-----------|
| Expected value | `𝔼[·]` (blackboard bold E) | E[·], μ, mu |
| Variance | `Var(·)` | σ², sigma squared |
| Standard deviation | `√Var(·)` | σ, sigma, std dev |
| Threshold (absolute) | `t` | T (except as a random variable name) |
| Deviation from mean | `d` = t − 𝔼[·] | δ, delta |
| Number of summands | `N` | n (reserved for other counts) |
| Probability | `P(·)` | Pr(·), ℙ(·) |
| Random variable | Single capital letter, consistent within a scenario | Switching letters mid-scenario |

### Why two threshold-like letters: t vs. d

These are genuinely different concepts, not notational variants:

- **t** = the absolute threshold. "P(S ≥ t)" — where on the number line are we asking about? Markov uses t directly, because Markov reasons about absolute position.
- **d** = the deviation from the mean. d = t − 𝔼[S]. How far from the expected value? Chebyshev and Chernoff use d, because they reason about distance from center.

The relationship is: **d = t − 𝔼[S]**. In the progressive revelation setup: t = 60, 𝔼[S] = 50, so d = 10.

### Notation in KaTeX formulas

| Concept | LaTeX command | Renders as |
|---------|--------------|------------|
| Expected value | `\mathbb{E}[S]` | 𝔼[S] |
| Variance | `\text{Var}(S)` | Var(S) |
| Threshold | `t` | t |
| Deviation | `d` | d |


## 6. KaTeX Integration

### Loading

KaTeX is loaded dynamically from CDN (`cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/`). A `useKatex()` hook manages the loading state. Both CSS and JS are injected into `<head>`.

### Fallback

If KaTeX hasn't loaded yet, the `<Tex>` component renders the raw LaTeX string inside a `<code>` element with monospace font. This ensures the activity is usable even if CDN loading is slow.

### The `<Tex>` component

```jsx
<Tex display>{"P(S \\geq t) \\leq \\frac{\\mathbb{E}[S]}{t}"}</Tex>
```

Props:
- `children`: LaTeX string
- `display` (boolean, default false): display mode (centered, larger) vs. inline

Uses `katex.renderToString` with `throwOnError: false` and `trust: true`.


## 7. State Architecture

```
currentStage: number (0–3)
  0 = intro (no stages revealed)
  1 = Stage 1 revealed (Markov)
  2 = Stages 1–2 revealed (+ Chebyshev)
  3 = All stages revealed (+ Chernoff)

challengeState: {
  [challengeId]: {
    checks: { nonneg: bool, mean: bool, variance: bool, independent: bool, bounded: bool }
    submitted: bool
  }
}
```

Gating rules:
- Stage N cannot be revealed until Stage N−1 is revealed (linear progression)
- Part 2 is grayed out (opacity 0.35, pointer-events: none) until all 3 stages are revealed
- Challenge submission is one-shot (cannot uncheck after submitting)


## 8. Part 1 — The Knowledge Ladder

### Structure

1. **Setup box** (coral background): States the question P(S ≥ 60) ≤ ??? in KaTeX display mode
2. **Ladder summary** (rendered before AND after stage cards when ≥2 stages visible): Shows the best bound from each revealed stage as a BoundBar. After all 3 stages, shows the truth line at 2.3%.
3. **Stage cards** (3 cards): Each progresses through states: future → current → revealed

### Stage card anatomy (when revealed)

1. **Header row:** ✓ badge (lime), title, "unlocks [BoundName]" right-aligned
2. **Revealed box** (lime background): One sentence of new information
3. **Knowledge tags** (monospace, lime): Cumulative list of what's known
4. **Narrative** (prose, textMid): 2–3 sentences explaining what this knowledge means
5. **Formula** (KaTeX display, bgCard background): The inequality unlocked by this stage
6. **Explanation** (left-bordered in bound color): Why this bound matters
7. **Collapsible: Example distributions** (MiniDist sketches): Shows 1–3 distribution shapes that satisfy the known constraints, demonstrating what the bound can't distinguish

### The three stages

| Stage | Reveals | Unlocks | Bound value | Key insight |
|-------|---------|---------|-------------|-------------|
| 1 | 𝔼[S] = 50 | Markov (1889) | ≤ 83.3% | Can't distinguish tight vs. spread distributions |
| 2 | Var(S) = 25 | Chebyshev (1867) | ≤ 25% | Eliminates widely-spread shapes |
| 3 | S = sum of 100 independent bounded flips | Chernoff (1952) | ≤ 13.5% | Exponential concentration from independence |

Truth: P(S ≥ 60) ≈ 2.3% (exact binomial for Binomial(100, 1/2))

### Ladder positioning

The ladder is rendered twice: once before the stage cards, and once after (when ≥2 stages are visible). This solves the scroll-visibility problem: on small screens, the stage cards expand to push the top ladder off-screen, so the bottom ladder ensures the student always sees the shrinking bound.


## 9. MiniDist Component — Glanceable Distribution Sketches

### Purpose

Each progressive revelation stage includes collapsible "What could S look like?" sections showing 1–3 tiny distribution curves. The pedagogical point: **each new fact eliminates possible distributions**. Stage 1 shows 3 wildly different shapes (all have the same mean). Stage 2 narrows to 2 (same mean AND variance). Stage 3 collapses to essentially 1.

### Design

- Pure SVG, 120×44px default (140px for challenge sketches)
- No axes, no labels on the chart itself — labels are below
- Curve: 2px stroke, 60-point polyline
- Optional tail shading: coral at 30% opacity, from threshold to right edge
- Optional threshold marker: dashed coral vertical line
- Deliberately **not interactive** — these are glanceable icons, not explorable charts

### Point generators

All distributions are normalized to x ∈ [0, 1] for uniform coordinate mapping:

- `normalPoints(mu, sigma, n=60)`: Gaussian bell curve
- `uniformPoints(a, b)`: Rectangular distribution between a and b
- `bimodalPoints(mu1, mu2, sigma, n=60)`: Mixture of two Gaussians
- `paretoPoints(alpha, n=60)`: Heavy-tailed power law, only used in server challenge
- Inline lambda for skewed distribution (Stage 2)

### Why MiniDist works

The design principle is "glanceability over precision." At 120×44px, a human can distinguish "tight bell" from "wide rectangle" from "two peaks" in under a second. This is exactly the perceptual resolution needed — the student doesn't need to read off probability values, they need to see that wildly different shapes can share the same mean. The coral tail shading makes the tail region immediately visible without requiring any axis labels.


## 10. Part 2 — Challenge Scenarios

### Structure

Part 2 is gated behind completion of Part 1. It contains 3 scenario cards, each with:

1. **Icon + title**
2. **Scenario description** (prose)
3. **Question** (KaTeX display, coral background)
4. **Assumption checklist** (5 checkboxes with labels)
5. **Live bound availability** (tags that light up as assumptions are checked)
6. **Submit button** → feedback panel

### The five assumptions

| ID | Label | Required for |
|----|-------|-------------|
| `nonneg` | Non-negative | Markov |
| `mean` | Mean is known | Markov, Chebyshev, Chernoff |
| `variance` | Variance is known | Chebyshev |
| `independent` | Sum of independent parts | Chernoff |
| `bounded` | Each part bounded in [a, b] | Chernoff |

Bound availability logic:
- Markov: nonneg AND mean
- Chebyshev: mean AND variance
- Chernoff: mean AND independent AND bounded

### The three challenges

| Challenge | Best bound | Why this scenario |
|-----------|-----------|-------------------|
| **Server timeout** ⏱ | Markov (20%) | Only mean known. Introduces heavy-tailed distributions as vocabulary. |
| **Morris counter** 🔢 | Chebyshev (22.2%) | Mean + variance, but NO independence. Directly connects to course content. Explains average-of-k trick. |
| **Bloom filter** 🔵 | Chernoff (2.1 × 10⁻¹⁷) | All assumptions met. Connects to course content. Shows exponential concentration in action. |

### Feedback panel (after submission)

Each challenge feedback panel contains:

1. **Score**: "✓ Perfect!" or "N/5 correct" with correct/incorrect highlighting on each checkbox
2. **Formula Bridge** (see Section 11)
3. **BoundBar** showing the bound value
4. **Feedback prose**: Explains why this bound is the strongest available
5. **"Why not others"**: Italic text explaining which assumptions fail for stronger bounds
6. **Collapsible: Distribution sketches** (server only): Normal vs. Pareto comparison, introducing "heavy-tailed" vocabulary
7. **Collapsible: "Where do these numbers come from?"**: Explains how to translate from the practical scenario to the formula's parameters


## 11. Formula Bridge Component

### Purpose

This is the **syntax-to-application bridge** — the step that traditional lectures skip and students can't do on their own. It shows explicitly how to go from the abstract formula to the concrete calculation.

### Structure

```
┌──────────────────────────────────────────┐
│    P(X ≥ t) ≤ 𝔼[X] / t                 │  ← abstract formula (KaTeX display)
│──────────────────────────────────────────│
│  substitute: 𝔼[X] = 200 ms, t = 1000 ms │  ← variable mapping (KaTeX inline)
│──────────────────────────────────────────│
│    P(T ≥ 1000) ≤ 200 / 1000             │  ← substitution (KaTeX display)
│                = 20%                      │  ← result (monospace, bound color)
└──────────────────────────────────────────┘
```

### Props

- `formula`: LaTeX string for the abstract formula
- `mapping`: Array of LaTeX strings for variable assignments
- `substitution`: LaTeX string with numbers plugged in
- `result`: Plain text result string
- `color`: Color for the result (matches bound color)

### Design choices

- Background: bgCard with borderLight border
- The "substitute:" label is in coral (attention-drawing)
- Mapping entries are separated by commas in textDim
- The three layers (abstract → mapping → concrete) are visually separated by a bottom border on the mapping row
- Result is oversized (1rem monospace, bold, colored) to draw the eye


## 12. BoundBar Component

### Purpose

Horizontal bar showing a bound value relative to 0–100%, with an optional truth marker.

### Anatomy

```
Stage 1: Markov  1889    ≤ 83.3%          36.5×
[████████████████████████████████████|───────]
                                     ↑ truth line (2px, dark)
```

- **Label** (left): bound name in bound color + year in textDim
- **Value** (center): "≤ XX.X%" in monospace bold
- **Ratio** (right, auto-margin): looseness ratio (bound/truth), color-coded:
  - `>100×` → bad (red)
  - `>10×` → ok (amber)
  - `<10×` → good (green)
- **Bar**: 20px height, bgCard background with borderLight border
  - Fill: bound color at 30% opacity, with 3px solid left border
  - Truth marker: 2px dark vertical line at truthPct%
- **Detail** (below): monospace formula string in textDim

### Scientific notation

When value < 0.001 (e.g., Bloom filter's 2.1 × 10⁻¹⁷), the display switches to scientific notation using `value.toExponential(1)`. The bar still renders a minimum-width fill of 0.3% to remain visible.


## 13. Tag Component

Small inline labels for displaying assumptions, knowledge items, and available bounds.

- Monospace, 0.7rem, font-weight 600
- Padding: 2px 8px, border-radius 4
- Active state: bound color text, color at 18% opacity background, 1px solid color border
- Inactive state: textDim text, bgCard background, borderLight border
- Margin: 4px right, 2px bottom (allows inline wrapping)


## 14. Collapsible Component

Expandable/collapsible sections used for: example distributions, distribution sketches in challenges, and number debriefs.

- Toggle: "▸" / "▾" prefix, underlined link-style button in textMid
- Content: bgCard background, borderLight border, 6px border-radius
- Default state: collapsed (defaultOpen=false)
- Used to reduce cognitive overload — the main path doesn't require opening any collapsible


## 15. Number Debriefs

Each challenge includes a collapsible "Where do these numbers come from?" section. These are **NOT** optional flavor text — they are the translation layer that helps students understand how to map practical questions to formula parameters.

| Challenge | Key translation |
|-----------|----------------|
| Server | t = 1000 ms is a 1-second timeout. Threshold = 5× the mean. |
| Morris | d = 1500 = 150% relative error ≈ 2.1 standard deviations. Explains average-of-k trick. |
| Bloom | d = 196 ≈ 10 standard deviations. 55% saturation = false positive degradation. |

### What makes a good number debrief

1. State the practical meaning of the threshold ("1 second timeout", "150% relative error", "55% saturation")
2. Show the formula parameter mapping (d = 1100 − 904 = 196)
3. Express in standard deviations when applicable (d ≈ 10√Var)
4. Connect to course content when applicable ("this is why the average-of-k trick exists")


## 16. Layout Structure

```
┌─ Header ──────────────────────────────────────┐
│ h1: "What Can You Prove With Less?"           │
│ Subtitle with leitmotiv in lime bold          │
└───────────────────────────────────────────────┘

┌─ Part 1 Panel (bgPanel, rounded, bordered) ───┐
│ PART 1 — THE KNOWLEDGE LADDER (section label) │
│                                                │
│ ┌─ Setup (coralBg) ─────────────────────────┐ │
│ │ P(S ≥ 60) ≤ ??? (KaTeX)                   │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌─ Ladder summary (bgCard) ─────────────────┐ │
│ │ BoundBar × N revealed stages               │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌─ Stage 1 card ────────────────────────────┐ │
│ │ [revealed / current / future]              │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ Stage 2 card ────────────────────────────┐ │
│ └────────────────────────────────────────────┘ │
│ ┌─ Stage 3 card ────────────────────────────┐ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌─ Ladder summary (repeated) ───────────────┐ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌─ "The ladder" summary (limeBg) ───────────┐ │
│ │ 83.3% → 25% → 13.5% → truth 2.3%         │ │
│ └────────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘

┌─ Part 2 Panel (gated on Part 1 complete) ─────┐
│ PART 2 — WHICH TOOL FITS? (section label)     │
│                                                │
│ ┌─ Challenge: Server ⏱ ─────────────────────┐ │
│ │ scenario → question → checklist → submit   │ │
│ └────────────────────────────────────────────┘ │
│ ┌─ Challenge: Morris 🔢 ────────────────────┐ │
│ └────────────────────────────────────────────┘ │
│ ┌─ Challenge: Bloom 🔵 ─────────────────────┐ │
│ └────────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘

┌─ Meta-lesson (limeBg) ────────────────────────┐
│ "These inequalities aren't a hierarchy..."    │
└───────────────────────────────────────────────┘

v7 — version label (textFaint, centered, mono)
```

Max width: 780px, centered. Padding: 1.75rem top/bottom, 1.5rem sides.


## 17. What Makes This Work Pedagogically

### 1. Question before answer (epistemic inversion)

The setup poses P(S ≥ 60) ≤ ??? before any formula appears. Students sit with the question. Each stage adds one fact and one tool. This reverses the traditional "here are four formulas, now apply them" approach.

### 2. Assumptions are the interface

The single most important innovation. Students don't choose bounds — they identify properties. The mapping from properties to bounds is mechanical. This teaches the real skill: "When I encounter a random variable in an algorithm proof, what do I check first?"

### 3. Progressive elimination of uncertainty

The collapsible example distributions make visible what each assumption *rules out*. Stage 1: three wildly different shapes. Stage 2: two shapes. Stage 3: essentially one. The shrinking set of possible distributions is the visual proof that more knowledge = tighter bounds.

### 4. The formula bridge defeats formula memorization

Students who memorize P(X ≥ t) ≤ 𝔼[X]/t can't apply it to "a server with 200 ms average response time." The bridge shows: here's the formula → here's what each variable means in your problem → here's the substitution → here's the answer. This is the translation step that lectures skip.

### 5. Course-content scenarios make it real

The Morris counter and Bloom filter challenges connect directly to algorithms already covered. Students see tail inequalities as tools they will actually use, not abstract mathematics. The Morris challenge naturally motivates the average-of-k trick. The Bloom challenge shows why independence matters.

### 6. Semantic color coding reduces cognitive load

Coral = weak, blue = middle, lime = strong is absorbed unconsciously. Students don't need to remember which bound is which — the colors carry the valence.

### 7. Collapsibles respect cognitive bandwidth

The main path (reveal stages, answer challenges, read feedback) requires opening zero collapsibles. Example distributions, number debriefs, and distribution sketches are available for students who want to go deeper, but don't block the primary flow.

### 8. Talagrand's deliberate absence

Talagrand is excluded from this activity not because it's too advanced, but because its strength (handling arbitrary Lipschitz functions, not just sums) requires scenarios that don't fit the assumptions-checklist structure. A separate "Talagrand Zoorium" activity — showing scenarios only Talagrand can see through — is the appropriate venue. Including Talagrand here would suggest it's "the best" when the whole point is that tools have different domains.


## 18. Version History

### v1 — Bell curve with tabs (FAILED)

Four tabs (Markov, Chebyshev, Chernoff, Talagrand) over a bell curve, each shading the same tail region differently. **Failure:** All four tabs looked visually identical — same purple shaded region. The bounds didn't *feel* different.

### v2 — Multiple distributions + comparison bars

Added distribution selector (normal, exponential, uniform, bimodal) and side-by-side bar comparison showing all bounds vs. actual tail. **Problem:** showed the answer (distribution type) alongside the bounds simultaneously — no epistemic structure.

### v3 — Log-scale tail probability plot

Plotted P(X ≥ kσ) as a function of k on log scale. Bounds appeared as ceiling lines above actual distribution curves. Vertical gap = looseness. Introduced Claude Code Extended palette. **Problem:** Still showed answer before posing question. No problem-posing structure.

### v4 — Simulation-first sandbox (BREAKTHROUGH)

12,000 coin flip trials, empirical histogram, knowledge toggles as checkboxes. The "assumptions as interface" innovation. Re-roll button demonstrates bounds are guarantees not estimates. "Why this value?" expanders show formula with numbers. **This became the companion sandbox visualization.**

### v5 — Progressive revelation + challenges (first draft)

Two-part structure: Part 1 progressive revelation (3 stages), Part 2 challenge scenarios. Assumption checklists with live bound availability. Gating of Part 2. **Problems:** No example distributions, notation inconsistency, no formula bridges, no number debriefs, Bloom filter independence not explained.

### v6 — Added MiniDist + debriefs

Collapsible example distributions at each stage (MiniDist SVG component). Number debrief collapsibles on challenges. Fixed Morris notation. Bloom filter bounded-in-{0,1} made explicit. Server timeout Pareto sketch. **Problems:** No KaTeX, no formula bridges, notation still mixed σ/Var/δ/d.

### v7 — KaTeX + formula bridges + notation normalization (CURRENT)

KaTeX for all display formulas. FormulaBridge component showing abstract → substitute → compute → result. Consistent notation contract (𝔼, Var, d, t). Tags remain monospace (not KaTeX). Scientific notation for tiny bounds. Capitalized leitmotiv. Ladder shown before AND after stages. Bloom independence explanation strengthened.


## 19. Future Work

### Talagrand Zoorium (separate activity)

A dedicated activity presenting scenarios where the random quantity is a function of many independent variables but NOT a simple sum. Talagrand's concentration inequality handles these cases — Chernoff cannot. Candidate scenarios: longest increasing subsequence, chromatic number of random graphs, traveling salesman on random points. The key lesson: Talagrand isn't "better than Chernoff" — it handles a *different class* of problems.

### Timed challenge mode (v_future)

A time-pressured game where students race to identify the strongest applicable bound for a rapid sequence of scenarios. Builds automaticity after the conceptual foundation from v7.

### Additional challenge scenarios

Potential additions drawn from course content:
- Sampling without replacement (no independence → Chebyshev)
- Hash table load balancing (independent → Chernoff)
- Randomized quicksort partition quality
- Random graph edge counts
