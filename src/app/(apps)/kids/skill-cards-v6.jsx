import { useState, useEffect, useRef, useCallback } from "react";

// ─── Data ───
const ROUTINE_ITEMS = [
  { id: "r01", name: "じかんにおきる", emoji: "⏰", sticker: "🌟", cat: "あさ", catEmoji: "🌅" },
  { id: "r02", name: "おはようと言う", emoji: "👋", sticker: "⭐", cat: "あさ", catEmoji: "🌅" },
  { id: "r03", name: "おふとんをたたむ", emoji: "🛏️", sticker: "🧹", cat: "あさ", catEmoji: "🌅" },
  { id: "r04", name: "かおをあらう", emoji: "🧼", sticker: "✨", cat: "あさ", catEmoji: "🌅" },
  { id: "r05", name: "はをみがく（あさ）", emoji: "🪥", sticker: "💎", cat: "あさ", catEmoji: "🌅" },
  { id: "r06", name: "ふくをきがえる", emoji: "👕", sticker: "🎀", cat: "あさ", catEmoji: "🌅" },
  { id: "r07", name: "あさごはんをたべる", emoji: "🍚", sticker: "🏅", cat: "あさ", catEmoji: "🌅" },
  { id: "r08", name: "もちものかくにん", emoji: "🎒", sticker: "📋", cat: "あさ", catEmoji: "🌅" },
  { id: "r09", name: "いただきますを言う", emoji: "🙏", sticker: "🌸", cat: "ひる", catEmoji: "☀️" },
  { id: "r10", name: "てをあらう", emoji: "🫧", sticker: "💠", cat: "ひる", catEmoji: "☀️" },
  { id: "r11", name: "ごちそうさまを言う", emoji: "😊", sticker: "🌼", cat: "ひる", catEmoji: "☀️" },
  { id: "r12", name: "おかたづけする", emoji: "📦", sticker: "🎯", cat: "ひる", catEmoji: "☀️" },
  { id: "r13", name: "おふろにはいる", emoji: "🛁", sticker: "🫧", cat: "よる", catEmoji: "🌙" },
  { id: "r14", name: "パジャマにきがえる", emoji: "🌜", sticker: "🎪", cat: "よる", catEmoji: "🌙" },
  { id: "r15", name: "はをみがく（よる）", emoji: "🦷", sticker: "💫", cat: "よる", catEmoji: "🌙" },
  { id: "r16", name: "あしたのじゅんび", emoji: "📐", sticker: "📝", cat: "よる", catEmoji: "🌙" },
  { id: "r17", name: "おやすみなさいを言う", emoji: "😴", sticker: "🌈", cat: "よる", catEmoji: "🌙" },
];

