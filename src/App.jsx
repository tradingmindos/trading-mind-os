import { useState, useEffect } from "react";
import { supabase } from "./supabase";

// ─── DATI ───────────────────────────────────────────────────────────────────
const EMOTIONS = ["😤 FOMO", "😰 Paura", "🧠 Lucido", "😤 Vendetta", "😴 Stanco", "💪 Fiducioso", "😬 Ansioso", "🎯 In Zona"];

const PLANS = {
  free:  { name: "FREE",  color: "#556068", monthly: 0,   annual: 0,    trades: 10,  badge: null,        features: ["10 trade/mese", "Dashboard base", "Statistiche base", "Nessun report"] },
  beta:  { name: "BETA",  color: "#00aaff", monthly: 7,   annual: 59,   trades: 50,  badge: "POPOLARE",  features: ["50 trade/mese", "Analisi psicologica base", "1 report macro omaggio", "Accesso beta features"] },
  mid:   { name: "MID",   color: "#00ff88", monthly: 27,  annual: 227,  trades: 999, badge: null,        features: ["Trade illimitati", "Analisi psicologica avanzata", "Statistiche avanzate", "Report macro mensile"] },
  pro:   { name: "PRO",   color: "#ff9900", monthly: 97,  annual: 797,  trades: 999, badge: "ESCLUSIVO", features: ["Tutto del Mid", "Report macro premium illimitati", "Accesso anticipato nuove feature", "Coaching umano 1:1 personalizzato", "Max 20 posti disponibili"] },
};

const CHART_DATA = [
  { d: "Mar 1", pnl: 120 }, { d: "Mar 2", pnl: -45 }, { d: "Mar 3", pnl: 210 },
  { d: "Mar 4", pnl: -80 }, { d: "Mar 5", pnl: 95 },  { d: "Mar 6", pnl: 180 },
  { d: "Mar 7", pnl: -30 }, { d: "Mar 8", pnl: 73.5 },{ d: "Mar 9", pnl: -80 },
  { d: "Mar 10", pnl: 170 },{ d: "Mar 11", pnl: 140 },
];

