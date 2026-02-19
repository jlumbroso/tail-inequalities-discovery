# Tail Inequalities — What Can You Prove With Less?

A guided discovery activity for teaching Markov, Chebyshev, and Chernoff–Hoeffding tail inequalities. Built in React for CIS 3200 / CIS 5020 at Penn.

---

## The Pedagogical Idea

The activity inverts the usual lecture. Instead of presenting formulas and illustrating them, it:

1. Poses a question: **P(S ≥ 60) ≤ ???**
2. Reveals one fact about S at a time
3. Shows which inequality each fact unlocks
4. Asks students to identify assumptions in novel scenarios
5. Bridges from abstract formulas to concrete substitutions

The central question is never "which bound is best?" — it is always:
**What do I know about my random variable?**

---

## The Two Parts

### Part 1 — The Knowledge Ladder

Three staged revelations, each unlocking a tighter bound:

| Stage | New fact revealed | Bound unlocked | Guarantee |
|-------|------------------|----------------|-----------|
| 1 | 𝔼[S] = 50 | Markov (1889) | ≤ 83.3% |
| 2 | Var(S) = 25 | Chebyshev (1867) | ≤ 25% |
| 3 | S = sum of 100 independent coin flips ∈ {0,1} | Chernoff–Hoeffding (1952) | ≤ 13.5% |

The truth is ≈ 2.3% (exact binomial). Each additional fact narrows the gap. Collapsible "What could S look like?" sections show how each new assumption eliminates possible distributions — the shrinking set of viable shapes is the visual proof that more knowledge earns tighter bounds.

### Part 2 — Which Tool Fits?

Three challenge scenarios drawn from the course. Students check which assumptions hold, watch the available bounds light up, then submit:

| Scenario | Best bound | Key point |
|----------|-----------|-----------|
| ⏱ Server timeout (200 ms avg, bound P(T ≥ 1000 ms)) | Markov (20%) | Only mean known. Introduces heavy-tailed distributions. |
| 🔢 Morris counter (𝔼[Est] = 1000, Var = 500,000) | Chebyshev (22.2%) | No independence — each increment depends on counter state. Explains average-of-k trick. |
| 🔵 Bloom filter bit saturation (B ≥ 1100 of 2000 bits) | Chernoff (2.1 × 10⁻¹⁷) | All assumptions hold. Exponential concentration in action. |

Feedback shows the formula bridge (abstract → substitution → result), the bound value, and an explanation of why stronger bounds can't be applied.

---

## Relationship to the Visualization Suite

This activity is designed as a companion to a sandbox visualization (v4) that lets students freely explore all four bounds interactively.

| Artifact | Role |
|----------|------|
| **v4 sandbox** | Free exploration: sliders, toggles, re-roll. Build intuition. |
| **v7 (this)** | Guided activity: progressive revelation, then challenge scenarios. Apply intuition. |

Suggested lecture flow: run Part 1 on the projector for the "reveal" drama, then hand v4 to students for free exploration, then assign Part 2 as a self-check exercise.

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

The build output lands in `dist/` with the base path `/tail-inequalities-discovery/`, matching the GitHub Pages deployment of this repository.

---

## Repository Structure

```
tail_inequalities_v7.jsx      The activity component (v7)
src/
  main.jsx                    Entry point (React root)
docs/
  tail-inequalities-activity-spec.md  Full specification
index.html                    HTML shell
vite.config.js                Vite + React plugin, base path
package.json
```

---

## Design Notes

### Why assumptions are the interface

Students don't choose bounds from a menu — they identify what properties their random variable has, and the available bounds follow mechanically. This teaches the real skill: "When I encounter a random variable in an algorithm proof, what do I check first?"

### Color coding

Bound colors are traffic-light coded and consistent throughout:
- **Coral** → Markov (weakest, "caution")
- **Blue** → Chebyshev (middle ground)
- **Lime** → Chernoff (strongest, "full information")

### Formula bridges

The step that lectures routinely skip. Each challenge shows explicitly how to go from abstract formula to concrete computation:

```
P(X ≥ t) ≤ 𝔼[X] / t
  substitute: 𝔼[X] = 200 ms, t = 1000 ms
P(T ≥ 1000) ≤ 200 / 1000
           = 20%
```

### Version history

| Version | What it tried | Why it failed / what it became |
|---------|--------------|-------------------------------|
| v1 | Tabs over a bell curve | All four tabs looked visually identical |
| v2 | Multiple distributions + bar comparison | Showed the answer before posing the question |
| v3 | Log-scale tail probability plot | No problem-posing structure |
| v4 | Simulation-first sandbox | Breakthrough — became the companion sandbox |
| v5 | Progressive revelation + challenges | No example distributions, no formula bridges |
| v6 | Added MiniDist + number debriefs | No KaTeX, notation inconsistency |
| v7 | KaTeX, formula bridges, notation contract | **This activity** |

See [docs/tail-inequalities-activity-spec.md](docs/tail-inequalities-activity-spec.md) for the complete technical specification.

---

## Classroom Use

**Recommended sequence:**

1. Load Part 1 on the projector. Ask: "You have a random variable S. You need to bound P(S ≥ 60). What do you need to know?"
2. Click "Reveal stage 1." 83.3% appears. Why so loose?
3. Reveal stage 2. 25%. What extra assumption bought us from 83% to 25%?
4. Reveal stage 3. 13.5%. What made the bound exponential?
5. Show the truth: 2.3%. Point to the ladder: each fact narrowed the gap.
6. Hand students the activity for Part 2. Let them work through the three scenarios.

**Key questions:**
- Which bound requires the fewest assumptions? What does that cost?
- Why can't we use Chernoff for the Morris counter, even though we know the variance?
- What is the practical meaning of a 2.1 × 10⁻¹⁷ probability?

---

## Credits

Visualization design and implementation (v7): **Claude Opus 4.6** (Anthropic).

Deployment, repository configuration, and logistics: **Claude Sonnet 4.6** (Anthropic).

Pedagogical framing, course context, and activity design: CIS 3200 / CIS 5020, University of Pennsylvania.

---

## License

MIT. Use freely in courses and adapt for your own probability visualizations.
