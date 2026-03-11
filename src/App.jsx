import { useState, useEffect } from "react";

const EMOTIONS = ["😤 FOMO", "😰 Paura", "🧠 Lucido", "😤 Vendetta", "😴 Stanco", "💪 Fiducioso", "😬 Ansioso", "🎯 In Zona"];

const initialTrades = [
  { id: 1, date: "2025-03-08", symbol: "EUR/USD", direction: "LONG", entry: 1.0842, exit: 1.0891, size: 1.5, pnl: 73.5, emotionBefore: "🧠 Lucido", emotionDuring: "💪 Fiducioso", emotionAfter: "🎯 In Zona", notes: "Setup perfetto, rispettato il piano.", setup: "Breakout + Retest", screenshot: null },
  { id: 2, date: "2025-03-09", symbol: "GOLD", direction: "SHORT", entry: 2185, exit: 2201, size: 0.5, pnl: -80, emotionBefore: "😤 FOMO", emotionDuring: "😬 Ansioso", emotionAfter: "😰 Paura", notes: "Entrato troppo in fretta senza conferma.", setup: "Impulso senza setup", screenshot: null },
  { id: 3, date: "2025-03-10", symbol: "BTC/USD", direction: "LONG", entry: 81200, exit: 82900, size: 0.1, pnl: 170, emotionBefore: "🧠 Lucido", emotionDuring: "🧠 Lucido", emotionAfter: "💪 Fiducioso", notes: "Aspettato il livello chiave. Pazienza premiata.", setup: "Demand Zone", screenshot: null },
  { id: 4, date: "2025-03-11", symbol: "NAS100", direction: "SHORT", entry: 19850, exit: 19780, size: 0.2, pnl: 140, emotionBefore: "🎯 In Zona", emotionDuring: "🎯 In Zona", emotionAfter: "💪 Fiducioso", notes: "Esecuzione pulita. Nessuna deviazione dal piano.", setup: "Supply Zone + FVG", screenshot: null },
];

const CHART_DATA = [
  { d: "Mar 1", pnl: 120 }, { d: "Mar 2", pnl: -45 }, { d: "Mar 3", pnl: 210 },
  { d: "Mar 4", pnl: -80 }, { d: "Mar 5", pnl: 95 }, { d: "Mar 6", pnl: 180 },
  { d: "Mar 7", pnl: -30 }, { d: "Mar 8", pnl: 73.5 }, { d: "Mar 9", pnl: -80 },
  { d: "Mar 10", pnl: 170 }, { d: "Mar 11", pnl: 140 },
];

const PSYCH_DATA = [
  { emotion: "Lucido", wins: 8, losses: 1 },
  { emotion: "FOMO", wins: 1, losses: 6 },
  { emotion: "In Zona", wins: 5, losses: 0 },
  { emotion: "Fiducioso", wins: 4, losses: 2 },
  { emotion: "Ansioso", wins: 1, losses: 4 },
];