const PSYCH_DATA = [
  { emotion: "Lucido", wins: 8, losses: 1 },
  { emotion: "FOMO", wins: 1, losses: 6 },
  { emotion: "In Zona", wins: 5, losses: 0 },
  { emotion: "Fiducioso", wins: 4, losses: 2 },
  { emotion: "Ansioso", wins: 1, losses: 4 },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Bebas+Neue&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060a0f; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0d1117; }
  ::-webkit-scrollbar-thumb { background: #1e3a2f; border-radius: 2px; }
  .card { background: #0d1117; border: 1px solid #1a2332; border-radius: 4px; }
  .tab-btn { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 11px; letter-spacing: 2px; padding: 8px 16px; color: #556068; transition: all 0.2s; text-transform: uppercase; border-bottom: 1px solid transparent; }
  .tab-btn:hover { color: #00ff88; }
  .tab-btn.active { color: #00ff88; border-bottom: 1px solid #00ff88; }
  .btn-primary { background: transparent; border: 1px solid #00ff88; color: #00ff88; font-family: inherit; font-size: 11px; letter-spacing: 2px; padding: 8px 20px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; border-radius: 2px; }
  .btn-primary:hover { background: #00ff8822; }
  .btn-solid { background: #00ff88; border: 1px solid #00ff88; color: #060a0f; font-family: inherit; font-size: 11px; letter-spacing: 2px; padding: 10px 24px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; border-radius: 2px; font-weight: 700; }
  .btn-solid:hover { background: #00cc66; }
  .trade-row { border-bottom: 1px solid #0f1923; transition: background 0.15s; }
  .trade-row:hover { background: #0f1923; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(6px); }
  .modal { background: #0d1117; border: 1px solid #1a2332; border-radius: 4px; padding: 32px; width: 600px; max-height: 88vh; overflow-y: auto; }
  .input { background: #060a0f; border: 1px solid #1a2332; color: #c9d1d9; font-family: inherit; font-size: 12px; padding: 8px 12px; border-radius: 2px; width: 100%; outline: none; transition: border 0.2s; }
  .input:focus { border-color: #00ff8844; }
  .select { background: #060a0f; border: 1px solid #1a2332; color: #c9d1d9; font-family: inherit; font-size: 12px; padding: 8px 12px; border-radius: 2px; outline: none; }
  .label { font-size: 10px; letter-spacing: 2px; color: #556068; text-transform: uppercase; margin-bottom: 6px; display: block; }
  .psych-bar { height: 6px; background: #1a2332; border-radius: 3px; overflow: hidden; margin-top: 6px; }
  .psych-bar-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
  .tag { display: inline-block; background: #0f1923; border: 1px solid #1a2332; border-radius: 2px; padding: 2px 8px; font-size: 10px; color: #556068; }
  .ticker { display: flex; gap: 32px; overflow-x: auto; padding: 8px 0; }
  .ticker-item { display: flex; flex-direction: column; align-items: center; white-space: nowrap; }
  .glow { text-shadow: 0 0 20px #00ff8844; }
  .stat-card { background: #0d1117; border: 1px solid #1a2332; border-radius: 4px; padding: 20px; position: relative; overflow: hidden; }
  .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#00ff88,transparent); }
  .plan-card { background: #0d1117; border: 1px solid #1a2332; border-radius: 4px; padding: 28px; position: relative; transition: all 0.3s; }
  .plan-card:hover { transform: translateY(-4px); }
  .billing-toggle { display: flex; background: #0d1117; border: 1px solid #1a2332; border-radius: 2px; overflow: hidden; }
  .billing-btn { background: none; border: none; color: #556068; font-family: inherit; font-size: 11px; letter-spacing: 1px; padding: 6px 16px; cursor: pointer; transition: all 0.2s; }
  .billing-btn.active { background: #00ff8822; color: #00ff88; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .fade-in { animation: fadeIn 0.4s ease; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .pulse { animation: pulse 2s infinite; }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .spin { animation: spin 1s linear infinite; }
`;

// ─── LOGIN ───────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onGoToPricing }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Inserisci email e password."); return; }
    if (mode === "register" && !name) { setError("Inserisci il tuo nome."); return; }
    setLoading(true);

    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name, plan: "free" } }
        });
        if (error) throw error;
        onLogin({ name, email, plan: "free", id: data.user?.id });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const userData = data.user?.user_metadata;
        onLogin({ name: userData?.name || email.split("@")[0], email, plan: userData?.plan || "free", id: data.user?.id });
      }
    } catch (err) {
      setError(err.message === "Invalid login credentials" ? "Email o password errati." : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#060a0f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'IBM Plex Mono',monospace" }}>
      <style>{CSS}</style>
      <div style={{ marginBottom:40, textAlign:"center" }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:6, color:"#00ff88" }} className="glow">TRADING MIND OS</div>
        <div style={{ fontSize:11, color:"#556068", letterSpacing:3, marginTop:4 }}>IL TUO SISTEMA MENTALE PER IL TRADING</div>
      </div>
      <div className="card" style={{ width:"100%", maxWidth:420, padding:36 }}>
        <div style={{ display:"flex", marginBottom:28, borderBottom:"1px solid #1a2332" }}>
          {["login","register"].map(m => (
            <button key={m} className={`tab-btn ${mode===m?"active":""}`} onClick={() => { setMode(m); setError(""); }} style={{ flex:1, textAlign:"center" }}>
              {m==="login"?"ACCEDI":"REGISTRATI"}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {mode==="register" && (
            <div><label className="label">Nome</label><input className="input" placeholder="Es. Nicolo" value={name} onChange={e=>setName(e.target.value)} /></div>
          )}
          <div><label className="label">Email</label><input className="input" type="email" placeholder="tua@email.com" value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div><label className="label">Password</label><input className="input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} /></div>
          {error && <div style={{ fontSize:11, color:"#ff4466", letterSpacing:1, lineHeight:1.5 }}>{error}</div>}
          <button className="btn-solid" onClick={handleSubmit} style={{ marginTop:8, width:"100%", padding:12, fontSize:12 }} disabled={loading}>
            {loading ? <span className="pulse">CARICAMENTO...</span> : mode==="login" ? "ACCEDI →" : "CREA ACCOUNT →"}
          </button>
          <div style={{ textAlign:"center", marginTop:8 }}>
            <button onClick={onGoToPricing} style={{ background:"none", border:"none", color:"#556068", fontSize:11, cursor:"pointer", letterSpacing:1, textDecoration:"underline" }}>
              Scopri i piani e i prezzi
            </button>
          </div>
        </div>
      </div>
      <div style={{ marginTop:24, fontSize:10, color:"#2a3444", letterSpacing:1 }}>© 2025 Trading Mind OS</div>
    </div>
  );
}

// ─── PRICING ─────────────────────────────────────────────────────────────────
function PricingPage({ onBack, onSelectPlan, currentPlan }) {
  const [billing, setBilling] = useState("monthly");

  return (
    <div style={{ minHeight:"100vh", background:"#060a0f", padding:"40px 24px", fontFamily:"'IBM Plex Mono',monospace" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"#556068", cursor:"pointer", fontSize:11, letterSpacing:2, marginBottom:24, display:"block", margin:"0 auto 24px" }}>← TORNA INDIETRO</button>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:42, letterSpacing:6, color:"#c9d1d9" }}>SCEGLI IL TUO PIANO</div>
          <div style={{ fontSize:12, color:"#556068", letterSpacing:2, marginTop:8 }}>Inizia gratis. Scala quando sei pronto.</div>
          <div style={{ display:"flex", justifyContent:"center", marginTop:24 }}>
            <div className="billing-toggle">
              <button className={`billing-btn ${billing==="monthly"?"active":""}`} onClick={()=>setBilling("monthly")}>MENSILE</button>
              <button className={`billing-btn ${billing==="annual"?"active":""}`} onClick={()=>setBilling("annual")}>ANNUALE <span style={{ color:"#00ff88", marginLeft:4 }}>-30%</span></button>
            </div>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:48 }}>
          {Object.entries(PLANS).map(([key, plan]) => {
            const price = billing==="monthly" ? plan.monthly : plan.annual;
            const isCurrent = currentPlan===key;
            return (
              <div key={key} className="plan-card" style={{ borderColor: isCurrent ? plan.color+"88" : key==="beta" ? "#00ff8833" : "#1a2332" }}>
                {plan.badge && <div style={{ position:"absolute", top:-1, right:16, background:plan.color, color:"#060a0f", fontSize:9, letterSpacing:2, padding:"3px 10px", fontWeight:700 }}>{plan.badge}</div>}
                {isCurrent && <div style={{ position:"absolute", top:-1, left:16, background:"#1a2332", color:"#556068", fontSize:9, letterSpacing:2, padding:"3px 10px" }}>ATTIVO</div>}
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:4, color:plan.color }}>{plan.name}</div>
                  <div style={{ marginTop:12 }}>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:40, color:"#c9d1d9", letterSpacing:2 }}>{price===0?"GRATIS":`${price}€`}</span>
                    {price>0 && <span style={{ fontSize:10, color:"#556068", marginLeft:4 }}>/{billing==="monthly"?"mese":"anno"}</span>}
                  </div>
                  {billing==="annual" && price>0 && <div style={{ fontSize:10, color:"#00ff88", marginTop:4 }}>≈ {Math.round(price/12)}€/mese</div>}
                </div>
                <div style={{ borderTop:"1px solid #1a2332", paddingTop:16, marginBottom:20 }}>
                  {plan.features.map((f,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", marginBottom:10, fontSize:11, color:"#8b949e", lineHeight:1.5 }}>
                      <span style={{ color:"#00ff88", marginRight:8 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button onClick={()=>onSelectPlan(key)} disabled={isCurrent}
                  style={{ width:"100%", padding:10, fontFamily:"'IBM Plex Mono',monospace", fontSize:11, letterSpacing:2, cursor:isCurrent?"default":"pointer", borderRadius:2,
                    border:`1px solid ${plan.color}`, background:isCurrent?plan.color+"22":key==="pro"?plan.color:"transparent",
                    color:key==="pro"?"#060a0f":plan.color, fontWeight:key==="pro"?700:400, transition:"all 0.2s" }}>
                  {isCurrent ? "PIANO ATTIVO" : price===0 ? "INIZIA GRATIS" : "SCEGLI →"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ padding:24, textAlign:"center", borderColor:"#ff990022", marginBottom:32 }}>
          <div style={{ fontSize:11, color:"#ff9900", letterSpacing:2, marginBottom:8 }}>⚠ PIANO PRO — POSTI LIMITATI</div>
          <div style={{ fontSize:12, color:"#8b949e", lineHeight:1.8 }}>
            Il piano PRO include coaching umano personalizzato 1:1.<br/>
            I posti sono <strong style={{ color:"#ff9900" }}>limitati a 20 persone</strong>.
          </div>
        </div>

        <div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:4, color:"#c9d1d9", textAlign:"center", marginBottom:24 }}>DOMANDE FREQUENTI</div>
          <div className="grid-2" style={{ gap:16 }}>
            {[
              { q:"Posso cambiare piano in qualsiasi momento?", a:"Sì, puoi fare upgrade o downgrade quando vuoi. Il cambio è immediato." },
              { q:"Come funziona il coaching PRO?", a:"Sessioni 1:1 con Nicolo via videocall. Lavoriamo sulla tua psicologia specifica." },
              { q:"I report macro sono inclusi nel piano MID?", a:"Il piano MID include 1 report mensile. Il PRO include tutti i report senza limiti." },
              { q:"Posso cancellare quando voglio?", a:"Sì, nessun vincolo. Puoi cancellare l'abbonamento in qualsiasi momento." },
            ].map((faq,i) => (
              <div key={i} className="card" style={{ padding:20 }}>
                <div style={{ fontSize:12, color:"#00ff88", marginBottom:8 }}>{faq.q}</div>
                <div style={{ fontSize:11, color:"#556068", lineHeight:1.7 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function TradingMindOS() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [trades, setTrades] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [time, setTime] = useState(new Date());
  const [newTrade, setNewTrade] = useState({ date:new Date().toISOString().split("T")[0], symbol:"", direction:"LONG", entry:"", exit:"", size:"", emotionBefore:"🧠 Lucido", emotionDuring:"🧠 Lucido", emotionAfter:"🧠 Lucido", notes:"", setup:"" });
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newReport, setNewReport] = useState({ title:"", week:"", content:"", min_plan:"mid" });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [reportImages, setReportImages] = useState([]);
  const ADMIN_EMAIL = "nicocabrelli@gmail.com";

  useEffect(() => {
    const t = setInterval(()=>setTime(new Date()),1000);
    return ()=>clearInterval(t);
  }, []);

  // Controlla se utente già loggato
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setUser({ name: meta?.name || session.user.email.split("@")[0], email: session.user.email, plan: meta?.plan || "free", id: session.user.id });
        loadTrades(session.user.id);
        setScreen("app");
      } else {
        setScreen("login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) { setUser(null); setScreen("login"); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadTrades = async (userId) => {
    const { data } = await supabase.from("trades").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setTrades(data);
  };

  const loadReports = async () => {
    const { data } = await supabase.from("reports").select("*").eq("published", true).order("created_at", { ascending: false });
    if (data) setReports(data);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    loadTrades(userData.id);
    loadReports();
    setScreen("app");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTrades([]);
    setScreen("login");
  };

  const handleSelectPlan = (planKey) => {
    if (planKey==="free") { setScreen("app"); return; }
    alert(`Reindirizzamento a Stripe per il piano ${planKey.toUpperCase()}...\n(Integrazione Stripe in arrivo!)`);
  };

  const plan = PLANS[user?.plan||"free"];
  const tradeLimit = plan?.trades||10;
  const canAddTrade = trades.length < tradeLimit;

  const totalPnL = trades.reduce((s,t)=>s+(t.pnl||0),0);
  const winTrades = trades.filter(t=>(t.pnl||0)>0);
  const winRate = trades.length ? Math.round((winTrades.length/trades.length)*100) : 0;
  const avgWin = winTrades.length ? Math.round(winTrades.reduce((s,t)=>s+(t.pnl||0),0)/winTrades.length) : 0;
  const lossTrades = trades.filter(t=>(t.pnl||0)<0);
  const avgLoss = lossTrades.length ? Math.round(Math.abs(lossTrades.reduce((s,t)=>s+(t.pnl||0),0))/lossTrades.length) : 0;
  const rr = avgLoss ? (avgWin/avgLoss).toFixed(2) : "∞";

  const cumPnL = []; let running=0;
  CHART_DATA.forEach(d=>{ running+=d.pnl; cumPnL.push({...d,cum:running}); });
  const maxCum=Math.max(...cumPnL.map(d=>d.cum)), minCum=Math.min(...cumPnL.map(d=>d.cum)), range=maxCum-minCum||1;

  const handleAddTrade = async () => {
    if (!canAddTrade) { setShowUpgrade(true); return; }
    const entry = +newTrade.entry, exit = +newTrade.exit, size = +newTrade.size;
    const pnl = Math.round((exit-entry)*size*(newTrade.direction==="LONG"?1:-1)*100)/100;
    const trade = { ...newTrade, entry, exit, size, pnl, user_id: user.id };

    const { data, error } = await supabase.from("trades").insert([trade]).select();
    if (!error && data) {
      setTrades([data[0], ...trades]);
      setShowModal(false);
      setNewTrade({ date:new Date().toISOString().split("T")[0], symbol:"", direction:"LONG", entry:"", exit:"", size:"", emotionBefore:"🧠 Lucido", emotionDuring:"🧠 Lucido", emotionAfter:"🧠 Lucido", notes:"", setup:"" });
    }
  };

  // Loading screen
  if (screen==="loading") return (
    <div style={{ minHeight:"100vh", background:"#060a0f", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'IBM Plex Mono',monospace" }}>
      <style>{CSS}</style>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:6, color:"#00ff88", marginBottom:16 }} className="glow">TRADING MIND OS</div>
        <div style={{ fontSize:11, color:"#556068", letterSpacing:2 }} className="pulse">CARICAMENTO...</div>
      </div>
    </div>
  );

  if (screen==="login") return <LoginPage onLogin={handleLogin} onGoToPricing={()=>setScreen("pricing")} />;
  if (screen==="pricing") return <PricingPage onBack={()=>setScreen(user?"app":"login")} onSelectPlan={handleSelectPlan} currentPlan={user?.plan||"free"} />;

  const tabs = [
    {id:"dashboard",label:"Dashboard",icon:"⬡"},
    {id:"journal",label:"Journal",icon:"◈"},
    {id:"psychology",label:"Psicologia",icon:"◉"},
    {id:"stats",label:"Statistiche",icon:"◫"},
    {id:"reports",label:"Report",icon:"◐"},
  ];

  return (
    <div style={{ fontFamily:"'IBM Plex Mono','Courier New',monospace", background:"#060a0f", minHeight:"100vh", color:"#c9d1d9" }}>
      <style>{CSS}</style>

      {/* Header */}
      <header style={{ borderBottom:"1px solid #1a2332", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:4, color:"#00ff88" }} className="glow">TRADING MIND OS</span>
          <span style={{ fontSize:9, color:plan.color, letterSpacing:2, border:`1px solid ${plan.color}44`, padding:"2px 8px", borderRadius:2 }}>{plan.name}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:18, fontWeight:500, letterSpacing:2, color:totalPnL>=0?"#00ff88":"#ff4466" }}>{totalPnL>=0?"+":""}{totalPnL.toFixed(2)} $</div>
            <div style={{ fontSize:9, color:"#556068", letterSpacing:1 }}>P&L TOTALE</div>
          </div>
          <div style={{ fontSize:11, color:"#556068" }}>{time.toLocaleTimeString("it-IT")}</div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:11, color:"#8b949e" }}>Ciao, <span style={{ color:"#00ff88" }}>{user?.name}</span></span>
            <button className="btn-primary" style={{ fontSize:9, padding:"4px 10px", borderColor:plan.color, color:plan.color }} onClick={()=>setScreen("pricing")}>UPGRADE</button>
            <button onClick={handleLogout} style={{ background:"none", border:"none", color:"#556068", cursor:"pointer", fontSize:10 }}>ESCI</button>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <div style={{ borderBottom:"1px solid #0f1923", padding:"6px 24px", background:"#080d12" }}>
        <div className="ticker">
          {[["EUR/USD","1.0891","+0.23%",true],["GOLD","2198.40","+0.54%",true],["BTC","82,900","-1.12%",false],["NAS100","19,780","+0.87%",true],["OIL","82.14","-0.34%",false]].map(([sym,price,chg,up])=>(
            <div key={sym} className="ticker-item">
              <span style={{ fontSize:9, color:"#556068", letterSpacing:1 }}>{sym}</span>
              <span style={{ fontSize:12, color:up?"#00ff88":"#ff4466" }}>{price}</span>
              <span style={{ fontSize:9, color:up?"#00ff8888":"#ff446688" }}>{chg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trade limit bar */}
      {user?.plan==="free" && (
        <div style={{ background:"#080d12", borderBottom:"1px solid #0f1923", padding:"6px 24px", display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:10, color:"#556068", letterSpacing:1 }}>TRADE USATI:</span>
          <div style={{ flex:1, maxWidth:200, height:4, background:"#1a2332", borderRadius:2 }}>
            <div style={{ height:"100%", width:`${Math.min((trades.length/tradeLimit)*100,100)}%`, background:trades.length>=tradeLimit?"#ff4466":"#00ff88", borderRadius:2 }} />
          </div>
          <span style={{ fontSize:10, color:trades.length>=tradeLimit?"#ff4466":"#556068" }}>{trades.length}/{tradeLimit}</span>
          {trades.length>=tradeLimit && <button className="btn-primary" style={{ fontSize:9, padding:"3px 10px" }} onClick={()=>setScreen("pricing")}>UPGRADE →</button>}
        </div>
      )}

      {/* Nav */}
      <nav style={{ borderBottom:"1px solid #1a2332", padding:"0 24px", display:"flex", gap:4 }}>
        {tabs.map(t=>(
          <button key={t.id} className={`tab-btn ${activeTab===t.id?"active":""}`} onClick={()=>setActiveTab(t.id)}>
            <span style={{ marginRight:6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      <main style={{ padding:24 }}>

        {/* DASHBOARD */}
        {activeTab==="dashboard" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }} className="fade-in">
            <div className="grid-4">
              {[
                {label:"Win Rate",value:`${winRate}%`,sub:`${winTrades.length}W / ${lossTrades.length}L`,up:winRate>=50},
                {label:"Profit Factor",value:rr,sub:"avg win / avg loss",up:+rr>=1.5},
                {label:"Avg Win",value:`+${avgWin}$`,sub:"per trade vincente",up:true},
                {label:"Avg Loss",value:`-${avgLoss}$`,sub:"per trade perdente",up:false},
              ].map(k=>(
                <div key={k.label} className="stat-card">
                  <div style={{ fontSize:9, color:"#556068", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>{k.label}</div>
                  <div style={{ fontSize:28, color:k.up?"#00ff88":"#ff4466", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:3 }}>{k.value}</div>
                  <div style={{ fontSize:10, color:"#556068", marginTop:4 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16 }}>
              <div className="card" style={{ padding:20 }}>
                <div style={{ fontSize:9, color:"#556068", letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>◈ Equity Curve</div>
                <svg viewBox="0 0 460 120" style={{ width:"100%", height:120 }}>
                  <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00ff88" stopOpacity="0.15"/><stop offset="100%" stopColor="#00ff88" stopOpacity="0"/></linearGradient></defs>
                  {[0,30,60,90,120].map(y=><line key={y} x1="0" y1={y} x2="460" y2={y} stroke="#1a2332" strokeWidth="0.5"/>)}
                  <polygon points={cumPnL.map((d,i)=>`${i*(460/(cumPnL.length-1))},${110-((d.cum-minCum)/range)*100}`).join(" ")+` 460,110 0,110`} fill="url(#grad)"/>
                  <polyline points={cumPnL.map((d,i)=>`${i*(460/(cumPnL.length-1))},${110-((d.cum-minCum)/range)*100}`).join(" ")} fill="none" stroke="#00ff88" strokeWidth="1.5" strokeLinejoin="round"/>
                  {cumPnL.map((d,i)=><circle key={i} cx={i*(460/(cumPnL.length-1))} cy={110-((d.cum-minCum)/range)*100} r="3" fill="#00ff88"/>)}
                </svg>
              </div>
              <div className="card" style={{ padding:20 }}>
                <div style={{ fontSize:9, color:"#556068", letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>◉ Mindset Score</div>
                {PSYCH_DATA.map(p=>{
                  const pct=Math.round((p.wins/(p.wins+p.losses))*100);
                  return (
                    <div key={p.emotion} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:11 }}>{p.emotion}</span>
                        <span style={{ fontSize:11, color:pct>=60?"#00ff88":"#ff4466" }}>{pct}%</span>
                      </div>
                      <div className="psych-bar"><div className="psych-bar-fill" style={{ width:`${pct}%`, background:pct>=60?"linear-gradient(90deg,#00ff88,#00cc66)":"linear-gradient(90deg,#ff4466,#cc3355)" }}/></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {trades.length > 0 ? (
              <div className="card" style={{ padding:20 }}>
                <div style={{ fontSize:9, color:"#556068", letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>◫ Ultimi Trade</div>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead><tr style={{ borderBottom:"1px solid #1a2332" }}>{["DATA","SIMBOLO","DIR","ENTRY","EXIT","P&L","STATO MENTALE","SETUP"].map(h=><th key={h} style={{ textAlign:"left", padding:"6px 8px", fontSize:9, color:"#556068", letterSpacing:1, fontWeight:400 }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {trades.slice(0,5).map(t=>(
                      <tr key={t.id} className="trade-row">
                        <td style={{ padding:"10px 8px", color:"#556068", fontSize:11 }}>{t.date}</td>
                        <td style={{ padding:"10px 8px", fontWeight:600 }}>{t.symbol}</td>
                        <td style={{ padding:"10px 8px", color:t.direction==="LONG"?"#00ff88":"#ff4466", fontSize:10 }}>{t.direction}</td>
                        <td style={{ padding:"10px 8px", color:"#8b949e" }}>{t.entry}</td>
                        <td style={{ padding:"10px 8px", color:"#8b949e" }}>{t.exit}</td>
                        <td style={{ padding:"10px 8px", color:t.pnl>=0?"#00ff88":"#ff4466", fontWeight:600 }}>{t.pnl>=0?"+":""}{t.pnl}$</td>
                        <td style={{ padding:"10px 8px", fontSize:11 }}>{t.emotion_before}</td>
                        <td style={{ padding:"10px 8px" }}><span className="tag">{t.setup}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card" style={{ padding:40, textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>📊</div>
                <div style={{ fontSize:14, color:"#556068", letterSpacing:1 }}>Nessun trade ancora.</div>
                <div style={{ fontSize:11, color:"#2a3444", marginTop:8 }}>Vai nel Journal e aggiungi il tuo primo trade!</div>
              </div>
            )}
          </div>
        )}

        {/* JOURNAL */}
        {activeTab==="journal" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }} className="fade-in">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:4 }}>TRADE JOURNAL</h2>
                <p style={{ fontSize:10, color:"#556068", letterSpacing:1 }}>{trades.length}/{tradeLimit===999?"∞":tradeLimit} TRADE — PIANO {plan.name}</p>
              </div>
              <button className="btn-primary" onClick={()=>canAddTrade?setShowModal(true):setShowUpgrade(true)}>+ NUOVO TRADE</button>
            </div>
            {trades.length===0 && (
              <div className="card" style={{ padding:40, textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:12 }}>✍️</div>
                <div style={{ fontSize:14, color:"#556068" }}>Inizia ad aggiungere i tuoi trade!</div>
              </div>
            )}
            {trades.map(t=>(
              <div key={t.id} className="card" style={{ padding:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                  <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:3 }}>{t.symbol}</span>
                    <span style={{ fontSize:10, color:t.direction==="LONG"?"#00ff88":"#ff4466", letterSpacing:2 }}>{t.direction}</span>
                    <span className="tag">{t.setup}</span>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:22, color:t.pnl>=0?"#00ff88":"#ff4466", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:2 }}>{t.pnl>=0?"+":""}{t.pnl}$</div>
                    <div style={{ fontSize:9, color:"#556068" }}>{t.date}</div>
                  </div>
                </div>
                <div className="grid-3" style={{ marginBottom:12 }}>
                  <div><span className="label">Entry</span><span style={{ fontSize:13 }}>{t.entry}</span></div>
                  <div><span className="label">Exit</span><span style={{ fontSize:13 }}>{t.exit}</span></div>
                  <div><span className="label">Size</span><span style={{ fontSize:13 }}>{t.size}</span></div>
                </div>
                <div style={{ borderTop:"1px solid #0f1923", paddingTop:12, display:"flex", gap:24, marginBottom:12 }}>
                  <div><span className="label">Prima</span><span style={{ fontSize:13 }}>{t.emotion_before}</span></div>
                  <div><span className="label">Durante</span><span style={{ fontSize:13 }}>{t.emotion_during}</span></div>
                  <div><span className="label">Dopo</span><span style={{ fontSize:13 }}>{t.emotion_after}</span></div>
                </div>
                {t.notes && <div style={{ background:"#060a0f", border:"1px solid #1a2332", borderLeft:"2px solid #00ff8844", padding:"10px 14px" }}><span style={{ fontSize:10, color:"#556068" }}>NOTE — </span><span style={{ fontSize:12, color:"#8b949e" }}>{t.notes}</span></div>}
              </div>
            ))}
          </div>
        )}

        {/* PSYCHOLOGY */}
        {activeTab==="psychology" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }} className="fade-in">
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:4 }}>ANALISI PSICOLOGICA</h2>
            <div className="grid-2">
              <div className="card" style={{ padding:24 }}>
                <div style={{ fontSize:9, color:"#556068", letterSpacing:2, textTransform:"uppercase", marginBottom:20 }}>◉ Win Rate per Stato Emotivo</div>
                {PSYCH_DATA.map(p=>{
                  const pct=Math.round((p.wins/(p.wins+p.losses))*100);
                  return (
                    <div key={p.emotion} style={{ marginBottom:18 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <span style={{ fontSize:13 }}>{p.emotion}</span>
                        <div style={{ display:"flex", gap:8, fontSize:11 }}>
                          <span style={{ color:"#00ff88" }}>{p.wins}W</span><span style={{ color:"#ff4466" }}>{p.losses}L</span>
                          <span style={{ color:pct>=60?"#00ff88":"#ff4466", fontWeight:600 }}>{pct}%</span>
                        </div>
                      </div>
                      <div className="psych-bar"><div className="psych-bar-fill" style={{ width:`${pct}%`, background:pct>=60?"linear-gradient(90deg,#00ff88,#00cc66)":pct>=40?"linear-gradient(90deg,#ffaa00,#ff8800)":"linear-gradient(90deg,#ff4466,#cc3355)" }}/></div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div className="card" style={{ padding:24 }}>
                  <div style={{ fontSize:9, color:"#556068", letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>◈ Insight Chiave</div>
                  {[
                    {icon:"🎯",title:"Zona Migliore",text:"Quando sei Lucido o In Zona, il tuo win rate supera l'88%.",color:"#00ff88"},
                    {icon:"⚠️",title:"Zona Rischio",text:"Il FOMO ti costa: solo 14% di win rate. Evita di tradare.",color:"#ff4466"},
                    {icon:"💡",title:"Pattern",text:"I tuoi migliori trade arrivano dopo una vittoria.",color:"#ffaa00"},
                  ].map(ins=>(
                    <div key={ins.title} style={{ marginBottom:14, paddingLeft:12, borderLeft:`2px solid ${ins.color}44` }}>
                      <div style={{ fontSize:12, color:ins.color, fontWeight:600, marginBottom:4 }}>{ins.icon} {ins.title}</div>
                      <div style={{ fontSize:11, color:"#8b949e", lineHeight:1.6 }}>{ins.text}</div>
                    </div>
                  ))}
                </div>
                {user?.plan==="free" ? (
                  <div className="card" style={{ padding:24, borderColor:"#ff990022", position:"relative", overflow:"hidden" }}>
                    <div style={{ filter:"blur(4px)", pointerEvents:"none", height:120, background:"#0f1923", borderRadius:2 }}/>
                    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                      <div style={{ fontSize:24 }}>🔒</div>
                      <div style={{ fontSize:11, color:"#ff9900", letterSpacing:2, margin:"8px 0" }}>PIANO BETA+</div>
                      <button className="btn-primary" style={{ fontSize:9, borderColor:"#ff9900", color:"#ff9900" }} onClick={()=>setScreen("pricing")}>SBLOCCA →</button>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ padding:24 }}>
                    <div style={{ fontSize:9, color:"#556068", letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>◉ Riflessione Giornaliera</div>
                    {["Cosa ha funzionato oggi?","Cosa non ha funzionato?","Cosa farò diversamente domani?"].map(q=>(
                      <div key={q} style={{ marginBottom:12 }}>
                        <label className="label">{q}</label>
                        <textarea className="input" placeholder="Scrivi qui..." style={{ height:60, resize:"vertical" }}/>
                      </div>
                    ))}
                    <button className="btn-primary" style={{ marginTop:8 }}>SALVA</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STATS */}
        {activeTab==="stats" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }} className="fade-in">
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:4 }}>STATISTICHE</h2>
            <div className="grid-4">
              {[
                {label:"Trade Totali",value:trades.length,up:null},
                {label:"Win Rate",value:`${winRate}%`,up:winRate>=50},
                {label:"P&L Totale",value:`${totalPnL>=0?"+":""}${totalPnL.toFixed(0)}$`,up:totalPnL>=0},
                {label:"Profit Factor",value:`${rr}x`,up:+rr>=1.5},
              ].map(s=>(
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize:9, color:"#556068", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>{s.label}</div>
                  <div style={{ fontSize:32, color:s.up===null?"#c9d1d9":s.up?"#00ff88":"#ff4466", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:3 }}>{s.value}</div>
                </div>
              ))}
            </div>
            {trades.length > 0 && (
              <div className="card" style={{ padding:24 }}>
                <div style={{ fontSize:9, color:"#556068", letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>◫ Performance per Simbolo</div>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead><tr style={{ borderBottom:"1px solid #1a2332" }}>{["SIMBOLO","TRADE","WIN","LOSS","WIN RATE","P&L"].map(h=><th key={h} style={{ textAlign:"left", padding:"6px 8px", fontSize:9, color:"#556068", letterSpacing:1, fontWeight:400 }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {Object.entries(trades.reduce((acc,t)=>{
                      if(!acc[t.symbol])acc[t.symbol]={trades:0,wins:0,losses:0,pnl:0};
                      acc[t.symbol].trades++; t.pnl>0?acc[t.symbol].wins++:acc[t.symbol].losses++; acc[t.symbol].pnl+=t.pnl; return acc;
                    },{})).map(([sym,data])=>(
                      <tr key={sym} className="trade-row">
                        <td style={{ padding:"10px 8px", fontWeight:600 }}>{sym}</td>
                        <td style={{ padding:"10px 8px", color:"#556068" }}>{data.trades}</td>
                        <td style={{ padding:"10px 8px", color:"#00ff88" }}>{data.wins}</td>
                        <td style={{ padding:"10px 8px", color:"#ff4466" }}>{data.losses}</td>
                        <td style={{ padding:"10px 8px", color:Math.round(data.wins/data.trades*100)>=50?"#00ff88":"#ff4466" }}>{Math.round(data.wins/data.trades*100)}%</td>
                        <td style={{ padding:"10px 8px", fontWeight:600, color:data.pnl>=0?"#00ff88":"#ff4466" }}>{data.pnl>=0?"+":""}{data.pnl.toFixed(2)}$</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REPORTS */}
        {activeTab==="reports" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }} className="fade-in">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, letterSpacing:4 }}>REPORT SETTIMANALI</h2>
                <p style={{ fontSize:10, color:"#556068", letterSpacing:1 }}>ANALISI MACRO — SETUP — MERCATI</p>
              </div>
              {user?.email === ADMIN_EMAIL && (
                <button className="btn-primary" style={{ borderColor:"#ff9900", color:"#ff9900" }} onClick={()=>setShowAdminPanel(true)}>
                  ⚙ PUBBLICA REPORT
                </button>
              )}
            </div>

            {/* Locked for free/beta */}
            {(user?.plan==="free" || user?.plan==="beta") ? (
              <div className="card" style={{ padding:48, textAlign:"center", borderColor:"#ff990022" }}>
                <div style={{ fontSize:40, marginBottom:16 }}>🔒</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:4, marginBottom:8, color:"#ff9900" }}>CONTENUTO PREMIUM</div>
                <div style={{ fontSize:12, color:"#8b949e", lineHeight:1.8, marginBottom:24 }}>
                  I report settimanali includono analisi macro, setup grafici e mercati da monitorare.<br/>
                  Disponibile dal piano <strong style={{ color:"#00ff88" }}>MID</strong> in su.
                </div>
                <button className="btn-solid" onClick={()=>setScreen("pricing")}>SBLOCCA CON MID →</button>
              </div>
            ) : selectedReport ? (
              /* Report Detail */
              <div>
                <button onClick={()=>setSelectedReport(null)} style={{ background:"none", border:"none", color:"#556068", cursor:"pointer", fontSize:11, letterSpacing:2, marginBottom:16 }}>← TORNA ALLA LISTA</button>
                <div className="card" style={{ padding:32 }}>
                  <div style={{ marginBottom:24 }}>
                    <div style={{ fontSize:9, color:"#556068", letterSpacing:2, marginBottom:8 }}>◐ REPORT SETTIMANALE — {selectedReport.week}</div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:4, color:"#c9d1d9", marginBottom:8 }}>{selectedReport.title}</div>
                    <div style={{ fontSize:10, color:"#556068" }}>{new Date(selectedReport.created_at).toLocaleDateString("it-IT", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</div>
                  </div>
                  <div style={{ borderTop:"1px solid #1a2332", paddingTop:24, fontSize:13, color:"#8b949e", lineHeight:2, whiteSpace:"pre-wrap" }}>
                    {selectedReport.content}
                  </div>
                  {selectedReport.images && selectedReport.images.length > 0 && (
                    <div style={{ marginTop:32 }}>
                      <div style={{ fontSize:9, color:"#556068", letterSpacing:2, marginBottom:16 }}>◈ GRAFICI</div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:16 }}>
                        {selectedReport.images.map((url, i) => (
                          <img key={i} src={url} alt={`Grafico ${i+1}`} style={{ width:"100%", borderRadius:4, border:"1px solid #1a2332", cursor:"pointer" }} onClick={()=>window.open(url,"_blank")} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Reports List */
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {reports.length === 0 ? (
                  <div className="card" style={{ padding:40, textAlign:"center" }}>
                    <div style={{ fontSize:32, marginBottom:12 }}>📊</div>
                    <div style={{ fontSize:14, color:"#556068" }}>Nessun report ancora pubblicato.</div>
                    <div style={{ fontSize:11, color:"#2a3444", marginTop:8 }}>Il primo report arriverà domenica sera.</div>
                  </div>
                ) : reports.map(r => (
                  <div key={r.id} className="card" style={{ padding:24, cursor:"pointer", transition:"border-color 0.2s", borderColor:"#1a2332" }}
                    onClick={()=>setSelectedReport(r)}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#00ff8844"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="#1a2332"}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:9, color:"#556068", letterSpacing:2, marginBottom:6 }}>◐ {r.week}</div>
                        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:3, color:"#c9d1d9", marginBottom:8 }}>{r.title}</div>
                        <div style={{ fontSize:11, color:"#556068", lineHeight:1.6 }}>{r.content.substring(0, 120)}...</div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, minWidth:100 }}>
                        <span style={{ fontSize:9, color:"#00ff88", border:"1px solid #00ff8844", padding:"2px 8px" }}>{r.min_plan.toUpperCase()}+</span>
                        {r.images && r.images.length > 0 && <span style={{ fontSize:9, color:"#556068" }}>📈 {r.images.length} grafici</span>}
                        <span style={{ fontSize:9, color:"#556068" }}>{new Date(r.created_at).toLocaleDateString("it-IT")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal Nuovo Trade */}
      {showModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="modal">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:4 }}>NUOVO TRADE</h3>
              <button onClick={()=>setShowModal(false)} style={{ background:"none", border:"none", color:"#556068", cursor:"pointer", fontSize:20 }}>✕</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div className="grid-2">
                <div><label className="label">Simbolo</label><input className="input" placeholder="EUR/USD" value={newTrade.symbol} onChange={e=>setNewTrade({...newTrade,symbol:e.target.value})}/></div>
                <div><label className="label">Data</label><input className="input" type="date" value={newTrade.date} onChange={e=>setNewTrade({...newTrade,date:e.target.value})}/></div>
              </div>
              <div className="grid-3">
                <div><label className="label">Direzione</label><select className="select" style={{ width:"100%" }} value={newTrade.direction} onChange={e=>setNewTrade({...newTrade,direction:e.target.value})}><option>LONG</option><option>SHORT</option></select></div>
                <div><label className="label">Entry</label><input className="input" type="number" placeholder="0.00" value={newTrade.entry} onChange={e=>setNewTrade({...newTrade,entry:e.target.value})}/></div>
                <div><label className="label">Exit</label><input className="input" type="number" placeholder="0.00" value={newTrade.exit} onChange={e=>setNewTrade({...newTrade,exit:e.target.value})}/></div>
              </div>
              <div className="grid-2">
                <div><label className="label">Size</label><input className="input" type="number" placeholder="1.0" value={newTrade.size} onChange={e=>setNewTrade({...newTrade,size:e.target.value})}/></div>
                <div><label className="label">Setup</label><input className="input" placeholder="Es: Breakout + Retest" value={newTrade.setup} onChange={e=>setNewTrade({...newTrade,setup:e.target.value})}/></div>
              </div>
              <div>
                <label className="label">Stato Emotivo — Prima / Durante / Dopo</label>
                <div className="grid-3">
                  {[["emotionBefore","emotion_before"],["emotionDuring","emotion_during"],["emotionAfter","emotion_after"]].map(([field])=>(
                    <select key={field} className="select" style={{ width:"100%" }} value={newTrade[field]} onChange={e=>setNewTrade({...newTrade,[field]:e.target.value})}>
                      {EMOTIONS.map(em=><option key={em}>{em}</option>)}
                    </select>
                  ))}
                </div>
              </div>
              <div><label className="label">Note</label><textarea className="input" placeholder="Descrivi il tuo processo decisionale..." value={newTrade.notes} onChange={e=>setNewTrade({...newTrade,notes:e.target.value})} style={{ height:80, resize:"vertical" }}/></div>
              <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:8 }}>
                <button className="btn-primary" style={{ borderColor:"#556068", color:"#556068" }} onClick={()=>setShowModal(false)}>ANNULLA</button>
                <button className="btn-primary" onClick={handleAddTrade} disabled={!newTrade.symbol||!newTrade.entry||!newTrade.exit}>SALVA TRADE</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdminPanel(false)}>
          <div className="modal" style={{ width:700 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:4, color:"#ff9900" }}>⚙ PUBBLICA REPORT</h3>
              <button onClick={()=>setShowAdminPanel(false)} style={{ background:"none", border:"none", color:"#556068", cursor:"pointer", fontSize:20 }}>✕</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div className="grid-2">
                <div><label className="label">Titolo Report</label><input className="input" placeholder="Es: Setup della settimana — Gold e NAS" value={newReport.title} onChange={e=>setNewReport({...newReport,title:e.target.value})}/></div>
                <div><label className="label">Settimana</label><input className="input" placeholder="Es: 10-16 Marzo 2025" value={newReport.week} onChange={e=>setNewReport({...newReport,week:e.target.value})}/></div>
              </div>
              <div>
                <label className="label">Piano minimo richiesto</label>
                <select className="select" style={{ width:"100%" }} value={newReport.min_plan} onChange={e=>setNewReport({...newReport,min_plan:e.target.value})}>
                  <option value="mid">MID e PRO</option>
                  <option value="pro">Solo PRO</option>
                </select>
              </div>
              <div>
                <label className="label">Analisi / Contenuto</label>
                <textarea className="input" placeholder="Scrivi qui la tua analisi macro, setup da monitorare, livelli chiave..." value={newReport.content} onChange={e=>setNewReport({...newReport,content:e.target.value})} style={{ height:200, resize:"vertical", lineHeight:1.8 }}/>
              </div>
              <div>
                <label className="label">Grafici TradingView (immagini)</label>
                <input type="file" accept="image/*" multiple onChange={async (e) => {
                  setUploadingImages(true);
                  const urls = [];
                  for (const file of Array.from(e.target.files)) {
                    const path = `${Date.now()}_${file.name.replace(/\s/g,"_")}`;
                    const { data, error } = await supabase.storage.from("reports").upload(path, file);
                    if (!error) {
                      const { data: urlData } = supabase.storage.from("reports").getPublicUrl(path);
                      urls.push(urlData.publicUrl);
                    }
                  }
                  setReportImages(prev => [...prev, ...urls]);
                  setUploadingImages(false);
                }} style={{ color:"#556068", fontSize:11 }}/>
                {uploadingImages && <div style={{ fontSize:10, color:"#00ff88", marginTop:8 }} className="pulse">Caricamento immagini...</div>}
                {reportImages.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:12 }}>
                    {reportImages.map((url,i) => (
                      <div key={i} style={{ position:"relative" }}>
                        <img src={url} alt="" style={{ width:80, height:60, objectFit:"cover", borderRadius:2, border:"1px solid #1a2332" }}/>
                        <button onClick={()=>setReportImages(prev=>prev.filter((_,j)=>j!==i))} style={{ position:"absolute", top:-6, right:-6, background:"#ff4466", border:"none", color:"white", borderRadius:"50%", width:16, height:16, fontSize:9, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:8 }}>
                <button className="btn-primary" style={{ borderColor:"#556068", color:"#556068" }} onClick={()=>setShowAdminPanel(false)}>ANNULLA</button>
                <button style={{ background:"#ff9900", border:"1px solid #ff9900", color:"#060a0f", fontFamily:"inherit", fontSize:11, letterSpacing:2, padding:"10px 24px", cursor:"pointer", borderRadius:2, fontWeight:700 }}
                  disabled={!newReport.title || !newReport.content || uploadingImages}
                  onClick={async () => {
                    const { data, error } = await supabase.from("reports").insert([{
                      ...newReport, images: reportImages, published: true
                    }]).select();
                    if (!error && data) {
                      setReports(prev => [data[0], ...prev]);
                      setShowAdminPanel(false);
                      setNewReport({ title:"", week:"", content:"", min_plan:"mid" });
                      setReportImages([]);
                      setActiveTab("reports");
                    }
                  }}>
                  PUBBLICA →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Upgrade */}
      {showUpgrade && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowUpgrade(false)}>
          <div className="modal" style={{ maxWidth:440, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>🚀</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:4, marginBottom:8 }}>LIMITE RAGGIUNTO</div>
            <div style={{ fontSize:12, color:"#8b949e", lineHeight:1.8, marginBottom:24 }}>
              Hai raggiunto il limite di <strong style={{ color:"#00ff88" }}>{tradeLimit} trade</strong> del piano {plan.name}.<br/>
              Fai upgrade per continuare.
            </div>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <button className="btn-primary" style={{ borderColor:"#556068", color:"#556068" }} onClick={()=>setShowUpgrade(false)}>NON ORA</button>
              <button className="btn-solid" onClick={()=>{setShowUpgrade(false);setScreen("pricing");}}>VEDI I PIANI →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
