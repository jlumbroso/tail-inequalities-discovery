import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "morris-v6-runs";

// ── Math helpers ──────────────────────────────────────────────────────────
const morrisEst  = (c) => Math.pow(2, c) - 2;
const flipProb   = (c) => 1 / Math.pow(2, c);
const probLabel  = (c) => `1/${Math.pow(2, c)}`;        // e.g. 1/4
const probPct    = (c) => `${(flipProb(c) * 100).toFixed(c <= 3 ? 0 : 1)}%`;
const errPct     = (actual, est) =>
  actual === 0 ? 0 : Math.abs((est - actual) / actual) * 100;
const errColor   = (pct) =>
  pct <= 10 ? "#5a9a2e" : pct <= 35 ? "#c47c1a" : "#c0442a";

// ── Palette ───────────────────────────────────────────────────────────────
const C = {
  bg:          "#f5f0e8",   // Claude beige
  bgPanel:     "#ede8df",   // slightly darker beige
  bgCard:      "#e8e2d8",   // card surface
  border:      "#d0c8bb",   // warm border
  borderLight: "#e0d9cf",
  coral:       "#e8865a",   // Claude coral — H / heads
  coralDim:    "#f2c4ab",   // soft coral
  coralBg:     "#fdf0e8",   // coral tint background
  lime:        "#7ab830",   // lime green — positive, active
  limeDim:     "#b8d98a",
  limeBg:      "#f0f7e4",
  text:        "#2c2416",   // dark warm
  textMid:     "#7a6e60",
  textDim:     "#b0a898",
  textFaint:   "#d0c8bb",
  blue:        "#3a6bc0",   // exact counter
  blueDim:     "#a0b8e0",
};

function toSegments(flips) {
  const segs = [];
  let cur = [];
  for (const f of flips) {
    cur.push(f);
    if (f.result === "H") { segs.push({ flips: cur, closed: true }); cur = []; }
  }
  if (cur.length) segs.push({ flips: cur, closed: false });
  return segs;
}

// ── Tape ──────────────────────────────────────────────────────────────────
const COL = 38;

