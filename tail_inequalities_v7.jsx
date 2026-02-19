import { useState, useEffect, useCallback } from "react";

// ── Claude Code Extended palette ─────────────────────────────────────────────
const C = {
  bg: "#f5f0e8", bgPanel: "#ede8df", bgCard: "#e8e2d8",
  border: "#d0c8bb", borderLight: "#e0d9cf",
  coral: "#e8865a", coralDim: "#f2c4ab", coralBg: "#fdf0e8",
  lime: "#7ab830", limeDim: "#b8d98a", limeBg: "#f0f7e4",
  text: "#2c2416", textMid: "#7a6e60", textDim: "#b0a898", textFaint: "#d0c8bb",
  blue: "#3a6bc0", blueDim: "#a0b8e0", blueBg: "#eef2fa",
  purple: "#8a6aaa", purpleDim: "#c4b0d8",
  good: "#5a9a2e", ok: "#c47c1a", bad: "#c0442a",
};
const font = "'Georgia', serif";
const mono = "monospace";

// ── KaTeX loader ─────────────────────────────────────────────────────────────
function useKatex() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (window.katex) { setReady(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);
  return ready;
}

function Tex({ children, display = false }) {
  const ready = typeof window !== "undefined" && window.katex;
  if (!ready) {
    return <code style={{ fontFamily: mono, fontSize: display ? "1rem" : "inherit" }}>{children}</code>;
  }
  try {
    const html = window.katex.renderToString(children, {
      displayMode: display,
      throwOnError: false,
      trust: true,
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <code style={{ fontFamily: mono }}>{children}</code>;
  }
}

// ── Formula bridge component ─────────────────────────────────────────────────
// Shows: abstract formula → mapping → substitution → result
function FormulaBridge({ formula, mapping, substitution, result, color }) {
  return (
    <div style={{
      background: C.bgCard, borderRadius: 6, padding: "0.65rem 0.85rem",
      border: `1px solid ${C.borderLight}`, marginBottom: "0.5rem",
      fontSize: "0.85rem",
    }}>
      {/* Abstract formula */}
      <div style={{ marginBottom: "0.4rem", textAlign: "center" }}>
        <Tex display>{formula}</Tex>
      </div>
      {/* Arrow + mapping */}
      <div style={{
        display: "flex", alignItems: "flex-start", gap: "0.5rem",
        marginBottom: "0.35rem", paddingBottom: "0.35rem",
        borderBottom: `1px solid ${C.borderLight}`,
      }}>
        <span style={{ color: C.coral, fontWeight: 700, fontSize: "0.8rem", flexShrink: 0, marginTop: 1 }}>
          substitute:
        </span>
        <div style={{ fontFamily: mono, fontSize: "0.78rem", color: C.textMid, lineHeight: 1.6 }}>
          {mapping.map((m, i) => (
            <span key={i}>
              {i > 0 && <span style={{ color: C.borderLight }}>{" , "}</span>}
              <Tex>{m}</Tex>
            </span>
          ))}
        </div>
      </div>
      {/* Substitution → result */}
      <div style={{ textAlign: "center" }}>
        <Tex display>{substitution}</Tex>
      </div>
      <div style={{
        textAlign: "center", fontFamily: mono, fontSize: "1rem",
        fontWeight: 700, color: color || C.text, marginTop: "0.2rem",
      }}>
        = {result}
      </div>
    </div>
  );
}

// ── Mini distribution sketch ─────────────────────────────────────────────────
function MiniDist({ points, color, tailStart, width = 120, height = 44, label }) {
  const W = width, H = height, pad = 4;
  const maxY = Math.max(...points.map((p) => p[1]));
  const toX = (x) => pad + (x / 1) * (W - 2 * pad);
  const toY = (y) => H - pad - (y / maxY) * (H - 2 * pad - 6);
  const curvePts = points.map((p) => `${toX(p[0]).toFixed(1)},${toY(p[1]).toFixed(1)}`);
  const curvePath = "M " + curvePts.join(" L ");
  let tailPath = "";
  if (tailStart !== undefined) {
    const tailPts = points.filter((p) => p[0] >= tailStart);
    if (tailPts.length > 1) {
      tailPath = `M ${toX(tailPts[0][0]).toFixed(1)},${toY(0).toFixed(1)} ` +
        tailPts.map((p) => `L ${toX(p[0]).toFixed(1)},${toY(p[1]).toFixed(1)}`).join(" ") +
        ` L ${toX(tailPts[tailPts.length - 1][0]).toFixed(1)},${toY(0).toFixed(1)} Z`;
    }
  }
  return (
    <div style={{ display: "inline-block", textAlign: "center" }}>
      <svg width={W} height={H} style={{ display: "block" }}>
        {tailPath && <path d={tailPath} fill={`${C.coral}30`} />}
        <path d={curvePath} fill="none" stroke={color || C.textMid} strokeWidth={2} strokeLinecap="round" />
        {tailStart !== undefined && (
          <line x1={toX(tailStart)} x2={toX(tailStart)} y1={pad} y2={H - pad}
            stroke={C.coral} strokeWidth={1} strokeDasharray="2,2" opacity={0.6} />
        )}
      </svg>
      {label && <div style={{ fontSize: "0.65rem", fontFamily: mono, color: C.textDim, marginTop: -2 }}>{label}</div>}
    </div>
  );
}

function normalPoints(mu, sigma, n = 60) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const x = i / n; pts.push([x, Math.exp(-0.5 * ((x - mu) / sigma) ** 2)]); }
  return pts;
}
function uniformPoints(a, b) {
  return [[0, 0], [a - 0.001, 0], [a, 1], [b, 1], [b + 0.001, 0], [1, 0]];
}
function bimodalPoints(mu1, mu2, sigma, n = 60) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = i / n;
    pts.push([x, 0.5 * Math.exp(-0.5 * ((x - mu1) / sigma) ** 2) + 0.5 * Math.exp(-0.5 * ((x - mu2) / sigma) ** 2)]);
  }
  return pts;
}
function paretoPoints(alpha, n = 60) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const x = i / n; pts.push([x, x < 0.05 ? 0 : (0.05 / Math.max(x, 0.05)) ** alpha]); }
  return pts;
}

