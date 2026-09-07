import React, { useState } from "react";
import { api } from "../api";

export default function Login({ onSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await api.login(username.trim(), password);
      } else {
        await api.register(username.trim(), password);
      }
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    marginBottom: 14,
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          width: 360,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-card)",
          borderRadius: 14,
          padding: 32,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            M
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
            MatchPulse
          </div>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 700,
            margin: "0 0 6px",
            color: "var(--text-primary)",
          }}
        >
          {mode === "login" ? "Log in" : "Create an account"}
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text-muted)", margin: "0 0 20px" }}>
          {mode === "login" ? "Welcome back — sign in to view the dashboard." : "Takes 10 seconds, no email needed."}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            style={inputStyle}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <div
              style={{
                color: "var(--coral)",
                background: "var(--coral-dim)",
                border: "1px solid var(--coral)",
                borderRadius: 8,
                padding: "8px 12px",
                fontFamily: "var(--font-body)",
                fontSize: 12.5,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px 0",
              borderRadius: 8,
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "default" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 18, fontFamily: "var(--font-body)", fontSize: 13 }}>
          {mode === "login" ? (
            <span style={{ color: "var(--text-secondary)" }}>
              No account?{" "}
              <button
                onClick={() => { setMode("register"); setError(null); }}
                style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, padding: 0 }}
              >
                Sign up
              </button>
            </span>
          ) : (
            <span style={{ color: "var(--text-secondary)" }}>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setError(null); }}
                style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, padding: 0 }}
              >
                Log in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