const SKILL_ITEMS = [
  { id: "s01", name: "あいさつマスター", emoji: "🗣️", sticker: "⭐", cat: "じりつ", catEmoji: "🧒", req: "声かけなしで挨拶3日" },
  { id: "s02", name: "じぶんでたべる", emoji: "🥄", sticker: "🍽️", cat: "じりつ", catEmoji: "🧒", req: "ひとりで完食できた" },
  { id: "s03", name: "ひとりできがえる", emoji: "👔", sticker: "🎀", cat: "じりつ", catEmoji: "🧒", req: "声かけなしで着替え" },
  { id: "s04", name: "トイレひとりで", emoji: "🚽", sticker: "🏆", cat: "じりつ", catEmoji: "🧒", req: "ひとりでトイレ完了" },
  { id: "s05", name: "はみがきマスター", emoji: "🦷", sticker: "💎", cat: "せいけつ", catEmoji: "🧼", req: "仕上げ磨きなしでOK" },
  { id: "s06", name: "すききらいバイバイ", emoji: "🥦", sticker: "🥗", cat: "せいけつ", catEmoji: "🧼", req: "苦手なものも一口" },
  { id: "s07", name: "おかたづけ名人", emoji: "🧹", sticker: "✨", cat: "せいけつ", catEmoji: "🧼", req: "言われる前に片付け" },
  { id: "s08", name: "とけいをみてうごく", emoji: "⏰", sticker: "🕐", cat: "せいけつ", catEmoji: "🧼", req: "時計を見て行動できた" },
  { id: "s09", name: "ありがとう名人", emoji: "💕", sticker: "🌸", cat: "おともだち", catEmoji: "🤝", req: "自分からお礼を言った" },
  { id: "s10", name: "ごめんねが言える", emoji: "🙇", sticker: "💫", cat: "おともだち", catEmoji: "🤝", req: "自分から謝れた" },
  { id: "s11", name: "わけあいマスター", emoji: "🤲", sticker: "🌈", cat: "おともだち", catEmoji: "🤝", req: "おもちゃを貸した" },
  { id: "s12", name: "じゅんばんまてる", emoji: "🧍", sticker: "🔥", cat: "おともだち", catEmoji: "🤝", req: "順番待ちができた" },
  { id: "s13", name: "きもちをつたえる", emoji: "😤", sticker: "🗨️", cat: "こころ", catEmoji: "💪", req: "泣かずに言葉で伝えた" },
  { id: "s14", name: "おてつだいヒーロー", emoji: "🦸", sticker: "🎖️", cat: "こころ", catEmoji: "💪", req: "自分からお手伝い" },
  { id: "s15", name: "やさしさマスター", emoji: "🫶", sticker: "👑", cat: "こころ", catEmoji: "💪", req: "困っている子を助けた" },
  { id: "s16", name: "はなしをきける", emoji: "👂", sticker: "📖", cat: "かんがえる", catEmoji: "🤔", req: "最後まで話を聞けた" },
  { id: "s17", name: "じぶんできめる", emoji: "🧠", sticker: "💡", cat: "かんがえる", catEmoji: "🤔", req: "自分で選んで決めた" },
  { id: "s18", name: "スーパーキッズ", emoji: "🏰", sticker: "🏰", cat: "かんがえる", catEmoji: "🤔", req: "ぜんぶマスター！" },
];

const CATS_RT = ["あさ", "ひる", "よる"];
const CATS_SK = ["じりつ", "せいけつ", "おともだち", "こころ", "かんがえる"];
const PRAISE = ["すごい！", "やったー！！", "がんばったね！", "えらい！！", "さすが！", "かっこいい！", "すばらしい！", "100てん！"];

// ─── Storage helpers ───
const STORAGE_KEY_HISTORY = "dekitayo_history";

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || "[]"); } catch { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(h)); } catch {}
}

