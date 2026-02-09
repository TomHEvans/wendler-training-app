// Edit src/App.jsx to start building!
import React, { useMemo, useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("Tom");

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    const part =
      hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
    return `Good ${part}, ${name || "friend"}!`;
  }, [name]);

  const card = {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    maxWidth: 680,
    margin: "40px auto",
    padding: 24,
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    lineHeight: 1.5
  };

  const row = {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap"
  };

  const button = {
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer"
  };

  const ghost = {
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer"
  };

  const input = {
    border: "1px solid #d1d5db",
    padding: "10px 12px",
    borderRadius: 12,
    width: 220
  };

  return (
    <div style={card}>
      <h1 style={{ marginTop: 0 }}>{greeting}</h1>
      <p style={{ marginBottom: 18 }}>
        This is a minimal Vite + React app deployed via GitHub Actions to GitHub Pages.
        Edit <code>src/App.jsx</code> and push to redeploy.
      </p>

      <div style={row}>
        <button style={button} onClick={() => setCount((c) => c + 1)}>
          Clicked {count} {count === 1 ? "time" : "times"}
        </button>
        <button style={ghost} onClick={() => setCount(0)}>
          Reset
        </button>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "20px 0" }} />

      <div style={row}>
        <label htmlFor="name" style={{ fontWeight: 600 }}>
          Your name
        </label>
        <input
          id="name"
          style={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Type something"
          aria-label="Your name"
        />
        <span style={{ opacity: 0.75 }}>
          Try changing this and refresh. State resets on reload.
        </span>
      </div>

      <p style={{ marginTop: 22, fontSize: 14, opacity: 0.8 }}>
        Deployed URL format: <code>https://&lt;username&gt;.github.io/my-vite-react-app/</code>
      </p>
    </div>
  );
}
