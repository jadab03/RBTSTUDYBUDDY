import { useState } from "react";
import { C } from "../data/constants.js";
import { loadUser } from "../utils/storage.js";
import { inputStyle, wrapStyle, boxStyle } from "./ui.jsx";

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [un, setUn] = useState("");
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [load, setLoad] = useState(false);

  const go = async () => {
    if (!un.trim() || !pw.trim() || (mode === "signup" && !em.trim())) {
      setErr("Please fill in all fields.");
      return;
    }
    setErr("");
    setLoad(true);
    const ex = loadUser(un.trim());
    if (mode === "login") {
      if (!ex) { setErr("Username not found."); setLoad(false); return; }
      onAuth({ ...ex, isNew: false });
    } else {
      if (ex) { setErr("Username taken."); setLoad(false); return; }
      onAuth({ username: un.trim(), email: em.trim(), isNew: true });
    }
    setLoad(false);
  };

  return (
    <div style={wrapStyle}>
      <div style={boxStyle()}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "30px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
            {"\u{1F9E0}"}
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "800", color: C.charcoal, fontFamily: "'Lora',serif" }}>RBT Compass</div>
            <div style={{ fontSize: "11px", color: C.sandDark, letterSpacing: "0.8px", textTransform: "uppercase", fontWeight: "700" }}>Study Companion</div>
          </div>
        </div>

        <div style={{ fontSize: "22px", fontWeight: "800", color: C.charcoal, marginBottom: "4px", fontFamily: "'Lora',serif" }}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </div>
        <div style={{ fontSize: "13px", color: C.sandDark, marginBottom: "20px" }}>
          {mode === "login" ? "Sign in with your username" : "Choose a username and email for account recovery"}
        </div>

        {err && (
          <div style={{ background: C.blush, border: `1px solid ${C.rose}`, borderRadius: "9px", padding: "10px 13px", fontSize: "13px", color: C.roseDeep, marginBottom: "12px", fontWeight: "600" }}>
            {err}
          </div>
        )}

        <label style={{ fontSize: "12px", fontWeight: "700", color: C.sandDeep, display: "block", marginBottom: "5px" }}>USERNAME</label>
        <input style={inputStyle()} placeholder="e.g. jsmith_rbt" value={un} onChange={(e) => setUn(e.target.value.replace(/\s/g, ""))} onKeyDown={(e) => e.key === "Enter" && go()} />

        {mode === "signup" && (
          <>
            <label style={{ fontSize: "12px", fontWeight: "700", color: C.sandDeep, display: "block", marginBottom: "5px" }}>EMAIL ADDRESS</label>
            <input style={inputStyle()} placeholder="you@email.com" type="email" value={em} onChange={(e) => setEm(e.target.value)} />
          </>
        )}

        <label style={{ fontSize: "12px", fontWeight: "700", color: C.sandDeep, display: "block", marginBottom: "5px" }}>PASSWORD</label>
        <input style={inputStyle({ marginBottom: "20px" })} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} />

        <button className="bt" style={{ width: "100%", padding: "13px", fontSize: "15px", opacity: load ? 0.6 : 1 }} onClick={go}>
          {load ? "Loading\u2026" : mode === "login" ? "Sign in ->" : "Create account ->"}
        </button>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: C.sandDark }}>
          <span style={{ cursor: "pointer", color: C.roseDark, fontWeight: "700" }} onClick={() => { setMode((m) => (m === "login" ? "signup" : "login")); setErr(""); }}>
            {mode === "login" ? "No account? Sign up" : "Already have one? Sign in"}
          </span>
        </div>

        {mode === "signup" && (
          <div style={{ marginTop: "14px", padding: "10px 12px", borderRadius: "9px", background: C.blush, border: `1px solid ${C.rose}`, fontSize: "12px", color: C.sandDeep }}>
            Your email is only used for account recovery.
          </div>
        )}
      </div>
    </div>
  );
}