// ─── Celebration ───
const Celeb = ({ active, green }) => {
  if (!active) return null;
  const p = green ? ["#2ED573","#6BCB77","#A8E6CF","#FFD93D","#7BED9F","#55E6C1"] : ["#FF6B9D","#FFD93D","#6BCB77","#4D96FF","#FF922B","#C084FC"];
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 998 }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 42%, rgba(${green ? "46,213,115" : "255,217,61"},0.3), transparent 70%)`, animation: "flashBang 0.7s ease-out forwards" }} />
      <div style={{ position: "absolute", left: "50%", top: "38%", width: 0, height: 0 }}>
        {Array.from({ length: 40 }, (_, i) => {
          const a = (i / 40) * Math.PI * 2, s = 70 + Math.random() * 180;
          return <div key={i} style={{ position: "absolute", width: 5 + Math.random() * 10, height: 5 + Math.random() * 10, backgroundColor: p[i % p.length], borderRadius: i % 3 === 0 ? "50%" : "2px", animation: `burstOut ${0.5 + Math.random() * 0.6}s cubic-bezier(0,0.9,0.2,1) ${Math.random() * 0.15}s forwards`, opacity: 0, "--tx": `${Math.cos(a) * s}px`, "--ty": `${Math.sin(a) * s - 30}px` }} />;
        })}
      </div>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={`sr-${i}`} style={{ position: "absolute", left: `${8 + Math.random() * 84}%`, top: -30, fontSize: 18 + Math.random() * 16, animation: `stickerRain ${1.2 + Math.random() * 1.5}s ease-in ${0.2 + Math.random() * 1}s forwards`, "--wobble": `${(Math.random() > 0.5 ? 1 : -1) * 60}px`, opacity: 0 }}>
          {["⭐","✨","🌟","💫","🎉","🎊","💖","🌈","🎀","💎","🏆","🌸"][i]}
        </div>
      ))}
    </div>
  );
};

// ─── Popup ───
const Popup = ({ item, green, onClose }) => {
  const msg = useRef(PRAISE[Math.floor(Math.random() * PRAISE.length)]).current;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(5px)" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: green ? "linear-gradient(160deg, #F0FFF4, #FFFFFF)" : "linear-gradient(160deg, #FFFDF0, #FFFFFF)", borderRadius: 28, padding: "34px 30px 24px", textAlign: "center", maxWidth: 290, width: "85%", boxShadow: `0 0 0 3px ${green ? "#6BCB77" : "#FFD93D"}, 0 20px 60px rgba(0,0,0,0.15)`, animation: "popIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275)", fontFamily: "'Zen Maru Gothic', sans-serif" }}>
        <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 8, animation: "megaBounce 0.7s cubic-bezier(0.175,0.885,0.32,1.275) 0.1s both" }}>{item.sticker}</div>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 16, background: green ? "linear-gradient(90deg, #2ED573, #6BCB77)" : "linear-gradient(90deg, #FF6B9D, #FF922B)", fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: 2, marginBottom: 8, animation: "fadeUp 0.3s ease 0.3s both" }}>✓ DONE!</div>
        <div style={{ fontSize: 19, fontWeight: 900, color: "#2D3142", marginBottom: 12, animation: "fadeUp 0.3s ease 0.4s both" }}>{item.name}</div>
        <div style={{ fontSize: 20, fontWeight: 900, background: green ? "linear-gradient(90deg, #2ED573, #6BCB77, #2ED573)" : "linear-gradient(90deg, #FF6B9D, #FFB020, #FF6B9D)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "fadeUp 0.4s ease 0.5s both, shimmerText 2s linear 1s infinite" }}>{msg}</div>
        <button onClick={onClose} style={{ marginTop: 16, background: green ? "linear-gradient(135deg, #2ED573, #6BCB77)" : "linear-gradient(135deg, #FF6B9D, #FF922B)", color: "#fff", border: "none", borderRadius: 50, padding: "11px 34px", fontSize: 15, fontWeight: 900, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 4px 15px rgba(${green ? "46,213,115" : "255,107,157"},0.35)`, animation: "fadeUp 0.3s ease 0.7s both" }}>やったー！ 🎉</button>
      </div>
    </div>
  );
};

// ─── Card ───
const Card = ({ item, done, onToggle, showReq }) => {
  const [anim, setAnim] = useState(false);
  const handleClick = () => {
    if (!done) setAnim(true);
    onToggle(item);
    if (!done) setTimeout(() => setAnim(false), 500);
  };
  return (
    <div onClick={handleClick} style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 16,
      background: done ? "linear-gradient(135deg, #E8F5E9, #F1F8E9)" : "#fff",
      border: done ? "2px solid #6BCB77" : "2px solid #EEEEEE",
      cursor: "pointer", transition: "all 0.25s",
      boxShadow: done ? "0 3px 10px rgba(107,203,119,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
      transform: anim ? "scale(0.96)" : "scale(1)",
    }}>
      {/* Checkbox */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: done ? 18 : 20, flexShrink: 0, transition: "all 0.3s",
        background: done ? "linear-gradient(135deg, #2ED573, #6BCB77)" : "#F5F5F5",
        ...(anim ? { animation: "checkPop 0.4s ease both" } : {}),
      }}>
        {done ? <span style={{ color: "#fff", fontWeight: 900 }}>✓</span> : item.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 800, color: done ? "#2E7D32" : "#2D3142",
          textDecoration: done ? "line-through" : "none", textDecorationColor: "#A5D6A7",
          fontFamily: "'Zen Maru Gothic', sans-serif",
        }}>{item.name}</div>
        {showReq && item.req && <div style={{ fontSize: 10, color: "#BBB", marginTop: 1, fontFamily: "'Zen Maru Gothic', sans-serif" }}>{item.req}</div>}
      </div>
      <div style={{ fontSize: 22, flexShrink: 0, opacity: done ? 1 : 0.15, transition: "opacity 0.3s" }}>
        {item.sticker}
      </div>
    </div>
  );
};

