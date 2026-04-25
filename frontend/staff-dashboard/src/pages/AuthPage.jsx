import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ defaultMode = "register", onSuccess }) {
  const [mode, setMode]         = useState(defaultMode);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const { register, login }     = useAuth();

  // Register form state
  const [regForm, setRegForm] = useState({
    name: "", email: "", password: "",
    role: "Security Manager", organization: ""
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "", password: ""
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!regForm.name || !regForm.email ||
        !regForm.password || !regForm.organization) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      await register(regForm);
      setLoading(false);
      onSuccess();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(loginForm.email, loginForm.password);
      setLoading(false);
      onSuccess();
    } catch (err) {
      setError("Invalid credentials. Try registering first.");
      setLoading(false);
    }
  };

  const inputClass = `w-full bg-gray-800 border border-gray-600
    rounded-xl px-4 py-3 text-white placeholder-gray-500
    focus:outline-none focus:border-red-500 transition`;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      minHeight: "100vh",
      background: "#050508",
      color: "white",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      
      {/* LEFT — Form */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: "48px",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        overflowY: "auto"
      }}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">⚡</div>
            <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "3px" }}>AEGIS</h1>
            <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">
              Crisis Intelligence Platform
            </p>
          </div>

          {/* Card */}
          <div className="bg-gray-900/50 rounded-2xl p-8 border border-white/5 backdrop-blur-xl">

            {/* Tab toggle */}
            <div className="flex gap-2 mb-6 bg-gray-800/50 rounded-xl p-1">
              {["register", "login"].map(m => (
                <button key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition
                    ${mode === m
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                      : "text-gray-400 hover:text-white"}`}>
                  {m === "register" ? "Create Account" : "Sign In"}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-xl p-3 mb-4 text-red-300 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Register Form */}
            {mode === "register" && (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block uppercase tracking-tighter">Full Name</label>
                  <input
                    placeholder="Ravi Kumar"
                    value={regForm.name}
                    onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block uppercase tracking-tighter">Work Email</label>
                  <input
                    type="email"
                    placeholder="ravi@grandmeridian.com"
                    value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block uppercase tracking-tighter">Organization</label>
                  <input
                    placeholder="Grand Meridian Hotel"
                    value={regForm.organization}
                    onChange={e => setRegForm({ ...regForm, organization: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block uppercase tracking-tighter">Your Role</label>
                  <select
                    value={regForm.role}
                    onChange={e => setRegForm({ ...regForm, role: e.target.value })}
                    className={inputClass}>
                    <option>Security Manager</option>
                    <option>Hotel Manager</option>
                    <option>Facility Manager</option>
                    <option>Safety Officer</option>
                    <option>Operations Head</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block uppercase tracking-tighter">Password</label>
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    value={regForm.password}
                    onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black py-3 rounded-xl transition mt-2 shadow-lg shadow-red-600/30">
                  {loading ? "Creating account..." : "Create Account →"}
                </button>
              </form>
            )}

            {/* Login Form */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block uppercase tracking-tighter">Email</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={loginForm.email}
                    onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block uppercase tracking-tighter">Password</label>
                  <input
                    type="password"
                    placeholder="Your password"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black py-3 rounded-xl transition mt-2 shadow-lg shadow-red-600/30">
                  {loading ? "Signing in..." : "Sign In →"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-gray-600 text-[10px] mt-6 tracking-widest uppercase">
            Protected by AEGIS Security Protocol v2.0
          </p>
        </div>
      </div>

      {/* RIGHT — Image */}
      <div style={{ position: "relative", overflow: "hidden" }} className="max-md:hidden">
        <img
          src="/images/cctv-fire.jpg"
          alt=""
          style={{
            width: "100%", height: "100%",
            objectFit: "cover", opacity: 0.6
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, #050508 0%, transparent 60%)"
        }} />
        {/* Overlay text */}
        <div style={{
          position: "absolute", bottom: "48px", left: "48px",
          right: "48px"
        }}>
          <p style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "64px", color: "white",
            letterSpacing: "3px", lineHeight: 1
          }}>
            EVERY SECOND<br/>
            <span style={{ color: "#e81c1c" }}>MATTERS.</span>
          </p>
          <p style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "16px", marginTop: "16px",
            maxWidth: "400px", lineHeight: 1.6
          }}>
            AEGIS detects threats in under 15 seconds.
            Automated triage, routing, and dispatch without human intervention.
          </p>
        </div>
      </div>
    </div>
  );
}