// ── Shared UI ────────────────────────────────────────────────────────────────

function BoundBar({ label, value, truth, color, detail, year }) {
  const pct = Math.min(value, 1) * 100;
  const truthPct = truth !== null ? Math.min(truth, 1) * 100 : null;
  const ratio = truth && truth > 0 ? value / truth : null;
  const valueStr = value >= 0.001
    ? (value * 100).toFixed(1) + "%"
    : value.toExponential(1).replace("e", " × 10^").replace("+", "");

  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: 3 }}>
        <span style={{ fontWeight: 700, fontSize: "0.85rem", color, minWidth: 110 }}>
          {label}
          {year && <span style={{ fontWeight: 400, fontSize: "0.68rem", color: C.textDim, marginLeft: 5 }}>{year}</span>}
        </span>
        <span style={{ fontFamily: mono, fontSize: "0.82rem", color: C.text, fontWeight: 600 }}>
          ≤ {valueStr}
        </span>
        {ratio !== null && (
          <span style={{
            fontFamily: mono, fontSize: "0.7rem", fontWeight: 600, marginLeft: "auto",
            color: ratio > 100 ? C.bad : ratio > 10 ? C.ok : C.good,
          }}>
            {ratio >= 1000 ? `${(ratio / 1000).toFixed(0)}k×` : `${ratio.toFixed(1)}×`}
          </span>
        )}
      </div>
      <div style={{ position: "relative", height: 20 }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 20,
          background: C.bgCard, borderRadius: 4, border: `1px solid ${C.borderLight}`,
        }} />
        <div style={{
          position: "absolute", top: 2, left: 2, height: 16,
          width: `calc(${Math.max(pct, 0.3)}% - 4px)`, minWidth: 3,
          background: `${color}30`, borderLeft: `3px solid ${color}`,
          borderRadius: 3, transition: "width 0.4s ease",
        }} />
        {truthPct !== null && (
          <div style={{
            position: "absolute", top: 0, height: 20,
            left: `${truthPct}%`, width: 2, background: C.text, borderRadius: 1,
          }} />
        )}
      </div>
      {detail && <div style={{ fontFamily: mono, fontSize: "0.7rem", color: C.textDim, marginTop: 2 }}>{detail}</div>}
    </div>
  );
}

function Tag({ children, active, color }) {
  return (
    <span style={{
      display: "inline-block", fontFamily: mono, fontSize: "0.7rem",
      padding: "2px 8px", borderRadius: 4, fontWeight: 600, marginRight: 4, marginBottom: 2,
      background: active ? `${color}18` : C.bgCard,
      color: active ? color : C.textDim,
      border: `1px solid ${active ? color : C.borderLight}`,
    }}>{children}</span>
  );
}

function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginTop: "0.4rem" }}>
      <button onClick={() => setOpen(!open)} style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: font, fontSize: "0.78rem", color: C.textMid, padding: "2px 0",
        textDecoration: "underline", textDecorationColor: C.borderLight,
      }}>
        {open ? "▾" : "▸"} {title}
      </button>
      {open && (
        <div style={{
          background: C.bgCard, borderRadius: 6, padding: "0.6rem 0.8rem",
          marginTop: 4, border: `1px solid ${C.borderLight}`,
        }}>{children}</div>
      )}
    </div>
  );
}

// ── Stage data ───────────────────────────────────────────────────────────────

const TRUTH = 0.0228;