export default function TradingMindOS() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [trades, setTrades] = useState(initialTrades);
  const [showModal, setShowModal] = useState(false);
  const [time, setTime] = useState(new Date());
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split("T")[0],
    symbol: "", direction: "LONG", entry: "", exit: "", size: "",
    emotionBefore: "🧠 Lucido", emotionDuring: "🧠 Lucido", emotionAfter: "🧠 Lucido",
    notes: "", setup: "", screenshot: null
  });

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const totalPnL = trades.reduce((s, t) => s + t.pnl, 0);
  const winTrades = trades.filter(t => t.pnl > 0);
  const winRate = Math.round((winTrades.length / trades.length) * 100);
  const avgWin = winTrades.length ? Math.round(winTrades.reduce((s, t) => s + t.pnl, 0) / winTrades.length) : 0;
  const lossTrades = trades.filter(t => t.pnl < 0);
  const avgLoss = lossTrades.length ? Math.round(Math.abs(lossTrades.reduce((s, t) => s + t.pnl, 0)) / lossTrades.length) : 0;
  const rr = avgLoss ? (avgWin / avgLoss).toFixed(2) : "∞";

  const cumPnL = [];
  let running = 0;
  CHART_DATA.forEach(d => { running += d.pnl; cumPnL.push({ ...d, cum: running }); });
  const maxCum = Math.max(...cumPnL.map(d => d.cum));
  const minCum = Math.min(...cumPnL.map(d => d.cum));
  const range = maxCum - minCum || 1;

  const handleAddTrade = () => {
    const t = { ...newTrade, id: Date.now(), entry: +newTrade.entry, exit: +newTrade.exit, size: +newTrade.size };
    const pipVal = (t.exit - t.entry) * t.size * (t.direction === "LONG" ? 1 : -1);
    t.pnl = Math.round(pipVal * 100) / 100;
    setTrades([...trades, t]);
    setShowModal(false);
    setNewTrade({ date: new Date().toISOString().split("T")[0], symbol: "", direction: "LONG", entry: "", exit: "", size: "", emotionBefore: "🧠 Lucido", emotionDuring: "🧠 Lucido", emotionAfter: "🧠 Lucido", notes: "", setup: "", screenshot: null });
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "⬡" },
    { id: "journal", label: "Journal", icon: "◈" },
    { id: "psychology", label: "Psicologia", icon: "◉" },
    { id: "stats", label: "Statistiche", icon: "◫" },
  ];

  return (
    <div style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace", background: "#060a0f", minHeight: "100vh", color: "#c9d1d9" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0d1117; } ::-webkit-scrollbar-thumb { background: #1e3a2f; border-radius: 2px; }
        .card { background: #0d1117; border: 1px solid #1a2332; border-radius: 4px; }
        .accent { color: #00ff88; }
        .accent-red { color: #ff4466; }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 11px; letter-spacing: 2px; padding: 8px 16px; color: #556068; transition: all 0.2s; text-transform: uppercase; }
        .tab-btn:hover { color: #00ff88; }
        .tab-btn.active { color: #00ff88; border-bottom: 1px solid #00ff88; }
        .stat-card { background: #0d1117; border: 1px solid #1a2332; border-radius: 4px; padding: 20px; position: relative; overflow: hidden; }
        .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #00ff88, transparent); }
        .btn-primary { background: transparent; border: 1px solid #00ff88; color: #00ff88; font-family: inherit; font-size: 11px; letter-spacing: 2px; padding: 8px 20px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; border-radius: 2px; }
        .btn-primary:hover { background: #00ff8822; }
        .trade-row { border-bottom: 1px solid #0f1923; transition: background 0.15s; }
        .trade-row:hover { background: #0f1923; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(4px); }
        .modal { background: #0d1117; border: 1px solid #1a2332; border-radius: 4px; padding: 32px; width: 600px; max-height: 85vh; overflow-y: auto; }
        .input { background: #060a0f; border: 1px solid #1a2332; color: #c9d1d9; font-family: inherit; font-size: 12px; padding: 8px 12px; border-radius: 2px; width: 100%; outline: none; transition: border 0.2s; }
        .input:focus { border-color: #00ff8844; }
        .select { background: #060a0f; border: 1px solid #1a2332; color: #c9d1d9; font-family: inherit; font-size: 12px; padding: 8px 12px; border-radius: 2px; outline: none; }
        .label { font-size: 10px; letter-spacing: 2px; color: #556068; text-transform: uppercase; margin-bottom: 6px; display: block; }
        .psych-bar { height: 6px; background: #1a2332; border-radius: 3px; overflow: hidden; margin-top: 6px; }
        .psych-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 768px) { .grid-4 { grid-template-columns: 1fr 1fr; } .grid-3 { grid-template-columns: 1fr 1fr; } }
        .tag { display: inline-block; background: #0f1923; border: 1px solid #1a2332; border-radius: 2px; padding: 2px 8px; font-size: 10px; color: #556068; }
        .ticker { display: flex; gap: 32px; overflow-x: auto; padding: 8px 0; }
        .ticker-item { display: flex; flex-direction: column; align-items: center; white-space: nowrap; }
        .glow { text-shadow: 0 0 20px #00ff8844; }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: "1px solid #1a2332", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 4, color: "#00ff88" }} className="glow">TRADING MIND OS</span>
          <span style={{ fontSize: 10, color: "#1e3a2f", letterSpacing: 2 }}>v1.0</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 500, letterSpacing: 2, color: totalPnL >= 0 ? "#00ff88" : "#ff4466" }}>
              {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(2)} $
            </div>
            <div style={{ fontSize: 9, color: "#556068", letterSpacing: 1 }}>P&L TOTALE</div>
          </div>
          <div style={{ fontSize: 11, color: "#556068", fontWeight: 300 }}>
            {time.toLocaleTimeString("it-IT")}
          </div>
        </div>
      </header>

      {/* Ticker */}
      <div style={{ borderBottom: "1px solid #0f1923", padding: "6px 24px", background: "#080d12" }}>
        <div className="ticker">
          {[["EUR/USD","1.0891","+0.23%",true],["GOLD","2198.40","+0.54%",true],["BTC","82,900","-1.12%",false],["NAS100","19,780","+0.87%",true],["OIL","82.14","-0.34%",false]].map(([sym, price, chg, up]) => (
            <div key={sym} className="ticker-item">
              <span style={{ fontSize: 9, color: "#556068", letterSpacing: 1 }}>{sym}</span>
              <span style={{ fontSize: 12, color: up ? "#00ff88" : "#ff4466" }}>{price}</span>
              <span style={{ fontSize: 9, color: up ? "#00ff8888" : "#ff446688" }}>{chg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ borderBottom: "1px solid #1a2332", padding: "0 24px", display: "flex", gap: 4 }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
            <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: 24 }}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* KPI */}
            <div className="grid-4">
              {[
                { label: "Win Rate", value: `${winRate}%`, sub: `${winTrades.length}W / ${lossTrades.length}L`, up: winRate >= 50 },
                { label: "Profit Factor", value: rr, sub: "avg win / avg loss", up: +rr >= 1.5 },
                { label: "Avg Win", value: `+${avgWin}$`, sub: "per trade vincente", up: true },
                { label: "Avg Loss", value: `-${avgLoss}$`, sub: "per trade perdente", up: false },
              ].map(k => (
                <div key={k.label} className="stat-card">
                  <div style={{ fontSize: 9, color: "#556068", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{k.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 600, color: k.up ? "#00ff88" : "#ff4466", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3 }}>{k.value}</div>
                  <div style={{ fontSize: 10, color: "#556068", marginTop: 4 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Chart + Recent Trades */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
              {/* Equity Curve */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 9, color: "#556068", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>◈ Equity Curve — Marzo 2025</div>
                <svg viewBox="0 0 460 120" style={{ width: "100%", height: 120 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ff88" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[0,30,60,90,120].map(y => <line key={y} x1="0" y1={y} x2="460" y2={y} stroke="#1a2332" strokeWidth="0.5" />)}
                  {/* Area fill */}
                  <polygon
                    points={cumPnL.map((d, i) => `${i * (460 / (cumPnL.length - 1))},${110 - ((d.cum - minCum) / range) * 100}`).join(" ") + ` 460,110 0,110`}
                    fill="url(#grad)"
                  />
                  {/* Line */}
                  <polyline
                    points={cumPnL.map((d, i) => `${i * (460 / (cumPnL.length - 1))},${110 - ((d.cum - minCum) / range) * 100}`).join(" ")}
                    fill="none" stroke="#00ff88" strokeWidth="1.5" strokeLinejoin="round"
                  />
                  {/* Dots */}
                  {cumPnL.map((d, i) => (
                    <circle key={i} cx={i * (460 / (cumPnL.length - 1))} cy={110 - ((d.cum - minCum) / range) * 100} r="3" fill="#00ff88" />
                  ))}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  {cumPnL.filter((_, i) => i % 3 === 0).map(d => (
                    <span key={d.d} style={{ fontSize: 9, color: "#556068" }}>{d.d}</span>
                  ))}
                </div>
              </div>

              {/* Mindset Score */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ fontSize: 9, color: "#556068", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>◉ Mindset Score</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {PSYCH_DATA.map(p => {
                    const total = p.wins + p.losses;
                    const pct = Math.round((p.wins / total) * 100);
                    return (
                      <div key={p.emotion}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11 }}>{p.emotion}</span>
                          <span style={{ fontSize: 11, color: pct >= 60 ? "#00ff88" : "#ff4466" }}>{pct}%</span>
                        </div>
                        <div className="psych-bar">
                          <div className="psych-bar-fill" style={{ width: `${pct}%`, background: pct >= 60 ? "linear-gradient(90deg, #00ff88, #00cc66)" : "linear-gradient(90deg, #ff4466, #cc3355)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 9, color: "#556068", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>◫ Ultimi Trade</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a2332" }}>
                    {["DATA", "SIMBOLO", "DIR", "ENTRY", "EXIT", "P&L", "STATO MENTALE", "SETUP"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 9, color: "#556068", letterSpacing: 1, fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(-5).reverse().map(t => (
                    <tr key={t.id} className="trade-row">
                      <td style={{ padding: "10px 8px", color: "#556068", fontSize: 11 }}>{t.date}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: "#c9d1d9" }}>{t.symbol}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <span style={{ color: t.direction === "LONG" ? "#00ff88" : "#ff4466", fontSize: 10, letterSpacing: 1 }}>{t.direction}</span>
                      </td>
                      <td style={{ padding: "10px 8px", color: "#8b949e" }}>{t.entry}</td>
                      <td style={{ padding: "10px 8px", color: "#8b949e" }}>{t.exit}</td>
                      <td style={{ padding: "10px 8px", color: t.pnl >= 0 ? "#00ff88" : "#ff4466", fontWeight: 600 }}>{t.pnl >= 0 ? "+" : ""}{t.pnl}$</td>
                      <td style={{ padding: "10px 8px", fontSize: 11 }}>{t.emotionBefore}</td>
                      <td style={{ padding: "10px 8px" }}><span className="tag">{t.setup}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* JOURNAL */}
        {activeTab === "journal" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 4, color: "#c9d1d9" }}>TRADE JOURNAL</h2>
                <p style={{ fontSize: 10, color: "#556068", letterSpacing: 1 }}>{trades.length} TRADE REGISTRATI</p>
              </div>
              <button className="btn-primary" onClick={() => setShowModal(true)}>+ NUOVO TRADE</button>
            </div>

            {trades.slice().reverse().map(t => (
              <div key={t.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div>
                      <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3, color: "#c9d1d9" }}>{t.symbol}</span>
                      <span style={{ marginLeft: 8, fontSize: 10, color: t.direction === "LONG" ? "#00ff88" : "#ff4466", letterSpacing: 2 }}>{t.direction}</span>
                    </div>
                    <span className="tag">{t.setup}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 600, color: t.pnl >= 0 ? "#00ff88" : "#ff4466", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>{t.pnl >= 0 ? "+" : ""}{t.pnl}$</div>
                    <div style={{ fontSize: 9, color: "#556068" }}>{t.date}</div>
                  </div>
                </div>
                <div className="grid-3" style={{ marginBottom: 12 }}>
                  <div><span className="label">Entry</span><span style={{ fontSize: 13 }}>{t.entry}</span></div>
                  <div><span className="label">Exit</span><span style={{ fontSize: 13 }}>{t.exit}</span></div>
                  <div><span className="label">Size</span><span style={{ fontSize: 13 }}>{t.size}</span></div>
                </div>
                <div style={{ borderTop: "1px solid #0f1923", paddingTop: 12, display: "flex", gap: 24, marginBottom: 12 }}>
                  <div><span className="label">Prima</span><span style={{ fontSize: 13 }}>{t.emotionBefore}</span></div>
                  <div><span className="label">Durante</span><span style={{ fontSize: 13 }}>{t.emotionDuring}</span></div>
                  <div><span className="label">Dopo</span><span style={{ fontSize: 13 }}>{t.emotionAfter}</span></div>
                </div>
                {t.notes && (
                  <div style={{ background: "#060a0f", border: "1px solid #1a2332", borderLeft: "2px solid #00ff8844", padding: "10px 14px", borderRadius: 2 }}>
                    <span style={{ fontSize: 10, color: "#556068", letterSpacing: 1 }}>NOTE — </span>
                    <span style={{ fontSize: 12, color: "#8b949e" }}>{t.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PSYCHOLOGY */}
        {activeTab === "psychology" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 4, color: "#c9d1d9" }}>ANALISI PSICOLOGICA</h2>

            <div className="grid-2">
              {/* Win rate per emozione */}
              <div className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 9, color: "#556068", letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>◉ Win Rate per Stato Emotivo</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {PSYCH_DATA.map(p => {
                    const total = p.wins + p.losses;
                    const pct = Math.round((p.wins / total) * 100);
                    return (
                      <div key={p.emotion}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13 }}>{p.emotion}</span>
                          <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#556068" }}>
                            <span style={{ color: "#00ff88" }}>{p.wins}W</span>
                            <span style={{ color: "#ff4466" }}>{p.losses}L</span>
                            <span style={{ color: pct >= 60 ? "#00ff88" : "#ff4466", fontWeight: 600 }}>{pct}%</span>
                          </div>
                        </div>
                        <div className="psych-bar">
                          <div className="psych-bar-fill" style={{ width: `${pct}%`, background: pct >= 60 ? "linear-gradient(90deg, #00ff88, #00cc66)" : pct >= 40 ? "linear-gradient(90deg, #ffaa00, #ff8800)" : "linear-gradient(90deg, #ff4466, #cc3355)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Insights */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 9, color: "#556068", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>◈ Insight Chiave</div>
                  {[
                    { icon: "🎯", title: "Zona Migliore", text: "Quando sei Lucido o In Zona, il tuo win rate supera l'88%. Proteggi questi stati.", color: "#00ff88" },
                    { icon: "⚠️", title: "Zona Rischio", text: "Il FOMO ti costa: solo 14% di win rate. Evita di tradare quando lo senti.", color: "#ff4466" },
                    { icon: "💡", title: "Pattern", text: "I tuoi migliori trade arrivano dopo un trade vincente. Capitalizza il momentum.", color: "#ffaa00" },
                  ].map(ins => (
                    <div key={ins.title} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: `2px solid ${ins.color}44` }}>
                      <div style={{ fontSize: 12, color: ins.color, fontWeight: 600, marginBottom: 4 }}>{ins.icon} {ins.title}</div>
                      <div style={{ fontSize: 11, color: "#8b949e", lineHeight: 1.6 }}>{ins.text}</div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 9, color: "#556068", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>◫ Distribuzione Emotiva</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {trades.flatMap(t => [t.emotionBefore, t.emotionDuring, t.emotionAfter])
                      .reduce((acc, e) => { acc[e] = (acc[e] || 0) + 1; return acc; }, {})
                      && Object.entries(trades.flatMap(t => [t.emotionBefore, t.emotionDuring, t.emotionAfter])
                        .reduce((acc, e) => { acc[e] = (acc[e] || 0) + 1; return acc; }, {}))
                        .sort((a, b) => b[1] - a[1])
                        .map(([em, count]) => (
                          <div key={em} style={{ background: "#0f1923", border: "1px solid #1a2332", padding: "6px 12px", borderRadius: 2, fontSize: 11 }}>
                            {em} <span style={{ color: "#00ff88", marginLeft: 4 }}>{count}</span>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Reflection */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 9, color: "#556068", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>◉ Riflessione Giornaliera</div>
              <div className="grid-3">
                {[
                  { q: "Cosa ha funzionato oggi?", placeholder: "Es: Ho rispettato il mio piano di trading..." },
                  { q: "Cosa non ha funzionato?", placeholder: "Es: Ho tagliato i profitti troppo presto..." },
                  { q: "Cosa farò diversamente domani?", placeholder: "Es: Aspetterò la conferma prima di entrare..." },
                ].map(item => (
                  <div key={item.q}>
                    <label className="label">{item.q}</label>
                    <textarea className="input" placeholder={item.placeholder} style={{ height: 100, resize: "vertical", lineHeight: 1.6 }} />
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ marginTop: 16 }}>SALVA RIFLESSIONE</button>
            </div>
          </div>
        )}

        {/* STATS */}
        {activeTab === "stats" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 4, color: "#c9d1d9" }}>STATISTICHE</h2>

            <div className="grid-4">
              {[
                { label: "Trade Totali", value: trades.length, unit: "", up: null },
                { label: "Win Rate", value: winRate, unit: "%", up: winRate >= 50 },
                { label: "P&L Totale", value: totalPnL.toFixed(0), unit: "$", up: totalPnL >= 0 },
                { label: "Profit Factor", value: rr, unit: "x", up: +rr >= 1.5 },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize: 9, color: "#556068", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 32, fontWeight: 600, color: s.up === null ? "#c9d1d9" : s.up ? "#00ff88" : "#ff4466", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 3 }}>
                    {s.up === true && "+"}{s.value}{s.unit}
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown per simbolo */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 9, color: "#556068", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>◫ Performance per Simbolo</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a2332" }}>
                    {["SIMBOLO", "TRADE", "WIN", "LOSS", "WIN RATE", "P&L"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "6px 8px", fontSize: 9, color: "#556068", letterSpacing: 1, fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(trades.reduce((acc, t) => {
                    if (!acc[t.symbol]) acc[t.symbol] = { trades: 0, wins: 0, losses: 0, pnl: 0 };
                    acc[t.symbol].trades++;
                    if (t.pnl > 0) acc[t.symbol].wins++; else acc[t.symbol].losses++;
                    acc[t.symbol].pnl += t.pnl;
                    return acc;
                  }, {})).map(([sym, data]) => (
                    <tr key={sym} className="trade-row">
                      <td style={{ padding: "10px 8px", fontWeight: 600 }}>{sym}</td>
                      <td style={{ padding: "10px 8px", color: "#556068" }}>{data.trades}</td>
                      <td style={{ padding: "10px 8px", color: "#00ff88" }}>{data.wins}</td>
                      <td style={{ padding: "10px 8px", color: "#ff4466" }}>{data.losses}</td>
                      <td style={{ padding: "10px 8px", color: Math.round(data.wins / data.trades * 100) >= 50 ? "#00ff88" : "#ff4466" }}>
                        {Math.round(data.wins / data.trades * 100)}%
                      </td>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: data.pnl >= 0 ? "#00ff88" : "#ff4466" }}>
                        {data.pnl >= 0 ? "+" : ""}{data.pnl.toFixed(2)}$
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* P&L per giorno */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 9, color: "#556068", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>◈ P&L Giornaliero</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
                {CHART_DATA.map((d, i) => {
                  const maxAbs = Math.max(...CHART_DATA.map(x => Math.abs(x.pnl)));
                  const h = Math.round((Math.abs(d.pnl) / maxAbs) * 80);
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", height: h, background: d.pnl >= 0 ? "#00ff8833" : "#ff446633", border: `1px solid ${d.pnl >= 0 ? "#00ff88" : "#ff4466"}`, borderRadius: 2 }} />
                      <span style={{ fontSize: 8, color: "#556068", transform: "rotate(-45deg)", transformOrigin: "center" }}>{d.d.split(" ")[1]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal Nuovo Trade */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 4 }}>NUOVO TRADE</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#556068", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="grid-2">
                <div>
                  <label className="label">Simbolo</label>
                  <input className="input" placeholder="EUR/USD" value={newTrade.symbol} onChange={e => setNewTrade({ ...newTrade, symbol: e.target.value })} />
                </div>
                <div>
                  <label className="label">Data</label>
                  <input className="input" type="date" value={newTrade.date} onChange={e => setNewTrade({ ...newTrade, date: e.target.value })} />
                </div>
              </div>

              <div className="grid-3">
                <div>
                  <label className="label">Direzione</label>
                  <select className="select" style={{ width: "100%" }} value={newTrade.direction} onChange={e => setNewTrade({ ...newTrade, direction: e.target.value })}>
                    <option>LONG</option><option>SHORT</option>
                  </select>
                </div>
                <div>
                  <label className="label">Entry</label>
                  <input className="input" type="number" placeholder="0.00" value={newTrade.entry} onChange={e => setNewTrade({ ...newTrade, entry: e.target.value })} />
                </div>
                <div>
                  <label className="label">Exit</label>
                  <input className="input" type="number" placeholder="0.00" value={newTrade.exit} onChange={e => setNewTrade({ ...newTrade, exit: e.target.value })} />
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <label className="label">Size (lotti)</label>
                  <input className="input" type="number" placeholder="1.0" value={newTrade.size} onChange={e => setNewTrade({ ...newTrade, size: e.target.value })} />
                </div>
                <div>
                  <label className="label">Setup</label>
                  <input className="input" placeholder="Es: Breakout + Retest" value={newTrade.setup} onChange={e => setNewTrade({ ...newTrade, setup: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label">Stato Emotivo — Prima / Durante / Dopo</label>
                <div className="grid-3">
                  {["emotionBefore", "emotionDuring", "emotionAfter"].map(field => (
                    <select key={field} className="select" style={{ width: "100%" }} value={newTrade[field]} onChange={e => setNewTrade({ ...newTrade, [field]: e.target.value })}>
                      {EMOTIONS.map(em => <option key={em}>{em}</option>)}
                    </select>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Note</label>
                <textarea className="input" placeholder="Descrivi il tuo processo decisionale..." value={newTrade.notes} onChange={e => setNewTrade({ ...newTrade, notes: e.target.value })} style={{ height: 80, resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                <button className="btn-primary" style={{ borderColor: "#556068", color: "#556068" }} onClick={() => setShowModal(false)}>ANNULLA</button>
                <button className="btn-primary" onClick={handleAddTrade} disabled={!newTrade.symbol || !newTrade.entry || !newTrade.exit}>SALVA TRADE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