// ─── Achievement Gallery ───
const AchievementView = ({ history, onClose }) => {
  // Group by date
  const grouped = {};
  history.forEach(entry => {
    const d = entry.date;
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(entry);
  });
  const dates = Object.keys(grouped).sort().reverse();
  const totalBadges = history.length;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, background: "linear-gradient(170deg, #FFFEF5, #FFF8EC, #FFF5F5)", overflowY: "auto", fontFamily: "'Zen Maru Gothic', sans-serif" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 4 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#2D3142" }}>🏆 じっせきかくにん</div>
          <div style={{ fontSize: 11, color: "#999", fontWeight: 700 }}>これまでにもらったバッジ</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #FFD93D, #FFB020)", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 900, color: "#fff" }}>
          {totalBadges}コ
        </div>
      </div>

      {/* All-time sticker wall */}
      <div style={{ padding: "16px 20px 8px" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#BBB", marginBottom: 10, letterSpacing: 1 }}>🎖️ バッジコレクション</div>
          {totalBadges === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#DDD", fontSize: 14, fontWeight: 700 }}>
              まだバッジがありません。ルーチンやスキルをクリアしよう！
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {history.map((entry, i) => (
                <div key={i} style={{
                  fontSize: 28, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(135deg, #FFFDE7, #FFF8E1)", borderRadius: 12,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)", animation: `fadeUp 0.2s ease ${Math.min(i * 0.02, 0.5)}s both`,
                }} title={`${entry.name} (${entry.date})`}>
                  {entry.sticker}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div style={{ padding: "8px 20px 40px" }}>
        {dates.map(date => {
          const entries = grouped[date];
          const isToday = date === new Date().toISOString().split("T")[0];
          return (
            <div key={date} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: isToday ? "#2ED573" : "#BBB" }}>
                  {isToday ? "📅 きょう" : `📅 ${date.slice(5).replace("-", "/")}`}
                </div>
                <div style={{ flex: 1, height: 1, background: "#EEE" }} />
                <div style={{ fontSize: 11, fontWeight: 800, color: "#DDD" }}>{entries.length}コ</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {entries.map((entry, j) => (
                  <div key={j} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "6px 10px 6px 8px",
                    background: "#fff", borderRadius: 12, border: "1px solid #F0F0F0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                    <span style={{ fontSize: 18 }}>{entry.sticker}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#666", fontFamily: "'Zen Maru Gothic', sans-serif" }}>{entry.name}</span>
                    <span style={{ fontSize: 9, color: "#CCC", fontWeight: 600 }}>{entry.type === "routine" ? "🔄" : "🗺️"}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Progress Bar ───
const Bar = ({ n, total, green }) => {
  const pct = total > 0 ? (n / total) * 100 : 0;
  return (
    <div style={{ background: green ? "#C8E6C9" : "#F0E6D3", borderRadius: 20, height: 20, position: "relative", overflow: "hidden", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ height: "100%", borderRadius: 20, background: green ? "linear-gradient(90deg, #2ED573, #6BCB77, #A8E6CF)" : "linear-gradient(90deg, #FF6B9D, #FF922B, #FFD93D)", backgroundSize: "200% auto", animation: n > 0 ? "shimmerBar 2s linear infinite" : "none", width: `${pct}%`, transition: "width 0.6s ease" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: pct > 45 ? "#fff" : "#2D3142" }}>{n} / {total}</div>
    </div>
  );
};

// ─── Main ───
export default function App() {
  const [tab, setTab] = useState("routine");
  const [rtDone, setRtDone] = useState(new Set());
  const [skDone, setSkDone] = useState(new Set());
  const [popup, setPopup] = useState(null);
  const [popGreen, setPopGreen] = useState(true);
  const [celeb, setCeleb] = useState(false);
  const [celebG, setCelebG] = useState(true);
  const [showAchiev, setShowAchiev] = useState(false);
  const [history, setHistory] = useState(() => loadHistory());
  const [streak] = useState(3);

  useEffect(() => { saveHistory(history); }, [history]);

  const today = new Date().toISOString().split("T")[0];

  const addToHistory = useCallback((item, type) => {
    setHistory(prev => {
      const entry = { sticker: item.sticker, name: item.name, type, date: today, ts: Date.now() };
      const next = [...prev, entry];
      return next;
    });
  }, [today]);

  const toggleRoutine = (item) => {
    const wasDone = rtDone.has(item.id);
    setRtDone(prev => {
      const next = new Set(prev);
      if (wasDone) next.delete(item.id); else next.add(item.id);
      return next;
    });
    if (!wasDone) {
      addToHistory(item, "routine");
      setCelebG(true); setCeleb(true); setPopup(item); setPopGreen(true);
      setTimeout(() => setCeleb(false), 2500);
    }
  };

  const toggleSkill = (item) => {
    const wasDone = skDone.has(item.id);
    setSkDone(prev => {
      const next = new Set(prev);
      if (wasDone) next.delete(item.id); else next.add(item.id);
      return next;
    });
    if (!wasDone) {
      addToHistory(item, "skill");
      setCelebG(false); setCeleb(true); setPopup(item); setPopGreen(false);
      setTimeout(() => setCeleb(false), 2500);
    }
  };

  const rtTotal = ROUTINE_ITEMS.length, rtCount = rtDone.size;
  const skTotal = SKILL_ITEMS.length, skCount = skDone.size;

  const resetRoutine = () => { setRtDone(new Set()); setPopup(null); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;700;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;-webkit-user-select:none;user-select:none}
        @keyframes flashBang{0%{opacity:1}100%{opacity:0}}
        @keyframes burstOut{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0}}
        @keyframes stickerRain{0%{transform:translateY(0) translateX(0) rotate(0);opacity:1}100%{transform:translateY(105vh) translateX(var(--wobble)) rotate(360deg);opacity:.6}}
        @keyframes popIn{0%{transform:scale(.2) rotate(-8deg);opacity:0}60%{transform:scale(1.05) rotate(1deg)}100%{transform:scale(1) rotate(0);opacity:1}}
        @keyframes megaBounce{0%{transform:scale(0) rotate(-20deg)}40%{transform:scale(1.4) rotate(5deg)}60%{transform:scale(.85)}80%{transform:scale(1.1)}100%{transform:scale(1)}}
        @keyframes fadeUp{0%{transform:translateY(12px);opacity:0}100%{transform:translateY(0);opacity:1}}
        @keyframes shimmerText{0%{background-position:0% center}100%{background-position:200% center}}
        @keyframes shimmerBar{0%{background-position:0% center}100%{background-position:200% center}}
        @keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        @keyframes streakGlow{0%,100%{text-shadow:0 0 6px rgba(255,146,43,.2)}50%{text-shadow:0 0 14px rgba(255,146,43,.5)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
      `}</style>

      <Celeb active={celeb} green={celebG} />
      {popup && <Popup item={popup} green={popGreen} onClose={() => setPopup(null)} />}
      {showAchiev && <AchievementView history={history} onClose={() => setShowAchiev(false)} />}

      <div style={{ minHeight: "100vh", fontFamily: "'Zen Maru Gothic', sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", background: tab === "routine" ? "linear-gradient(170deg, #EAFAF1 0%, #F0FFF4 40%, #F8FFFC 100%)" : "linear-gradient(170deg, #FFF8F0 0%, #FFF3E6 40%, #FFF5F5 100%)", transition: "background 0.5s" }}>

        {/* Header */}
        <div style={{ padding: "14px 20px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: 3, color: tab === "routine" ? "#2ED573" : "#FF6B9D" }}>✦ できたよ！ ✦</div>
            <button onClick={() => setShowAchiev(true)} style={{ background: "linear-gradient(135deg, #FFD93D, #FFB020)", border: "none", borderRadius: 50, padding: "7px 14px", fontSize: 11, fontWeight: 900, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(255,176,32,0.3)", display: "flex", alignItems: "center", gap: 4 }}>
              🏆 <span>{history.length}</span>
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, margin: "10px 0 0", background: "rgba(0,0,0,0.05)", borderRadius: 16, padding: 3 }}>
            {[{ key: "routine", label: "🔄 ルーチン", color: "#2ED573" }, { key: "skill", label: "🗺️ できること", color: "#FF6B9D" }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ flex: 1, padding: "9px 6px 7px", border: "none", borderRadius: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.25s", background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? t.color : "#BBB", boxShadow: tab === t.key ? "0 2px 8px rgba(0,0,0,0.08)" : "none", fontSize: 13, fontWeight: 800 }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* ─── ROUTINE TAB ─── */}
        {tab === "routine" && (
          <div style={{ flex: 1, padding: "12px 20px 80px", overflowY: "auto" }}>
            {/* Progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}><Bar n={rtCount} total={rtTotal} green /></div>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#FF922B", whiteSpace: "nowrap", animation: "streakGlow 2s ease infinite" }}>🔥{streak}日</div>
            </div>

            {rtCount === rtTotal && (
              <div style={{ textAlign: "center", padding: "10px", marginBottom: 12, borderRadius: 16, background: "linear-gradient(135deg, #E8F5E9, #F1F8E9)", border: "2px solid #6BCB77", animation: "fadeUp 0.4s ease both" }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#2E7D32" }}>🎉 きょうのルーチンコンプリート！</span>
              </div>
            )}

            {CATS_RT.map(cat => {
              const items = ROUTINE_ITEMS.filter(r => r.cat === cat);
              const catDone = items.filter(r => rtDone.has(r.id)).length;
              const catEmoji = items[0]?.catEmoji;
              return (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <span style={{ fontSize: 16 }}>{catEmoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#555" }}>{cat}</span>
                    <span style={{ fontSize: 10, color: "#BBB", fontWeight: 700, marginLeft: "auto" }}>{catDone}/{items.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {items.map(item => <Card key={item.id} item={item} done={rtDone.has(item.id)} onToggle={toggleRoutine} />)}
                  </div>
                </div>
              );
            })}

            {rtCount > 0 && (
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <button onClick={resetRoutine} style={{ background: "rgba(255,255,255,0.9)", border: "1.5px solid #C8E6C9", borderRadius: 50, padding: "8px 20px", fontSize: 12, fontWeight: 700, color: "#999", cursor: "pointer", fontFamily: "inherit" }}>🔄 きょうのリセット</button>
              </div>
            )}
          </div>
        )}

        {/* ─── SKILL TAB ─── */}
        {tab === "skill" && (
          <div style={{ flex: 1, padding: "12px 20px 80px", overflowY: "auto" }}>
            <div style={{ marginBottom: 14 }}><Bar n={skCount} total={skTotal} /></div>

            {skCount === skTotal && (
              <div style={{ textAlign: "center", padding: "10px", marginBottom: 12, borderRadius: 16, background: "linear-gradient(135deg, #FFF8E1, #FFF3CD)", border: "2px solid #FFB020" }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: "#E65100", animation: "float 2s ease infinite", display: "inline-block" }}>🏰 スーパーキッズ達成！ 🏰</span>
              </div>
            )}

            {CATS_SK.map(cat => {
              const items = SKILL_ITEMS.filter(s => s.cat === cat);
              const catDone = items.filter(s => skDone.has(s.id)).length;
              const catEmoji = items[0]?.catEmoji;
              return (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <span style={{ fontSize: 16 }}>{catEmoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: "#555" }}>{cat}</span>
                    <span style={{ fontSize: 10, color: "#BBB", fontWeight: 700, marginLeft: "auto" }}>{catDone}/{items.length}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {items.map(item => <Card key={item.id} item={item} done={skDone.has(item.id)} onToggle={toggleSkill} showReq />)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
