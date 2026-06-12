"use client";
import { useState, useEffect } from "react";

const ALLOWED_NAMES = [
  "vk", "nihal", "keri", "vaishnavi", "vandana",
  "vikas", "among", "joel", "raheel", "disha", "bhumika", "shashank"
];

const GREETINGS = {
  vk: "Welcome back, boss 👑",
  nihal: "Hey Nihal! Ready to crack ADA? 🚀",
  keri: "Welcome Keri! Let's go 💪",
  vaishnavi: "Hey Vaishnavi! Let's ace those algorithms ✨",
  vandana: "Welcome Vandana! Time to learn 📚",
  vikas: "Hey Vikas! Let's do this 🔥",
  among: "Sus entry detected 🟥 Welcome Among!",
  joel: "Hey Joel! Code awaits 💻",
  raheel: "Welcome Raheel! Let's debug the world 🛠️",
  disha: "Hey Disha! Let's explore algorithms 🌟",
  bhumika: "Welcome Bhumika! Ready to learn? 🎯",
  shashank: "Hey Shashank! Let's get started 🚀",
};

export default function AccessGate({ children }) {
  const [phase, setPhase] = useState("loading");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("ada_user");
    if (stored) {
      setPhase("granted");
    } else {
      setPhase("gate");
    }
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
    })));
  }, []);

  const handleSubmit = () => {
    const trimmed = name.trim().toLowerCase();
    if (ALLOWED_NAMES.includes(trimmed)) {
      localStorage.setItem("ada_user", name.trim());
      setPhase("granted");
    } else {
      setError("Name not on the list. Ask VK for access! 🔒");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  if (phase === "loading") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#020617" }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(99,102,241,0.3)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (phase === "granted") {
    return <>{children}</>;
  }

  return (
    <div className="gate-bg">
      {particles.map(p => (
        <div
          key={p.id}
          className="gate-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className={`gate-card${shake ? " gate-shake" : ""}`}>
        <div className="gate-glow-bar" />

        <div className="gate-logo">
          <span className="gate-logo-icon">&#955;</span>
        </div>

        <h1 className="gate-title">ADA Lab Companion</h1>
        <p className="gate-subtitle">Enter your name to get access</p>

        <div className="gate-input-wrap">
          <span className="gate-input-icon">&#128100;</span>
          <input
            id="gate-name-input"
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Your name..."
            className="gate-input"
            autoFocus
            autoComplete="off"
          />
        </div>

        {error && <p className="gate-error">&#9888;&#65039; {error}</p>}

        <button
          id="gate-submit-btn"
          onClick={handleSubmit}
          className="gate-btn"
          disabled={!name.trim()}
        >
          Get Access &#8594;
        </button>

        <p className="gate-footer">Made with &#9825; by VK &middot; ADA Lab {new Date().getFullYear()}</p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        .gate-bg {
          min-height: 100vh;
          background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, #020617 60%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }
        .gate-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.5), transparent);
          animation: floatUp linear infinite;
          pointer-events: none;
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 0.4; }
          50%  { opacity: 0.7; }
          100% { transform: translateY(-120vh) scale(0.4); opacity: 0; }
        }
        .gate-card {
          position: relative;
          background: rgba(11, 19, 41, 0.88);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 420px;
          margin: 1rem;
          box-shadow: 0 0 80px rgba(99,102,241,0.12), 0 0 0 1px rgba(255,255,255,0.03);
          text-align: center;
          animation: cardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: scale(0.85) translateY(32px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .gate-shake { animation: shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both; }
        @keyframes shake {
          10%,90% { transform: translateX(-3px); }
          20%,80% { transform: translateX(5px); }
          30%,50%,70% { transform: translateX(-7px); }
          40%,60% { transform: translateX(7px); }
        }
        .gate-glow-bar {
          position: absolute;
          top: 0; left: 12%; right: 12%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #6366f1, #818cf8, transparent);
          border-radius: 2px;
        }
        .gate-logo {
          width: 72px; height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, #6366f1, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 0 30px rgba(99,102,241,0.45), 0 8px 32px rgba(6,182,212,0.2);
        }
        .gate-logo-icon { font-size: 2.2rem; color: white; font-weight: 700; }
        .gate-title {
          font-size: 1.8rem; font-weight: 700; color: #f8fafc;
          letter-spacing: -0.03em; margin-bottom: 0.4rem;
        }
        .gate-subtitle { color: #94a3b8; font-size: 0.95rem; margin-bottom: 2rem; }
        .gate-input-wrap { position: relative; margin-bottom: 1rem; }
        .gate-input-icon {
          position: absolute; left: 0.9rem; top: 50%;
          transform: translateY(-50%); font-size: 1rem; pointer-events: none;
        }
        .gate-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          background: rgba(30,41,59,0.6);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 12px;
          color: #f8fafc;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .gate-input::placeholder { color: #475569; }
        .gate-input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.22);
        }
        .gate-error {
          color: #f87171; font-size: 0.875rem; margin-bottom: 1rem;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .gate-btn {
          width: 100%; padding: 0.9rem;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          color: white; border: none; border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 1rem; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          letter-spacing: 0.01em; margin-bottom: 1.5rem;
        }
        .gate-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          box-shadow: 0 0 24px rgba(99,102,241,0.5);
          transform: translateY(-2px);
        }
        .gate-btn:active:not(:disabled) { transform: translateY(0); }
        .gate-btn:disabled { opacity: 0.38; cursor: not-allowed; }
        .gate-footer { color: #334155; font-size: 0.8rem; }
      `}</style>
    </div>
  );
}