function Tape({ flips }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [flips.length]);

  const segments = toSegments(flips);

  return (
    <div ref={scrollRef} style={{ overflowX: "auto", flex: 1 }}>
      {flips.length === 0 ? (
        <div style={{ padding: "28px 16px", color: C.textFaint, fontFamily: "monospace", fontSize: 13 }}>
          press ADD ONE or ▶ PLAY to start →
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "stretch", minWidth: "max-content" }}>
          {segments.map((seg, si) => (
            <div key={si} style={{ display: "flex", alignItems: "stretch" }}>
              {/* Segment columns */}
              <div style={{ display: "flex", flexDirection: "column" }}>

                {/* ── Morris row: flip result + probability ── */}
                <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
                  {seg.flips.map((f, fi) => {
                    const isH = f.result === "H";
                    return (
                      <div key={fi} style={{
                        width: COL,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        padding: "5px 0 4px",
                        background: isH ? C.coralBg : "transparent",
                        borderRight: `1px solid ${C.borderLight}`,
                        gap: 2,
                      }}>
                        {/* Result letter */}
                        <div style={{
                          fontSize: 16, fontWeight: 900, fontFamily: "monospace",
                          color: isH ? C.coral : C.textFaint,
                          letterSpacing: 0,
                          textShadow: isH ? `0 0 8px ${C.coralDim}` : "none",
                        }}>
                          {f.result}
                        </div>
                        {/* Probability badge */}
                        <div style={{
                          fontSize: 9, fontFamily: "monospace", fontWeight: 700,
                          color: isH ? C.coral : C.textMid,
                          background: isH ? C.coralDim + "55" : C.bgCard,
                          border: `1px solid ${isH ? C.coralDim : C.borderLight}`,
                          borderRadius: 3, padding: "1px 4px", lineHeight: 1.3,
                        }}>
                          {probLabel(f.cAtFlip)}
                        </div>
                        {/* Pct below */}
                        <div style={{ fontSize: 8, color: isH ? C.coral : C.textFaint, fontFamily: "monospace" }}>
                          {probPct(f.cAtFlip)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Exact counter row ── */}
                <div style={{ display: "flex", borderBottom: `1px solid ${C.border}` }}>
                  {seg.flips.map((_, fi) => (
                    <div key={fi} style={{
                      width: COL, display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "4px 0", borderRight: `1px solid ${C.borderLight}`,
                    }}>
                      <div style={{ fontSize: 9, color: C.blue, fontFamily: "monospace", fontWeight: 700 }}>+1</div>
                    </div>
                  ))}
                </div>

                {/* ── Segment flip-count label ── */}
                <div style={{
                  width: seg.flips.length * COL,
                  textAlign: "center", fontSize: 9, fontFamily: "monospace",
                  color: seg.closed ? C.textMid : C.textFaint,
                  padding: "3px 0",
                }}>
                  {seg.closed
                    ? `${seg.flips.length} flip${seg.flips.length > 1 ? "s" : ""}`
                    : seg.flips.length > 0 ? `${seg.flips.length}…` : ""}
                </div>
              </div>

              {/* Segment divider — gold bar after each H */}
              {seg.closed && (
                <div style={{
                  width: 4, alignSelf: "stretch", flexShrink: 0,
                  background: `linear-gradient(to bottom, transparent, ${C.coral}88, transparent)`,
                }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stats panel ───────────────────────────────────────────────────────────
function StatRow({ label, value, color, dim, big }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
      <span style={{ fontSize: 9, color: dim ? C.textFaint : C.textDim, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.1, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ fontSize: big ? 22 : 13, fontWeight: big ? 900 : 700, fontFamily: "monospace", color: dim ? C.textFaint : (color || C.text), lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}

// ── Histogram ─────────────────────────────────────────────────────────────
function Histogram({ runs, onClear }) {
  if (runs.length === 0) return (
    <div style={{ fontSize: 11, color: C.textFaint, fontFamily: "monospace", padding: "10px 0", textAlign: "center" }}>
      completed runs will appear here after RESET or auto-reset at MAX
    </div>
  );

  const counts = {};
  runs.forEach(r => { counts[r.estimate] = (counts[r.estimate] || 0) + 1; });
  const keys = Object.keys(counts).map(Number).sort((a, b) => a - b);
  const maxC = Math.max(...Object.values(counts));
  const vals = runs.map(r => r.estimate);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const std = Math.sqrt(vals.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / vals.length);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        {[`${runs.length} runs`, `μ = ${mean.toFixed(1)}`, `σ = ${std.toFixed(1)}`].map(t => (
          <span key={t} style={{
            background: C.bgCard, border: `1px solid ${C.border}`,
            borderRadius: 4, padding: "2px 8px", fontSize: 11,
            fontFamily: "monospace", color: C.textMid,
          }}>{t}</span>
        ))}
        <button onClick={onClear} style={{
          background: "none", border: `1px solid ${C.border}`, borderRadius: 4,
          color: C.textDim, fontSize: 10, padding: "2px 8px",
          fontFamily: "monospace", cursor: "pointer",
        }}>clear</button>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90, overflowX: "auto", paddingBottom: 2 }}>
        {keys.map(k => {
          const pct = runs.filter(r => r.estimate === k).map(r => r.error);
          const avgErr = pct.length ? pct.reduce((a, b) => a + b, 0) / pct.length : 0;
          return (
            <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 9, color: C.textMid, fontFamily: "monospace", marginBottom: 2 }}>{counts[k]}</div>
              <div style={{
                width: Math.max(20, Math.min(36, Math.floor(260 / keys.length))),
                height: Math.max(4, (counts[k] / maxC) * 72),
                background: `linear-gradient(to top, ${C.lime}, ${C.limeDim})`,
                borderRadius: "3px 3px 0 0",
                transition: "height 0.3s ease",
              }} />
              <div style={{ fontSize: 8, color: C.textMid, fontFamily: "monospace", marginTop: 2 }}>{k}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: C.textFaint, fontFamily: "monospace", marginTop: 6 }}>
        x-axis = final Morris estimate per completed run
      </div>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────
export default function MorrisCounter() {
  const [flips, setFlips]         = useState([]);
  const [c, setC]                 = useState(1);
  const [actual, setActual]       = useState(0);
  const [maxN, setMaxN]           = useState(10);
  const [speed, setSpeed]         = useState(4);   // flips per second
  const [playing, setPlaying]     = useState(false);
  const [runs, setRuns]           = useState([]);
  const [errHistory, setErrHistory] = useState([]);

  // All mutable state lives here so interval can access current values
  const sr = useRef({ flips: [], c: 1, actual: 0, errHistory: [], runs: [], maxN: 10 });
  sr.current.maxN = maxN;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRuns(parsed);
        sr.current.runs = parsed;
      }
    } catch {}
  }, []);

  // Core step — can be called by button or interval
  const step = useCallback(() => {
    const s = sr.current;
    const newActual = s.actual + 1;
    const cAtFlip = s.c;
    const result = Math.random() < flipProb(cAtFlip) ? "H" : "T";
    const newC = result === "H" ? cAtFlip + 1 : cAtFlip;
    const newFlip = { result, cAtFlip };
    const newFlips = [...s.flips, newFlip];
    const estimate = morrisEst(newC);
    const error = errPct(newActual, estimate);
    const newErrHistory = [...s.errHistory, error];

    sr.current = { ...s, flips: newFlips, c: newC, actual: newActual, errHistory: newErrHistory };
    setFlips(newFlips);
    setC(newC);
    setActual(newActual);
    setErrHistory(newErrHistory);

    if (newActual >= s.maxN) {
      // Record and reset
      const run = { actual: newActual, c: newC, estimate, error };
      const newRuns = [...s.runs, run];
      sr.current = { flips: [], c: 1, actual: 0, errHistory: [], runs: newRuns, maxN: s.maxN };
      setFlips([]); setC(1); setActual(0); setErrHistory([]);
      setRuns(newRuns);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newRuns)); } catch {}
    }
  }, []);

  // Play / pause
  const intervalRef = useRef(null);

  const startPlay = useCallback(() => {
    setPlaying(true);
    intervalRef.current = setInterval(() => { step(); }, Math.round(1000 / speed));
  }, [step, speed]);

  const stopPlay = useCallback(() => {
    setPlaying(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) stopPlay(); else startPlay();
  }, [playing, startPlay, stopPlay]);

  // Restart interval when speed changes while playing
  useEffect(() => {
    if (playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => { step(); }, Math.round(1000 / speed));
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [speed, playing, step]);

  const handleReset = useCallback(() => {
    stopPlay();
    const s = sr.current;
    if (s.actual > 0) {
      const estimate = morrisEst(s.c);
      const error = errPct(s.actual, estimate);
      const run = { actual: s.actual, c: s.c, estimate, error };
      const newRuns = [...s.runs, run];
      sr.current = { flips: [], c: 1, actual: 0, errHistory: [], runs: newRuns, maxN: s.maxN };
      setRuns(newRuns);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newRuns)); } catch {}
    } else {
      sr.current = { ...s, flips: [], c: 1, actual: 0, errHistory: [] };
    }
    setFlips([]); setC(1); setActual(0); setErrHistory([]);
  }, [stopPlay]);

  const clearRuns = useCallback(() => {
    sr.current.runs = [];
    setRuns([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  // Keep sr.current.runs in sync
  useEffect(() => { sr.current.runs = runs; }, [runs]);

  const estimate = morrisEst(c);
  const currentErr = errPct(actual, estimate);
  const minErr = errHistory.length ? Math.min(...errHistory) : null;
  const maxErr = errHistory.length ? Math.max(...errHistory) : null;
  const progress = Math.min(actual / maxN, 1);

  return (
    <div style={S.root}>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { height: 5px; background: ${C.bgCard}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        button { cursor: pointer; font-family: monospace; }
        button:active { opacity: 0.7 !important; }
        input[type=range] { accent-color: ${C.coral}; }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Morris Counter</h1>
          <div style={S.subtitle}>approximate counting via probabilistic updates · R. Morris, 1978</div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* MAX slider */}
          <div style={S.sliderGroup}>
            <span style={S.sliderLabel}>MAX</span>
            <input type="range" min={5} max={30} step={1} value={maxN}
              onChange={e => { const v = +e.target.value; setMaxN(v); sr.current.maxN = v; }}
              style={{ width: 70 }} />
            <span style={S.sliderVal}>{maxN}</span>
          </div>

          {/* Speed slider (only when playing or relevant) */}
          <div style={S.sliderGroup}>
            <span style={S.sliderLabel}>SPEED</span>
            <input type="range" min={1} max={20} step={1} value={speed}
              onChange={e => setSpeed(+e.target.value)}
              style={{ width: 70 }} />
            <span style={S.sliderVal}>{speed}/s</span>
          </div>

          <button onClick={step} style={S.btnAdd}>+ ADD ONE</button>

          <button onClick={togglePlay} style={{
            ...S.btnPlay,
            background: playing ? C.coral : C.lime,
            color: "#fff",
          }}>
            {playing ? "⏸ PAUSE" : "▶ PLAY"}
          </button>

          <button onClick={handleReset} style={S.btnReset}>↺ RESET</button>
        </div>
      </div>

      {/* ── Main: tape + stats ──────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>

        {/* Tape + row labels */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={S.tapeContainer}>
            {/* Row labels */}
            <div style={S.tapeLabels}>
              <div style={{ ...S.tapeLabel, borderBottom: `1px solid ${C.border}`, height: 74 }}>
                <div style={{ fontSize: 9, color: C.textMid, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Morris</div>
                <div style={{ fontSize: 8, color: C.textFaint, fontFamily: "monospace" }}>coin flip</div>
              </div>
              <div style={{ ...S.tapeLabel, borderBottom: `1px solid ${C.border}`, height: 30 }}>
                <div style={{ fontSize: 9, color: C.blue, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Exact</div>
                <div style={{ fontSize: 8, color: C.textFaint, fontFamily: "monospace" }}>+1 always</div>
              </div>
              <div style={{ ...S.tapeLabel, height: 22 }}>
                <div style={{ fontSize: 8, color: C.textFaint, fontFamily: "monospace" }}>segment</div>
              </div>
            </div>

            {/* Scrollable tape */}
            <Tape flips={flips} />
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 5, height: 4, background: C.bgCard, borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: progress > 0.85 ? C.coral : C.lime,
              borderRadius: 2,
              transition: "width 0.1s linear",
            }} />
          </div>
          <div style={{ fontSize: 9, color: C.textFaint, fontFamily: "monospace", marginTop: 3, textAlign: "right" }}>
            {actual} / {maxN}
            {playing && <span style={{ marginLeft: 8, color: C.coral }}>● recording</span>}
          </div>
        </div>

        {/* Stats panel */}
        <div style={S.statsPanel}>
          <StatRow label="Actual count" value={actual} big color={C.text} />
          <div style={S.divider} />
          <StatRow label="Morris C" value={c} color={C.coral} />
          <StatRow label="Morris value" value={`2^${c} − 2`} color={C.textMid} />
          <StatRow label="" value={`= ${estimate}`} color={C.coral} />
          <div style={S.divider} />
          <StatRow
            label="Current error"
            value={actual === 0 ? "—" : `${currentErr.toFixed(1)}%`}
            color={actual === 0 ? C.textFaint : errColor(currentErr)}
          />
          <StatRow
            label="Min error"
            value={minErr !== null ? `${minErr.toFixed(1)}%` : "—"}
            color={minErr !== null ? errColor(minErr) : C.textFaint}
            dim={minErr === null}
          />
          <StatRow
            label="Max error"
            value={maxErr !== null ? `${maxErr.toFixed(1)}%` : "—"}
            color={maxErr !== null ? errColor(maxErr) : C.textFaint}
            dim={maxErr === null}
          />
          <div style={S.divider} />
          <div style={{ fontSize: 9, color: C.textFaint, fontFamily: "monospace", lineHeight: 1.6 }}>
            next flip:<br />
            <span style={{ color: C.coral, fontWeight: 700 }}>{probLabel(c)}</span>
            <span style={{ color: C.textMid }}> = {probPct(c)}</span>
          </div>
        </div>
      </div>

      {/* ── Legend ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { swatch: C.coral,    label: "H — heads: C increments, segment closes" },
          { swatch: C.textFaint, label: "T — tails: C unchanged" },
          { swatch: C.coral+"88", label: "│ — segment boundary" },
          { swatch: C.blue,     label: "exact counter row" },
        ].map(k => (
          <div key={k.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: k.swatch, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: C.textMid, fontFamily: "monospace" }}>{k.label}</span>
          </div>
        ))}
        <span style={{ fontSize: 9, color: C.textFaint, fontFamily: "monospace", marginLeft: "auto" }}>
          segments grow longer as C increases → more flips needed per increment
        </span>
      </div>

      {/* ── Histogram ───────────────────────────────────────────────────── */}
      <div style={S.histBox}>
        <div style={{ fontSize: 9, color: C.textDim, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          Final Estimate Distribution — {runs.length} run{runs.length !== 1 ? "s" : ""}
        </div>
        <Histogram runs={runs} onClear={clearRuns} />
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────
const S = {
  root: {
    minHeight: "100vh",
    background: C.bg,
    color: C.text,
    fontFamily: "'Georgia', serif",
    padding: "16px 14px 32px",
    maxWidth: 980,
    margin: "0 auto",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 12, flexWrap: "wrap", gap: 10,
  },
  title: {
    margin: 0, fontSize: "clamp(17px,3vw,25px)", fontWeight: 700,
    color: C.text, letterSpacing: -0.5,
  },
  subtitle: { fontSize: 10, color: C.textFaint, fontFamily: "monospace", marginTop: 3 },
  sliderGroup: {
    display: "flex", alignItems: "center", gap: 5,
    background: C.bgPanel, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "5px 10px",
  },
  sliderLabel: { fontSize: 9, color: C.textDim, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1 },
  sliderVal:   { fontSize: 11, color: C.textMid, fontFamily: "monospace", minWidth: 28 },
  btnAdd: {
    background: C.bgPanel, border: `1.5px solid ${C.border}`,
    borderRadius: 8, color: C.text,
    fontSize: 13, fontWeight: 800, padding: "9px 18px",
  },
  btnPlay: {
    border: "none", borderRadius: 8,
    fontSize: 13, fontWeight: 800, padding: "9px 18px",
    letterSpacing: 0.3,
  },
  btnReset: {
    background: "transparent", border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.textMid,
    fontSize: 12, fontWeight: 700, padding: "9px 14px",
  },
  tapeContainer: {
    display: "flex",
    background: C.bgPanel,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    overflow: "hidden",
  },
  tapeLabels: {
    flexShrink: 0,
    borderRight: `1px solid ${C.border}`,
    display: "flex", flexDirection: "column",
  },
  tapeLabel: {
    padding: "0 10px",
    display: "flex", flexDirection: "column", justifyContent: "center",
  },
  statsPanel: {
    width: 170, flexShrink: 0,
    background: C.bgPanel,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "12px 12px",
    alignSelf: "flex-start",
  },
  divider: { height: 1, background: C.border, margin: "7px 0" },
  histBox: {
    background: C.bgPanel,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "12px 14px",
  },
};
