"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const VALID_CREDENTIALS = [
  { username: "admin", password: "savra2024" },
  { username: "principal", password: "savra@school" },
];

export default function LandingPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("savra_auth") === "true") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (showLogin) {
      setTimeout(() => usernameRef.current?.focus(), 80);
    }
  }, [showLogin]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const match = VALID_CREDENTIALS.find(
        (c) => c.username === username.trim() && c.password === password
      );
      if (match) {
        sessionStorage.setItem("savra_auth", "true");
        setAuthed(true);
        setShowLogin(false);
        router.push("/dashboard");
      } else {
        setError("Invalid username or password.");
      }
      setLoading(false);
    }, 600);
  }

  function handleViewData() {
    if (authed) {
      router.push("/dashboard");
    } else {
      setShowLogin(true);
    }
  }

  return (
    <div className="landing">
      <div className="landing-logo">SAVRA</div>
      <p className="landing-tagline">Principal Intelligence Dashboard · Teacher Analytics at a glance</p>
      <button className="btn-view-data" onClick={handleViewData}>
        {authed ? "View Data →" : "Sign In to Continue →"}
      </button>

      {showLogin && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 999,
            animation: "fadeIn 0.2s ease",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}
        >
          <div style={{
            background: "linear-gradient(160deg, #141c2e 0%, #1a2235 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 24,
            padding: "40px 44px",
            width: "100%", maxWidth: 420,
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)",
            animation: "slideUp 0.25s ease",
          }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, margin: "0 auto 16px",
                boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
              }}>🔐</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.02em" }}>
                Welcome to SAVRA
              </h2>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
                Sign in to access the dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                  Username
                </label>
                <input
                  ref={usernameRef}
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder="Enter username"
                  autoComplete="username"
                  style={{
                    width: "100%", padding: "12px 16px",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${error ? "rgba(244,63,94,0.5)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 12,
                    color: "#f1f5f9", fontSize: 14, fontFamily: "inherit",
                    outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                  onBlur={e => (e.target.style.borderColor = error ? "rgba(244,63,94,0.5)" : "rgba(255,255,255,0.08)")}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    style={{
                      width: "100%", padding: "12px 44px 12px 16px",
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${error ? "rgba(244,63,94,0.5)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 12,
                      color: "#f1f5f9", fontSize: 14, fontFamily: "inherit",
                      outline: "none", transition: "border-color 0.2s",
                    }}
                    onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
                    onBlur={e => (e.target.style.borderColor = error ? "rgba(244,63,94,0.5)" : "rgba(255,255,255,0.08)")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "#64748b", fontSize: 16, padding: 4,
                    }}
                  >{showPass ? "🙈" : "👁️"}</button>
                </div>
              </div>

              {error && (
                <div style={{
                  background: "rgba(244,63,94,0.1)",
                  border: "1px solid rgba(244,63,94,0.3)",
                  borderRadius: 10, padding: "10px 14px",
                  fontSize: 13, color: "#f43f5e",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username || !password}
                style={{
                  marginTop: 4,
                  background: loading || !username || !password
                    ? "rgba(99,102,241,0.4)"
                    : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "white", border: "none",
                  padding: "14px", borderRadius: 12,
                  fontSize: 15, fontWeight: 700, fontFamily: "inherit",
                  cursor: loading || !username || !password ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: loading || !username || !password ? "none" : "0 4px 24px rgba(99,102,241,0.4)",
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <button
              onClick={() => setShowLogin(false)}
              style={{
                display: "block", width: "100%", marginTop: 16,
                background: "none", border: "none", cursor: "pointer",
                color: "#64748b", fontSize: 13, fontFamily: "inherit",
                padding: 6,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
