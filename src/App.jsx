import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  doc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

const LIMIT = 50;
const DOC_REF = doc(db, "app", "placar");

const getInitialState = () => ({
  total: 0,
  currentCycle: 0,
  rafaTokens: 0,
  history: [],
});

export default function App() {
  const [data, setData] = useState(getInitialState());
  const [loading, setLoading] = useState(true);
  const [celebrating, setCelebrating] = useState(false);
  const [usingToken, setUsingToken] = useState(false);
  const [tokenUsed, setTokenUsed] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(DOC_REF, (snap) => {
      if (snap.exists()) {
        setData(snap.data());
      } else {
        setDoc(DOC_REF, getInitialState());
      }
      setLoading(false);
    }, (err) => {
      console.error("Erro Firebase:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const save = async (newData) => {
    setSyncing(true);
    await setDoc(DOC_REF, newData);
    setSyncing(false);
  };

  const addDisagreement = async () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    const now = new Date().toLocaleString("pt-BR");
    const newCycle = data.currentCycle + 1;
    const newTotal = data.total + 1;
    const milestone = newCycle >= LIMIT;
    const entry = { id: Date.now(), time: now, totalAt: newTotal, milestone: milestone || false };
    const newData = {
      total: newTotal,
      currentCycle: milestone ? 0 : newCycle,
      rafaTokens: milestone ? data.rafaTokens + 1 : data.rafaTokens,
      history: [entry, ...(data.history || [])].slice(0, 50),
    };
    await save(newData);
    if (milestone) { setCelebrating(true); setTimeout(() => setCelebrating(false), 3000); }
  };

  const useToken = async () => {
    if (data.rafaTokens <= 0) return;
    setUsingToken(true);
    const now = new Date().toLocaleString("pt-BR");
    const entry = { id: Date.now(), time: now, totalAt: data.total, tokenUsed: true };
    const newData = { ...data, rafaTokens: data.rafaTokens - 1, currentCycle: 0, history: [entry, ...(data.history || [])].slice(0, 50) };
    await save(newData);
    setUsingToken(false);
    setTokenUsed(true);
    setTimeout(() => setTokenUsed(false), 2500);
  };

  const reset = async () => {
    if (!window.confirm("Resetar tudo?")) return;
    await save(getInitialState());
  };

  const progress = (data.currentCycle / LIMIT) * 100;

  if (loading) return (
    <div style={styles.loading}>
      <div style={styles.spinner} />
      <p style={{ color: "rgba(255,255,255,0.4)", marginTop: 16, fontFamily: "monospace", fontSize: 13 }}>Conectando...</p>
    </div>
  );

  return (
    <div style={styles.root}>
      <div style={styles.bgNoise} />
      {syncing && <div style={styles.syncBadge}>⟳ sincronizando...</div>}

      {celebrating && (
        <div style={styles.celebOverlay}>
          <div style={styles.celebContent}>
            <div style={styles.celebEmoji}>🎉</div>
            <div style={styles.celebTitle}>50 DISCORDÂNCIAS!</div>
            <div style={styles.celebSub}>Rafa ganhou o direito de escolher!</div>
          </div>
        </div>
      )}

      {tokenUsed && (
        <div style={styles.celebOverlay}>
          <div style={{ ...styles.celebContent, background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}>
            <div style={styles.celebEmoji}>✅</div>
            <div style={styles.celebTitle}>TOKEN USADO!</div>
            <div style={styles.celebSub}>Alisson concorda automaticamente desta vez.</div>
          </div>
        </div>
      )}

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.tag}>PLACAR DE DISCORDÂNCIAS</div>
          <h1 style={styles.title}>
            <span style={styles.nameA}>Alisson</span>
            <span style={styles.vs}>vs</span>
            <span style={styles.nameR}>Rafa</span>
          </h1>
          <p style={styles.subtitle}>A cada <strong>50 discordâncias</strong> do Alisson, Rafa ganha 1 token de concordância forçada.</p>
          <div style={styles.liveBadge}>🟢 dados em tempo real</div>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}><div style={styles.statNumber}>{data.total}</div><div style={styles.statLabel}>Total de Discordâncias</div></div>
          <div style={{ ...styles.statCard, ...styles.statCardAccent }}><div style={{ ...styles.statNumber, color: "#fbbf24" }}>{data.currentCycle}</div><div style={styles.statLabel}>No Ciclo Atual</div></div>
          <div style={styles.statCard}><div style={{ ...styles.statNumber, color: "#34d399" }}>{data.rafaTokens}</div><div style={styles.statLabel}>Tokens do Rafa 🎟️</div></div>
        </div>

        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Progresso para o próximo token</span>
            <span style={styles.progressCount}>{data.currentCycle} / {LIMIT}</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%`, background: progress >= 80 ? "linear-gradient(90deg,#f87171,#ef4444)" : progress >= 50 ? "linear-gradient(90deg,#fbbf24,#f59e0b)" : "linear-gradient(90deg,#60a5fa,#3b82f6)" }} />
          </div>
          <div style={styles.progressHint}>{LIMIT - data.currentCycle === 0 ? "🎉 Token gerado!" : `Faltam ${LIMIT - data.currentCycle} para o Rafa ganhar um token`}</div>
        </div>

        <div style={styles.actions}>
          <button style={{ ...styles.btnMain, transform: ripple ? "scale(0.96)" : "scale(1)" }} onClick={addDisagreement}>
            <span style={styles.btnIcon}>⚡</span><span>Alisson discordou!</span>
          </button>
          <button style={{ ...styles.btnToken, opacity: data.rafaTokens > 0 ? 1 : 0.4, cursor: data.rafaTokens > 0 ? "pointer" : "not-allowed" }} onClick={useToken} disabled={data.rafaTokens <= 0 || usingToken}>
            <span style={styles.btnIcon}>🎟️</span><span>{usingToken ? "Usando..." : `Rafa usa token (${data.rafaTokens} disponíveis)`}</span>
          </button>
        </div>

        {data.rafaTokens > 0 && (
          <div style={styles.tokenAlert}>
            <div style={styles.tokenAlertIcon}>🎯</div>
            <div><strong>Rafa tem {data.rafaTokens} token{data.rafaTokens > 1 ? "s" : ""}!</strong> Na próxima discussão, ele pode usar um token e o Alisson deve concordar automaticamente.</div>
          </div>
        )}

        {(data.history || []).length > 0 && (
          <div style={styles.historySection}>
            <div style={styles.historyTitle}>Histórico recente</div>
            <div style={styles.historyList}>
              {(data.history || []).slice(0, 10).map((entry) => (
                <div key={entry.id} style={styles.historyItem}>
                  <div style={styles.historyDot(entry.milestone, entry.tokenUsed)} />
                  <div style={styles.historyText}>
                    {entry.tokenUsed ? <span>🎟️ <strong>Token do Rafa usado</strong> — Alisson concordou</span>
                      : entry.milestone ? <span>🎉 <strong>Marco! 50ª discordância!</strong> Rafa ganhou 1 token</span>
                      : <span>⚡ Alisson discordou (#{entry.totalAt})</span>}
                  </div>
                  <div style={styles.historyTime}>{entry.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button style={styles.btnReset} onClick={reset}>Resetar tudo</button>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0a0a0f; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}

const styles = {
  root: { minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Syne', sans-serif", color: "#f0f0f0", position: "relative", overflow: "hidden" },
  bgNoise: { position: "fixed", inset: 0, backgroundImage: `radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(239,68,68,0.07) 0%, transparent 60%)`, pointerEvents: "none", zIndex: 0 },
  syncBadge: { position: "fixed", top: 16, right: 16, zIndex: 50, background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24", borderRadius: 99, padding: "4px 12px", fontSize: 12, fontFamily: "monospace", animation: "pulse 1s infinite" },
  loading: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0a0a0f" },
  spinner: { width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  celebOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.3s ease" },
  celebContent: { background: "linear-gradient(135deg, #1c1c2e, #2d1b69)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 24, padding: "48px 64px", textAlign: "center", boxShadow: "0 0 80px rgba(251,191,36,0.2)", animation: "fadeIn 0.4s ease" },
  celebEmoji: { fontSize: 64, marginBottom: 16 },
  celebTitle: { fontSize: 32, fontWeight: 800, letterSpacing: "0.1em", color: "#fbbf24" },
  celebSub: { fontSize: 18, marginTop: 8, color: "rgba(255,255,255,0.7)" },
  container: { position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto", padding: "40px 20px 60px" },
  header: { textAlign: "center", marginBottom: 40 },
  tag: { display: "inline-block", fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: "0.2em", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)", borderRadius: 99, padding: "4px 14px", marginBottom: 16 },
  title: { fontSize: "clamp(36px, 8vw, 56px)", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, lineHeight: 1.1, marginBottom: 12 },
  nameA: { color: "#60a5fa" },
  vs: { color: "rgba(255,255,255,0.2)", fontSize: "0.5em", fontWeight: 400 },
  nameR: { color: "#f87171" },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.6, fontFamily: "'DM Mono', monospace", fontWeight: 400 },
  liveBadge: { display: "inline-block", marginTop: 10, fontSize: 12, fontFamily: "'DM Mono', monospace", color: "#34d399", opacity: 0.7 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 },
  statCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 12px", textAlign: "center" },
  statCardAccent: { background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" },
  statNumber: { fontSize: 36, fontWeight: 800, lineHeight: 1, marginBottom: 6, color: "#f0f0f0" },
  statLabel: { fontSize: 11, fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" },
  progressSection: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px", marginBottom: 24 },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13 },
  progressLabel: { color: "rgba(255,255,255,0.5)", fontFamily: "'DM Mono', monospace" },
  progressCount: { color: "#f0f0f0", fontWeight: 700, fontFamily: "'DM Mono', monospace" },
  progressTrack: { height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden", position: "relative", marginBottom: 10 },
  progressFill: { height: "100%", borderRadius: 99, transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "0 0 12px rgba(96,165,250,0.5)" },
  progressHint: { fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Mono', monospace" },
  actions: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 },
  btnMain: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "1px solid rgba(96,165,250,0.3)", color: "#fff", borderRadius: 16, padding: "18px 32px", fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif", cursor: "pointer", transition: "all 0.15s ease", boxShadow: "0 4px 24px rgba(37,99,235,0.35)", letterSpacing: "0.02em" },
  btnToken: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "linear-gradient(135deg, #d97706, #b45309)", border: "1px solid rgba(251,191,36,0.3)", color: "#fff", borderRadius: 16, padding: "14px 32px", fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif", transition: "all 0.15s ease", boxShadow: "0 4px 20px rgba(217,119,6,0.25)", letterSpacing: "0.02em" },
  btnIcon: { fontSize: 20 },
  tokenAlert: { display: "flex", alignItems: "flex-start", gap: 14, background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: 14, padding: "16px 20px", fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 24, lineHeight: 1.6 },
  tokenAlertIcon: { fontSize: 22, flexShrink: 0 },
  historySection: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px", marginBottom: 24 },
  historyTitle: { fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: "0.15em", color: "rgba(255,255,255,0.35)", marginBottom: 16, textTransform: "uppercase" },
  historyList: { display: "flex", flexDirection: "column", gap: 10 },
  historyItem: { display: "flex", alignItems: "flex-start", gap: 12, animation: "slideUp 0.3s ease" },
  historyDot: (milestone, token) => ({ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5, background: token ? "#34d399" : milestone ? "#fbbf24" : "rgba(255,255,255,0.25)", boxShadow: milestone ? "0 0 8px rgba(251,191,36,0.5)" : token ? "0 0 8px rgba(52,211,153,0.5)" : "none" }),
  historyText: { fontSize: 13, color: "rgba(255,255,255,0.6)", flex: 1, lineHeight: 1.5, fontFamily: "'DM Mono', monospace", fontWeight: 400 },
  historyTime: { fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace", flexShrink: 0, marginTop: 2 },
  btnReset: { display: "block", margin: "0 auto", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.25)", borderRadius: 10, padding: "10px 24px", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer" },
};
