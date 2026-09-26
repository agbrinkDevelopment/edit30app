import React, { useState } from "react";
import { Role } from "../context/AuthContext";

const ADMIN_CODE = "300030";
const PLAYER_CODE = "100100";

interface Props {
  onSignIn: (teamName: string, role: Role) => void;
}

export default function SignIn({ onSignIn }: Props) {
  const [teamName, setTeamName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      triggerError("Fyll i ett lagnamn.");
      return;
    }
    if (code === ADMIN_CODE) {
      onSignIn(teamName.trim(), "admin");
      return;
    }
    if (code === PLAYER_CODE) {
      onSignIn(teamName.trim(), "player");
      return;
    }
    triggerError("Fel kod. Försök igen.");
  };

  const triggerError = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(val);
    setError("");
  };

  return (
    <div style={styles.page}>
      {/* Left floral strip */}
      <div
        className="signin-floral"
        style={{
          ...styles.floralStrip,
          left: 0,
          backgroundPosition: "left center",
        }}
      />
      {/* Right floral strip */}
      <div
        className="signin-floral"
        style={{
          ...styles.floralStrip,
          right: 0,
          backgroundPosition: "right center",
          transform: "scaleX(-1)",
        }}
      />

      <div className="signin-content" style={styles.content}>
        <h1 className="signin-title" style={styles.title}>
          Edit 30 år
        </h1>
        <p className="signin-subtitle" style={styles.subtitle}>
          Mordmysterium
        </p>

        <div
          style={{
            ...styles.card,
            animation: shake ? "shake 0.4s ease" : undefined,
          }}
        >
          <img
            src="/other/raggen-dodar.jpg"
            alt="Raggen Dödar"
            style={styles.banner}
          />
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Lagnamn</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Lagnamn..."
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setError("");
                }}
                autoFocus
                autoComplete="off"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Kod</label>
              <input
                style={{ ...styles.input, ...styles.codeInput }}
                type="text"
                inputMode="numeric"
                placeholder="• • • • • •"
                value={code}
                onChange={handleCodeChange}
                maxLength={6}
                autoComplete="off"
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button
              type="submit"
              style={{
                ...styles.btn,
                opacity: teamName && code.length === 6 ? 1 : 0.6,
              }}
            >
              Gå vidare
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-8px); }
          40%       { transform: translateX(8px); }
          60%       { transform: translateX(-6px); }
          80%       { transform: translateX(6px); }
        }
        @media (max-width: 480px) {
          .signin-floral { display: none !important; }
          .signin-content { padding: 32px 16px !important; }
          .signin-title { font-size: 44px !important; }
          .signin-subtitle { font-size: 24px !important; margin-bottom: 20px !important; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Cormorant Garamond', serif",
  },
  floralStrip: {
    position: "absolute",
    top: 0,
    width: "22%",
    maxWidth: 220,
    height: "100%",
    backgroundImage: "url('/other/flowers.webp')",
    backgroundSize: "cover",
    WebkitMaskImage:
      "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
    maskImage:
      "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
    pointerEvents: "none",
  },
  content: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 24px",
    width: "100%",
    maxWidth: 480,
  },
  title: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: 72,
    fontWeight: 400,
    color: "#141414",
    margin: "0 0 8px",
    lineHeight: 1.1,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "'Creepster', cursive",
    fontSize: 34,
    fontWeight: 400,
    color: "#a40000",
    margin: "0 0 30px",
    textAlign: "center",
  },
  banner: {
    width: "100%",
    borderRadius: 8,
    marginBottom: 24,
    display: "block",
  },
  card: {
    background: "#fff",
    border: "1px solid #d2d2d2",
    borderRadius: 16,
    padding: "18px 18px",
    width: "100%",
    maxWidth: 540,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#6b4a2f",
    letterSpacing: 0.4,
    fontFamily: "'Cormorant Garamond', serif",
    textTransform: "uppercase",
  },
  input: {
    background: "rgba(255,255,255,0.7)",
    border: "1px solid #d2d2d2",
    borderRadius: 8,
    color: "#141414",
    padding: "10px 14px",
    fontSize: 16,
    fontFamily: "'Cormorant Garamond', serif",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  codeInput: {
    letterSpacing: 8,
    fontSize: 22,
    textAlign: "center",
    fontWeight: 600,
  },
  error: {
    background: "rgba(255,255,255,0.5)",
    borderRadius: 8,
    fontStyle: "bold",
    color: "#8d002a",
    fontSize: 14,
  },
  btn: {
    background: "#a40000",
    color: "#ffffff",
    border: "none",
    borderRadius: 8,
    padding: "12px",
    fontSize: 17,
    fontWeight: 600,
    fontFamily: "'Cormorant Garamond', serif",
    letterSpacing: 0.5,
    cursor: "pointer",
    marginTop: 4,
    transition: "opacity 0.15s",
  },
};
