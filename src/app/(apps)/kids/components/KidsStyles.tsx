'use client'

/** Kids アプリ用CSS keyframeアニメーション */
export const KidsKeyframes = () => (
  <style>{`
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
)
