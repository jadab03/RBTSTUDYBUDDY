import { C } from "../data/constants.js";

export const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Lora:ital,wght@0,500;0,700;1,500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{background:${C.bg};font-family:'Nunito',sans-serif;-webkit-font-smoothing:antialiased;}
    ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-thumb{background:${C.sand};border-radius:4px;}
    .bt{background:${C.teal};color:#fff;border:none;border-radius:10px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;transition:all .15s;}
    .bt:hover{background:${C.tealDark};transform:translateY(-1px);}
    .br{background:${C.rose};color:${C.roseDeep};border:none;border-radius:10px;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;transition:all .15s;}
    .br:hover{background:${C.roseDark};color:#fff;}
    .bg{background:transparent;color:${C.sandDark};border:1.5px solid ${C.border};border-radius:10px;font-family:'Nunito',sans-serif;font-weight:600;cursor:pointer;transition:all .14s;}
    .bg:hover{border-color:${C.teal};color:${C.tealDark};}
    .so{transition:all .15s;cursor:pointer;}.so:hover{border-color:${C.teal}!important;background:${C.mint}40!important;}
    .ni{transition:all .13s;cursor:pointer;}.ni:hover{background:rgba(255,255,255,.08)!important;color:#fff!important;}
    input:focus,textarea:focus{border-color:${C.teal}!important;outline:none;box-shadow:0 0 0 3px ${C.mint}50;}
    .bdim{filter:grayscale(1);opacity:.35;}
    .flip-scene{perspective:1000px;}
    .flip-card{width:100%;transition:transform .5s cubic-bezier(.4,0,.2,1);transform-style:preserve-3d;position:relative;}
    .flip-card.flipped{transform:rotateY(180deg);}
    .flip-face{backface-visibility:hidden;-webkit-backface-visibility:hidden;}
    .flip-back{transform:rotateY(180deg);}
    @media(max-width:640px){.sd{display:none!important;}.mn{display:flex!important;}.mw{padding-bottom:72px!important;}.tb{padding:12px 16px!important;}.pg{padding:16px 14px!important;}.g2{grid-template-columns:1fr!important;}.sg{grid-template-columns:1fr 1fr!important;}.sw{grid-column:span 2;}}
    @media(min-width:641px){.mn{display:none!important;}}
  `}</style>
);

export const inputStyle = (extra = {}) => ({
  width: "100%",
  padding: "11px 14px",
  borderRadius: "10px",
  border: `1.5px solid ${C.border}`,
  fontSize: "14px",
  color: C.charcoal,
  background: C.alt,
  marginBottom: "10px",
  fontFamily: "'Nunito',sans-serif",
  ...extra,
});

export const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: C.surface,
      borderRadius: "14px",
      padding: "18px 20px",
      boxShadow: "0 2px 12px rgba(61,84,80,.07)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const wrapStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: `linear-gradient(150deg,${C.mint}60 0%,${C.cream} 50%,${C.blush}80 100%)`,
  padding: "24px",
};

export const boxStyle = (maxW = "510px") => ({
  background: C.surface,
  borderRadius: "22px",
  padding: "42px 36px",
  width: "100%",
  maxWidth: maxW,
  boxShadow: "0 8px 48px rgba(61,84,80,.12)",
});
