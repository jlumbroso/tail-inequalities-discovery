# Tail Inequalities — What Can You Prove?

An interactive classroom visualization of four fundamental tail probability inequalities — Markov, Chebyshev, Chernoff–Hoeffding, and Talagrand — built in React. Designed for teaching probabilistic analysis in algorithms and theory courses (e.g., CIS 5020 at Penn).

---

## The Pedagogical Question

You flip N coins and sum the results: S = X₁ + X₂ + … + Xₙ.

**How likely is it that S ≥ t?**

The visualization starts there. It shows you the simulation truth first — 12,000 trials, a histogram, an empirical tail probability. Then it asks: what can you *prove*, and with what assumptions?

This is the Freire inversion: instead of presenting formulas and asking students to admire them, it poses a question that the formulas exist to answer. Each inequality is a tool that converts assumptions about the random variable into a guaranteed ceiling on the tail probability. More assumptions buy tighter ceilings. The gap between the ceiling and the truth is the **price of limited knowledge**.

---

## What the Visualization Shows

### The experiment controls

Two sliders set the scenario:
- **N (coins)**: range 10–200, step 10. Default 100.
- **δ (deviation)**: range 0.5σ to 4.5σ, step 0.25. Default 2.0σ.

A **↻ re-roll** button re-runs the simulation without changing the bounds — reinforcing that bounds are deterministic guarantees, not empirical estimates. The histogram changes; the bounds do not.

### The histogram

12,000 simulated runs, each summing N fair coin flips. Bars in the tail (S ≥ t) are colored coral; bars below threshold are dim. A dashed vertical line marks the threshold t.

### The question

A framed prompt: "How likely is S ≥ t?" This is posed *before* any bound is revealed.

### What you know (knowledge toggles)

Four checkboxes corresponding to the assumptions each inequality requires:

| Assumption | Powers |
|---|---|
| Mean | All bounds |
| Variance | Chebyshev |
| Independence | Chernoff |
| Lipschitz | Talagrand |

Unchecking an assumption immediately grays out any bound that requires it. The key interaction: uncheck Independence and watch Chernoff disappear while Chebyshev remains. This makes the assumption→bound connection visceral, without any lecture needed.

### Guarantees vs. Reality

The main panel. One truth row (the simulation), then one row per inequality:

```
Simulation (truth)    2.30%          276 / 12,000 trials

Markov  1889   ≤ 83.3%                              36.2× loose
████████████████████████████████████│

Chebyshev  1867   ≤ 25.0%                           10.9× loose
██████████████│

Chernoff  1952   ≤ 1.8%                              0.8× loose
█│

Talagrand  1995   ≤ 7.3%                             3.2× loose
████│
                                    ↑ actual
0%        25%        50%        75%        100%
```

Each bar is the bound's guarantee. The thin vertical line is the simulation truth. The gap between them is the looseness — visible, proportional, immediate.

A "▸ why this value?" expander reveals the formula with the student's current N and threshold substituted in, the required assumptions, and a dynamic insight sentence that adapts to how loose the bound is at the current settings.

### The insight box

A static framing paragraph explaining the tradeoff: stronger assumptions earn tighter bounds. Directs students to use the knowledge toggles.

---

## The Four Inequalities

### Markov (1889)
```
P(S ≥ t) ≤ E[S] / t
```
Requires only a known mean and S ≥ 0. Gives O(1/t) decay — polynomial in the threshold. At default settings (~36× loose), its looseness is immediately obvious.

### Chebyshev (1867)
```
P(|S − μ| ≥ δ) ≤ σ² / δ²
```
Requires mean and variance. Gives O(1/δ²) decay — quadratic in the deviation. Works without independence — the key pedagogical point when comparing to Chernoff.

### Chernoff–Hoeffding (1952/1963)
```
P(S − μ ≥ δ) ≤ exp(−2δ² / N)
```
Requires independence (Hoeffding's form for bounded [0,1] summands). Gives exponential decay. Often tighter than all others for sums of independent bounded variables — but unavailable without independence.

### Talagrand (1995)
```
P(f − E[f] ≥ δ) ≤ 4·exp(−δ² / N)
```
Requires a product space and a 1-Lipschitz function. For simple sums, it is intentionally looser than Chernoff (factor-of-4 constant, half the exponent coefficient). This is a feature: Talagrand's power is that it works for *any* well-behaved function of many variables — the diameter of a random graph, the length of a longest increasing subsequence — not just sums.

---

## Getting Started

```bash
npm install
npm run dev
```

Or build for deployment:

```bash
npm run build
```

The build output lands in `dist/` with the base path `/tail-inequalities-visualization/`, matching the GitHub Pages deployment of this repository.

---

## Repository Structure

```
src/
  main.jsx                           Entry point (React root)
  TailInequalitiesVisualization.jsx  The visualization component (v4)
docs/
  tail-inequalities-v4-spec.md       Full specification: palette, math, layout, pedagogy
index.html                           HTML shell
vite.config.js                       Vite + React plugin, base path
package.json
```

---

## Classroom Use

**Recommended sequence:**

1. Load with defaults (N=100, δ=2σ). Point to the histogram and ask: "What fraction of runs ended up in the tail?" Let students guess before reading the number.
2. Ask: "Can you *prove* that fraction is small? What would you need to know about the distribution?"
3. Reveal the bounds panel. Walk through Markov first — only the mean. Why is it so loose?
4. Enable Chebyshev. What extra assumption did we buy? What did it cost?
5. Enable Chernoff. Same question. Contrast with Chebyshev: they are not ranked, they are tools for *different situations*.
6. Hit ↻ re-roll several times. Watch the truth marker move; watch the bounds stay fixed. Ask: "What's the difference between a bound and an estimate?"
7. Uncheck Independence. Chernoff disappears. "When would you actually be in this situation?"
8. Adjust δ. At small deviations, Chernoff may actually *exceed* the simulation truth (ratio < 1×). Discuss: what does it mean for a bound to be tight?

**Key questions:**
- Which bound requires the fewest assumptions? What does it cost?
- When would you reach for Chebyshev over Chernoff?
- Why is Talagrand looser than Chernoff for sums, and why do we still care about it?

---

## Design Notes

The four previous versions (v1–v3) each found a different way to fail:

| Version | Problem |
|---|---|
| v1 | All four bounds shaded the same histogram region — visually indistinguishable |
| v2 | Bar chart of bound values, disconnected from the distribution — numerically correct, semantically opaque |
| v3 | Log-scale tail plot — mathematically correct, but showed the answer before posing the question; no epistemic structure |

v4's key innovations:
- **Simulation first** — the question is posed before any bound is revealed
- **Knowledge toggles** — assumptions are first-class objects the student controls
- **Horizontal bars with truth marker** — the gap between bound and truth is visible as area, not just a number
- **Re-roll** — teaches the bound/estimate distinction without words

See [docs/tail-inequalities-v4-spec.md](docs/tail-inequalities-v4-spec.md) for the complete technical specification.

---

## Credits

Visualization design and implementation (v4): **Claude Opus 4.6** (Anthropic).

Deployment, repository configuration, and logistics: **Claude Sonnet 4.6** (Anthropic).

Pedagogical framing and course context: CIS 5020, University of Pennsylvania.

---

## License

MIT. Use freely in courses and adapt for your own probability visualizations.