const STAGES = [
  {
    id: 1, title: "Only the mean",
    reveal: "Your monitoring says the average sum is 50.",
    knowledge: ["S ≥ 0", "𝔼[S] = 50"],
    bounds: [{ name: "Markov", year: 1889, color: C.coral, value: 50 / 60, detail: "𝔼[S] / t = 50 / 60 ≈ 83.3%" }],
    unlocks: "Markov",
    narrative: "All you know is the expected value. Maybe the distribution is tightly concentrated around 50, maybe it's wildly spread out. Markov gives you the only guarantee possible: the tail can't exceed the mean divided by the threshold.",
    explanation: "With only the mean, Markov is your only tool. It says: the tail probability can't exceed 𝔼[S]/t. This is often a terrible bound — but it's honest about how little you know.",
    formulaTex: "P(S \\geq t) \\leq \\frac{\\mathbb{E}[S]}{t}",
    exampleDistTitle: "What could S look like? (all have 𝔼[S] = 50)",
    exampleDists: [
      { label: "Tight normal", points: normalPoints(0.5, 0.06), tailStart: 0.6, caption: "Concentrated. Actual tail: tiny." },
      { label: "Spread uniform", points: uniformPoints(0.1, 0.9), tailStart: 0.6, caption: "Spread 10–90. Actual tail: ~37%." },
      { label: "Bimodal", points: bimodalPoints(0.2, 0.8, 0.06), tailStart: 0.6, caption: "Two peaks. Actual tail: ~50%." },
    ],
    exampleNote: "All three have the same mean. Markov can't tell them apart — so its 83.3% bound must cover the worst case.",
  },
  {
    id: 2, title: "Add the variance",
    reveal: "Further analysis: Var(S) = 25 (so √Var(S) = 5).",
    knowledge: ["S ≥ 0", "𝔼[S] = 50", "Var(S) = 25"],
    bounds: [
      { name: "Markov", year: 1889, color: C.coral, value: 50 / 60, detail: "83.3% (unchanged)" },
      { name: "Chebyshev", year: 1867, color: C.blue, value: 25 / 100, detail: "Var(S) / d² = 25 / 100 = 25%" },
    ],
    unlocks: "Chebyshev",
    narrative: "Now you know the spread: √Var(S) = 5. The distribution can't be too wild. This eliminates the uniform and bimodal examples from Stage 1 — their variances were much larger.",
    explanation: "Chebyshev says: the probability of being d away from the mean can't exceed Var(S)/d². This works for ANY distribution with finite variance — no assumptions about shape or independence.",
    formulaTex: "P(|S - \\mathbb{E}[S]| \\geq d) \\leq \\frac{\\text{Var}(S)}{d^2}",
    exampleDistTitle: "What fits now? (𝔼[S] = 50 AND Var(S) = 25)",
    exampleDists: [
      { label: "Normal, √Var = 5", points: normalPoints(0.5, 0.05), tailStart: 0.6, caption: "Bell curve. Actual tail: ~2.3%." },
      { label: "Skewed right", points: (() => { const pts = []; for (let i = 0; i <= 60; i++) { const x = i / 60; const z = (x - 0.48) / 0.04; pts.push([x, Math.exp(-0.5 * z * z) * (1 + 0.6 / (1 + Math.exp(-15 * (x - 0.48))))]); } return pts; })(), tailStart: 0.6, caption: "Skewed, same variance. Tail: ~4%." },
    ],
    exampleNote: "Variance eliminates widely-spread distributions. But different shapes can still have Var(S) = 25. Chebyshev's 25% must cover all of them.",
  },
  {
    id: 3, title: "Add independence + boundedness",
    reveal: "S = X₁ + X₂ + ... + X₁₀₀ where each Xᵢ is an independent coin flip ∈ {0, 1}.",
    knowledge: ["S ≥ 0", "𝔼[S] = 50", "Var(S) = 25", "Xᵢ independent", "Xᵢ ∈ [0,1]"],
    bounds: [
      { name: "Markov", year: 1889, color: C.coral, value: 50 / 60, detail: "83.3%" },
      { name: "Chebyshev", year: 1867, color: C.blue, value: 25 / 100, detail: "25%" },
      { name: "Chernoff–Hoeffding", year: 1952, color: C.lime, value: Math.exp(-2), detail: `exp(−2d²/N) = exp(−2) ≈ ${(Math.exp(-2) * 100).toFixed(1)}%` },
    ],
    unlocks: "Chernoff–Hoeffding",
    narrative: "Now you know the internal structure: 100 independent bounded coin flips. This is enormously powerful. Independence means extreme outcomes require many simultaneous deviations — which is exponentially unlikely.",
    explanation: "The qualitative leap: exponential decay. Chernoff converts independence + boundedness into a bound that drops as exp(−2d²/N). This is why algorithm designers work so hard to make random choices independent.",
    formulaTex: "P(S - \\mathbb{E}[S] \\geq d) \\leq \\exp\\!\\left(\\frac{-2d^2}{N}\\right)",
    exampleDistTitle: "What fits now? (independent bounded summands)",
    exampleDists: [
      { label: "Binomial(100, ½)", points: normalPoints(0.5, 0.05), tailStart: 0.6, caption: "Essentially the only shape that fits. Tail: 2.3%." },
    ],
    exampleNote: "Independence + boundedness + known mean pins down the distribution almost completely. Chernoff is tight because there's very little ambiguity left.",
  },
];

// ── Challenge data ───────────────────────────────────────────────────────────

const ASSUMPTIONS = [
  { id: "nonneg", label: "Non-negative", tex: "X \\geq 0" },
  { id: "mean", label: "Mean is known", tex: "E[X] = \\mu" },
  { id: "variance", label: "Variance is known", tex: "\\text{Var}(X) = \\sigma^2" },
  { id: "independent", label: "Sum of independent parts", tex: "X_i \\perp X_j" },
  { id: "bounded", label: "Each part bounded in [a, b]", tex: "X_i \\in [a,b]" },
];

const CHALLENGES = [
  {
    id: "server", icon: "⏱", title: "Server response time",
    scenario: "A server handles requests. From logs, you know the average response time is 200 ms. You have no other information — no variance estimate, no knowledge of the internal architecture.",
    questionTex: "P(T \\geq 1000 \\text{ ms}) \\leq \\;???",
    correctAssumptions: { nonneg: true, mean: true, variance: false, independent: false, bounded: false },
    bestBound: "Markov", bestBoundColor: C.coral, boundValue: 200 / 1000,
    bridge: {
      formula: "P(X \\geq t) \\leq \\frac{\\mathbb{E}[X]}{t}",
      mapping: ["\\mathbb{E}[X] = 200\\text{ ms}", "t = 1000\\text{ ms}"],
      substitution: "P(T \\geq 1000) \\leq \\frac{200}{1000}",
      result: "20%",
    },
    feedback: "With only the mean known, Markov is your only tool. 20% sounds loose — but consider: server response times often follow heavy-tailed distributions where extreme values are genuinely common. Markov is honest about your ignorance.",
    whyNotOthers: "No variance estimate → Chebyshev can't help. No structural decomposition → Chernoff can't help.",
    numberNote: "Why 1000 ms? It's a standard timeout threshold (1 second). The question is practical: what fraction of requests might hit the timeout? The threshold is 5× the mean, so Markov gives 𝔼[T]/t = 200/1000 = 20%.",
    distSketches: [
      { label: "Normal (light tail)", points: normalPoints(0.2, 0.08), tailStart: 0.6, color: C.blue },
      { label: "Pareto (heavy tail)", points: paretoPoints(2.2), tailStart: 0.6, color: C.bad },
    ],
    distNote: "A normal distribution (left) has thin tails — timeouts would be rare. A Pareto distribution (right) has a 'heavy tail' — extreme values are much more likely. 'Heavy-tailed' means: the probability of very large values decays slowly (polynomially, not exponentially). Real server latencies often look like the right one. Markov must handle both.",
  },
  {
    id: "morris", icon: "🔢", title: "Morris counter accuracy",
    scenario: "You've run a Morris approximate counter for n = 1000 events. The estimated count (Est) is unbiased: 𝔼[Est] = 1000. Theory gives Var(Est) ≈ 500,000, so √Var(Est) ≈ 707. But each probabilistic increment depends on the current counter value — the increments are NOT independent.",
    questionTex: "P(|\\text{Est} - 1000| \\geq 1500) \\leq \\;???",
    correctAssumptions: { nonneg: true, mean: true, variance: true, independent: false, bounded: false },
    bestBound: "Chebyshev", bestBoundColor: C.blue,
    boundValue: Math.min(1, 500000 / (1500 * 1500)),
    bridge: {
      formula: "P(|X - \\mathbb{E}[X]| \\geq d) \\leq \\frac{\\text{Var}(X)}{d^2}",
      mapping: ["\\mathbb{E}[\\text{Est}] = 1000", "\\text{Var}(\\text{Est}) = 500{,}000", "d = 1500"],
      substitution: "P(|\\text{Est} - 1000| \\geq 1500) \\leq \\frac{500{,}000}{1500^2} = \\frac{500{,}000}{2{,}250{,}000}",
      result: "≈ 22.2%",
    },
    feedback: "You know both the mean and the variance, but the increments are dependent — each probabilistic increment depends on the current counter state. Chernoff requires independence, so it can't be applied here. Chebyshev is your strongest available tool.",
    whyNotOthers: "Each Morris increment depends on the current counter state (increment probability = 1/2^counter). This chain of dependencies breaks independence → Chernoff is inapplicable.",
    numberNote: "Why d = 1500? That's a 150% relative error — estimating 1000 events as 2500 or fewer than 0. Since √Var(Est) ≈ 707, the deviation d = 1500 is about 2.1 standard deviations. Chebyshev gives Var(Est)/d² ≈ 22%. Not great! This is why the average-of-k trick exists: run k independent Morris counters, average them. The average has variance 500,000/k, and now the averages ARE independent — unlocking Chernoff.",
    distSketches: null, distNote: null,
  },
  {
    id: "bloom", icon: "🔵", title: "Bloom filter saturation",
    scenario: "You insert 200 items into a Bloom filter with m = 2000 bit-positions and k = 3 independent hash functions. After all insertions, let B = number of bit-positions that are set to 1. Each bit-position is set independently: bit j is set to 1 if any of the 600 hash outputs (200 items × 3 hashes) lands on position j. Since each hash output is an independent uniform random choice, whether bit j is hit is independent of whether bit i is hit. Each bit is a Bernoulli random variable bounded in {0, 1}. Theory gives 𝔼[B] ≈ 904, √Var(B) ≈ 20.",
    questionTex: "P(B \\geq 1100) \\leq \\;???",
    correctAssumptions: { nonneg: true, mean: true, variance: true, independent: true, bounded: true },
    bestBound: "Chernoff–Hoeffding", bestBoundColor: C.lime,
    boundValue: Math.exp(-2 * 196 * 196 / 2000),
    bridge: {
      formula: "P(S - \\mathbb{E}[S] \\geq d) \\leq \\exp\\!\\left(\\frac{-2d^2}{N}\\right)",
      mapping: ["\\mathbb{E}[B] = 904", "d = 1100 - 904 = 196", "N = 2000\\text{ bits}"],
      substitution: "P(B \\geq 1100) \\leq \\exp\\!\\left(\\frac{-2 \\times 196^2}{2000}\\right) = \\exp(-38.4)",
      result: "≈ 2.1 × 10⁻¹⁷",
    },
    feedback: "B is a sum of 2000 independent Bernoulli variables. Why independent? Each bit-position j is either hit or not by any of the 600 independent, uniformly random hash outputs. Whether bit j gets hit depends only on whether any hash lands on j — and since the hash outputs are independent uniform choices, the events for different bit-positions are independent. Each bit is bounded in {0, 1}. All Chernoff assumptions are satisfied.",
    whyNotOthers: "All assumptions hold. Chernoff exploits independence + boundedness for exponential decay, vastly dominating Markov (≤ 82%) and Chebyshev (≤ 2.1%).",
    numberNote: "Why B ≥ 1100? That's 55% of bits set to 1. When more than ~50% of a Bloom filter's bits are set, the false positive rate degrades rapidly — the filter becomes unreliable. So '1100 of 2000 bits set' is a practically meaningful bad event. The deviation d = 196 is about 10 standard deviations (since √Var(B) ≈ 20), so this is a 10-sigma event. Chernoff shows it's astronomically unlikely: 2.1 × 10⁻¹⁷. The Bloom filter is safe.",
    distSketches: null, distNote: null,
  },
];

// ── Main component ───────────────────────────────────────────────────────────

export default function TailInequalitiesV7() {
  const katexReady = useKatex();
  const [currentStage, setCurrentStage] = useState(0);
  const [challengeState, setChallengeState] = useState(
    Object.fromEntries(CHALLENGES.map((c) => [c.id, {
      checks: Object.fromEntries(ASSUMPTIONS.map((a) => [a.id, false])),
      submitted: false,
    }]))
  );

  const toggleCheck = (cid, aid) => {
    setChallengeState((s) => ({
      ...s, [cid]: { ...s[cid], checks: { ...s[cid].checks, [aid]: !s[cid].checks[aid] } },
    }));
  };
  const submitChallenge = (cid) => {
    setChallengeState((s) => ({ ...s, [cid]: { ...s[cid], submitted: true } }));
  };

  // ── Bound summary bar (reusable) ──────────────────────────────────────────
  const renderLadder = () => (
    <div style={{
      background: C.bgCard, borderRadius: 8, padding: "0.75rem 1rem",
      border: `1px solid ${C.borderLight}`, marginBottom: "0.75rem",
    }}>
      <div style={{
        fontSize: "0.7rem", fontWeight: 700, color: C.textMid,
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem",
      }}>
        Your best bound at each stage
      </div>
      {currentStage === 0 && (
        <div style={{ color: C.textDim, fontStyle: "italic", fontSize: "0.85rem", padding: "0.3rem 0" }}>
          Click "Reveal stage 1" below to begin.
        </div>
      )}
      {STAGES.filter((_, i) => i < currentStage).map((stage) => {
        const best = stage.bounds[stage.bounds.length - 1];
        return (
          <BoundBar key={stage.id} label={`Stage ${stage.id}: ${best.name}`}
            value={best.value} truth={currentStage >= 3 ? TRUTH : null}
            color={best.color} detail={best.detail} year={best.year}
          />
        );
      })}
      {currentStage >= 3 && (
        <div style={{
          display: "flex", alignItems: "baseline", gap: "0.5rem",
          paddingTop: "0.4rem", borderTop: `1px solid ${C.borderLight}`, marginTop: "0.3rem",
        }}>
          <span style={{ fontWeight: 700, fontSize: "0.85rem", minWidth: 110 }}>Truth</span>
          <span style={{ fontFamily: mono, fontSize: "0.82rem", fontWeight: 600 }}>≈ 2.3%</span>
          <span style={{ fontSize: "0.72rem", color: C.textDim }}>(exact binomial)</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      fontFamily: font, background: C.bg, color: C.text,
      minHeight: "100vh", padding: "1.75rem 1.5rem",
      maxWidth: 780, margin: "0 auto",
    }}>
      {/* ═══════ HEADER ═══════ */}
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.2rem", letterSpacing: "-0.02em" }}>
        What Can You Prove With Less?
      </h1>
      <p style={{ color: C.textMid, fontSize: "0.88rem", margin: "0 0 0.5rem", lineHeight: 1.5 }}>
        You need to bound the probability of a rare event. Each piece of knowledge unlocks a sharper tool.
        The question is never "which bound is best?" — it's{" "}
        <strong style={{ color: C.lime }}>What do I know about my random variable?</strong>
      </p>

      {/* ═══════ PART 1: PROGRESSIVE REVELATION ═══════ */}
      <div style={{
        background: C.bgPanel, border: `1.5px solid ${C.border}`, borderRadius: 10,
        padding: "1.25rem", marginBottom: "1.25rem",
      }}>
        <div style={{
          fontSize: "0.7rem", fontWeight: 700, color: C.textMid,
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem",
        }}>
          Part 1 — The Knowledge Ladder
        </div>

        {/* Setup */}
        <div style={{
          background: C.coralBg, border: `1.5px solid ${C.coralDim}`,
          borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem",
        }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.25rem" }}>The Setup</div>
          <p style={{ fontSize: "0.85rem", margin: "0 0 0.4rem", lineHeight: 1.5 }}>
            You have a random variable S. You need a guaranteed upper bound:
          </p>
          <div style={{ textAlign: "center", padding: "0.25rem 0" }}>
            <Tex display>{"P(S \\geq 60) \\leq \\;???"}</Tex>
          </div>
          <p style={{ fontSize: "0.8rem", margin: "0.3rem 0 0", color: C.textMid }}>
            At each stage, you learn one more fact. Each fact unlocks a tighter bound.
          </p>
        </div>

        {/* Ladder — shown BEFORE stages */}
        {renderLadder()}

        {/* Stage cards */}
        {STAGES.map((stage, idx) => {
          const isRevealed = idx < currentStage;
          const isCurrent = idx === currentStage;
          const isFuture = idx > currentStage;

          return (
            <div key={stage.id} style={{
              background: isRevealed ? "white" : isCurrent ? C.bgCard : C.bgPanel,
              border: `1.5px solid ${isCurrent ? C.coral : C.borderLight}`,
              borderRadius: 8,
              padding: isRevealed || isCurrent ? "0.85rem 1rem" : "0.5rem 1rem",
              marginBottom: "0.5rem",
              opacity: isFuture ? 0.35 : 1,
              transition: "all 0.3s",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{
                  fontFamily: mono, fontSize: "0.72rem", fontWeight: 700,
                  color: isRevealed ? C.lime : isCurrent ? C.coral : C.textDim,
                  background: isRevealed ? C.limeBg : isCurrent ? C.coralBg : C.bgCard,
                  padding: "2px 8px", borderRadius: 4,
                }}>
                  {isRevealed ? "✓" : `STAGE ${stage.id}`}
                </span>
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{stage.title}</span>
                <span style={{ fontSize: "0.78rem", color: C.textMid, marginLeft: "auto" }}>
                  unlocks <strong style={{ color: stage.bounds[stage.bounds.length - 1].color }}>
                    {stage.unlocks}</strong>
                </span>
              </div>

              {isRevealed && (
                <div style={{ marginTop: "0.6rem" }}>
                  <div style={{
                    background: C.limeBg, borderRadius: 6, padding: "0.5rem 0.75rem",
                    marginBottom: "0.5rem", fontSize: "0.82rem",
                  }}>
                    <strong>Revealed:</strong> {stage.reveal}
                  </div>

                  <div style={{ marginBottom: "0.5rem" }}>
                    {stage.knowledge.map((k, i) => (
                      <Tag key={i} active color={C.lime}>{k}</Tag>
                    ))}
                  </div>

                  <p style={{ fontSize: "0.82rem", color: C.textMid, margin: "0 0 0.4rem", lineHeight: 1.5 }}>
                    {stage.narrative}
                  </p>

                  {/* The formula for the new bound */}
                  <div style={{
                    background: C.bgCard, borderRadius: 6, padding: "0.5rem 0.75rem",
                    border: `1px solid ${C.borderLight}`, textAlign: "center", marginBottom: "0.4rem",
                  }}>
                    <Tex display>{stage.formulaTex}</Tex>
                  </div>

                  <div style={{
                    borderLeft: `3px solid ${stage.bounds[stage.bounds.length - 1].color}`,
                    paddingLeft: "0.75rem", fontSize: "0.82rem", color: C.textMid, lineHeight: 1.5,
                    marginBottom: "0.3rem",
                  }}>
                    {stage.explanation}
                  </div>

                  {/* Example distributions */}
                  {stage.exampleDists && (
                    <Collapsible title={stage.exampleDistTitle}>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "0.5rem" }}>
                        {stage.exampleDists.map((d, i) => (
                          <div key={i} style={{ textAlign: "center", maxWidth: 150 }}>
                            <MiniDist points={d.points} tailStart={d.tailStart} color={C.textMid} />
                            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: C.text, marginTop: 2 }}>{d.label}</div>
                            <div style={{ fontSize: "0.65rem", color: C.textDim, lineHeight: 1.3 }}>{d.caption}</div>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: "0.75rem", color: C.textMid, margin: 0, lineHeight: 1.45, fontStyle: "italic" }}>
                        {stage.exampleNote}
                      </p>
                    </Collapsible>
                  )}
                </div>
              )}

              {isCurrent && (
                <button onClick={() => setCurrentStage(currentStage + 1)} style={{
                  marginTop: "0.6rem", background: C.coral, color: "white", border: "none",
                  borderRadius: 6, padding: "8px 20px", cursor: "pointer",
                  fontFamily: font, fontSize: "0.85rem", fontWeight: 700,
                }}>
                  Reveal stage {stage.id} →
                </button>
              )}
              {isFuture && (
                <div style={{ fontSize: "0.78rem", color: C.textDim, fontStyle: "italic", marginTop: 2 }}>
                  Complete stage {stage.id - 1} first
                </div>
              )}
            </div>
          );
        })}

        {/* Ladder REPEATED after stages for scroll visibility */}
        {currentStage >= 2 && renderLadder()}

        {/* Summary */}
        {currentStage >= 3 && (
          <div style={{
            background: C.limeBg, border: `1.5px solid ${C.lime}40`,
            borderRadius: 8, padding: "0.85rem 1rem", marginTop: "0.25rem",
          }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.3rem" }}>The ladder</div>
            <p style={{ fontSize: "0.82rem", color: C.textMid, margin: 0, lineHeight: 1.55 }}>
              <strong style={{ color: C.coral }}>83.3%</strong> → <strong style={{ color: C.blue }}>25%</strong> → <strong style={{ color: C.lime }}>13.5%</strong> → truth <strong>2.3%</strong>.{" "}
              Each piece of knowledge tightened the guarantee. These bounds aren't ranked
              worst-to-best — they're <em>tools for different situations</em>. The question is always:{" "}
              <strong style={{ color: C.lime }}>What do I know about my random variable?</strong>
            </p>
          </div>
        )}
      </div>

      {/* ═══════ PART 2: CHALLENGE SCENARIOS ═══════ */}
      <div style={{
        background: C.bgPanel, border: `1.5px solid ${C.border}`, borderRadius: 10,
        padding: "1.25rem", marginBottom: "1.25rem",
        opacity: currentStage >= 3 ? 1 : 0.35,
        pointerEvents: currentStage >= 3 ? "auto" : "none",
        transition: "opacity 0.5s",
      }}>
        <div style={{
          fontSize: "0.7rem", fontWeight: 700, color: C.textMid,
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.25rem",
        }}>
          Part 2 — Which Tool Fits?
        </div>
        <p style={{ fontSize: "0.85rem", color: C.textMid, margin: "0 0 1rem", lineHeight: 1.4 }}>
          For each scenario, check which assumptions hold. Watch which bounds light up — then submit.
        </p>

        {CHALLENGES.map((ch) => {
          const state = challengeState[ch.id];
          const markovOk = state.checks.nonneg && state.checks.mean;
          const chebyshevOk = state.checks.mean && state.checks.variance;
          const chernoffOk = state.checks.mean && state.checks.independent && state.checks.bounded;
          const correctCount = ASSUMPTIONS.filter((a) => state.checks[a.id] === ch.correctAssumptions[a.id]).length;
          const allCorrect = correctCount === ASSUMPTIONS.length;

          return (
            <div key={ch.id} style={{
              background: "white", border: `1.5px solid ${C.borderLight}`,
              borderRadius: 8, padding: "1rem 1.1rem", marginBottom: "0.75rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "1.2rem" }}>{ch.icon}</span>
                <span style={{ fontWeight: 700, fontSize: "1rem" }}>{ch.title}</span>
              </div>

              <p style={{ fontSize: "0.85rem", color: C.textMid, margin: "0 0 0.6rem", lineHeight: 1.5 }}>
                {ch.scenario}
              </p>

              <div style={{
                background: C.coralBg, borderRadius: 6, padding: "8px 12px",
                textAlign: "center", marginBottom: "0.75rem",
              }}>
                <Tex display>{ch.questionTex}</Tex>
              </div>

              {/* Assumption checklist */}
              <div style={{ marginBottom: "0.6rem" }}>
                <div style={{
                  fontSize: "0.72rem", fontWeight: 700, color: C.textMid,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem",
                }}>
                  What properties hold?
                </div>
                {ASSUMPTIONS.map((a) => {
                  const checked = state.checks[a.id];
                  const correct = ch.correctAssumptions[a.id];
                  const show = state.submitted;
                  const match = show ? checked === correct : null;
                  return (
                    <label key={a.id} style={{
                      display: "flex", alignItems: "center", gap: "0.4rem",
                      padding: "3px 0", cursor: state.submitted ? "default" : "pointer",
                      fontSize: "0.85rem",
                    }}>
                      <input type="checkbox" checked={checked} disabled={state.submitted}
                        onChange={() => toggleCheck(ch.id, a.id)}
                        style={{ accentColor: C.lime }} />
                      <span style={{
                        color: show ? (match ? C.good : C.bad) : C.text,
                        fontWeight: show && !match ? 700 : 400,
                      }}>
                        {a.label}
                      </span>
                      {show && !match && (
                        <span style={{ fontFamily: mono, fontSize: "0.68rem", color: C.bad, fontWeight: 600 }}>
                          {correct ? "← should be ✓" : "← should be ✗"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Live bound availability */}
              <div style={{
                background: C.bgCard, borderRadius: 6, padding: "0.5rem 0.75rem",
                marginBottom: "0.5rem",
              }}>
                <div style={{
                  fontSize: "0.68rem", fontWeight: 700, color: C.textMid,
                  textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem",
                }}>
                  Available bounds
                </div>
                {!markovOk && !chebyshevOk && !chernoffOk ? (
                  <div style={{ fontSize: "0.8rem", color: C.textDim, fontStyle: "italic" }}>
                    Check assumptions above to unlock bounds.
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {markovOk && <Tag active color={C.coral}>Markov</Tag>}
                    {chebyshevOk && <Tag active color={C.blue}>Chebyshev</Tag>}
                    {chernoffOk && <Tag active color={C.lime}>Chernoff</Tag>}
                  </div>
                )}
              </div>

              {!state.submitted ? (
                <button onClick={() => submitChallenge(ch.id)} style={{
                  background: C.blue, color: "white", border: "none",
                  borderRadius: 6, padding: "7px 18px", cursor: "pointer",
                  fontFamily: font, fontSize: "0.82rem", fontWeight: 600,
                }}>
                  Check my answer
                </button>
              ) : (
                <div style={{
                  background: `${ch.bestBoundColor}08`,
                  borderLeft: `4px solid ${ch.bestBoundColor}`,
                  borderRadius: "0 8px 8px 0",
                  padding: "0.75rem 1rem", marginTop: "0.5rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                    <span style={{
                      fontWeight: 700, fontSize: "0.88rem",
                      color: allCorrect ? C.good : C.ok,
                    }}>
                      {allCorrect ? "✓ Perfect!" : `${correctCount}/${ASSUMPTIONS.length} correct`}
                    </span>
                    <span style={{ fontFamily: mono, fontSize: "0.75rem", color: C.textDim }}>
                      Best bound: <strong style={{ color: ch.bestBoundColor }}>{ch.bestBound}</strong>
                    </span>
                  </div>

                  {/* ── FORMULA BRIDGE ── */}
                  <FormulaBridge
                    formula={ch.bridge.formula}
                    mapping={ch.bridge.mapping}
                    substitution={ch.bridge.substitution}
                    result={ch.bridge.result}
                    color={ch.bestBoundColor}
                  />

                  <BoundBar label={ch.bestBound} value={ch.boundValue} truth={null}
                    color={ch.bestBoundColor} />

                  <p style={{ fontSize: "0.82rem", color: C.textMid, margin: "0.4rem 0", lineHeight: 1.5 }}>
                    {ch.feedback}
                  </p>
                  <p style={{ fontSize: "0.78rem", color: C.textDim, margin: "0.3rem 0 0.3rem", lineHeight: 1.4, fontStyle: "italic" }}>
                    {ch.whyNotOthers}
                  </p>

                  {/* Distribution sketches */}
                  {ch.distSketches && (
                    <Collapsible title="What could this distribution look like?">
                      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "0.4rem" }}>
                        {ch.distSketches.map((d, i) => (
                          <div key={i} style={{ textAlign: "center" }}>
                            <MiniDist points={d.points} tailStart={d.tailStart} color={d.color} width={140} />
                            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: d.color }}>{d.label}</div>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: "0.72rem", color: C.textMid, margin: 0, lineHeight: 1.4, fontStyle: "italic" }}>
                        {ch.distNote}
                      </p>
                    </Collapsible>
                  )}

                  {/* Number debrief */}
                  <Collapsible title="Where do these numbers come from?">
                    <p style={{ fontSize: "0.78rem", color: C.textMid, margin: 0, lineHeight: 1.55 }}>
                      {ch.numberNote}
                    </p>
                  </Collapsible>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══════ META-LESSON ═══════ */}
      <div style={{
        background: C.limeBg, border: `1.5px solid ${C.lime}40`,
        borderRadius: 8, padding: "0.85rem 1.1rem", marginBottom: "0.75rem",
      }}>
        <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.3rem" }}>The meta-lesson</div>
        <p style={{ fontSize: "0.82rem", color: C.textMid, margin: 0, lineHeight: 1.55 }}>
          These inequalities aren't a hierarchy from bad to good. They're a <em>toolkit</em>.
          A Chebyshev bound that <em>applies</em> always beats a Chernoff bound that <em>doesn't</em>.{" "}
          <strong style={{ color: C.lime }}>What do I know about my random variable?</strong>
        </p>
      </div>

      <div style={{
        fontSize: "0.68rem", color: C.textFaint, textAlign: "center",
        fontFamily: mono, marginTop: "0.5rem",
      }}>
        v7 — KaTeX formulas, formula bridges, refined challenges
      </div>
    </div>
  );
}
