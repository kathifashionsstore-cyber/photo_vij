// src/pages/admin/Login.jsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const { user, role, loading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [email,    setEmail]    = useState("snaplica@gmail.com");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [signingIn, setSigningIn] = useState(false);

  // If already logged in as admin, go straight to dashboard
  if (!loading && user && ["admin","superadmin","manager"].includes(role)) {
    const destination = location.state?.from?.pathname || "/admin/dashboard";
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSigningIn(true);

    try {
      // 1. Sign in with Firebase Auth
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // 2. Check Firestore for admin role
      const userSnap = await getDoc(doc(db, "users", credential.user.uid));
      
      if (!userSnap.exists()) {
        await auth.signOut();
        setError("Admin account not configured. Contact support.");
        setSigningIn(false);
        return;
      }

      const userData = userSnap.data();
      const adminRoles = ["admin", "superadmin", "manager"];

      if (!adminRoles.includes(userData.role)) {
        await auth.signOut();
        setError("You do not have admin access.");
        setSigningIn(false);
        return;
      }

      // 3. Success → navigate to intended page or dashboard
      const destination = location.state?.from?.pathname || "/admin/dashboard";
      navigate(destination, { replace: true });

    } catch (err) {
      console.error("Login error:", err.code);
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/invalid-email") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Check your internet connection.");
      } else {
        setError("Login failed: " + err.message);
      }
      setSigningIn(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#060608",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      {/* Glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 600px 400px at 50% 40%, rgba(201,162,39,0.07), transparent)"
      }} />

      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "400px",
        background: "#0f0f12",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "20px",
        padding: "40px 36px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)"
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src="/logo.webp"
            alt="Snaplica Photography"
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "18px",
              margin: "0 auto 14px",
              objectFit: "contain",
              boxShadow: "0 8px 24px rgba(201,162,39,0.3)",
              background: "rgba(255,255,255,0.04)"
            }}
          />
          <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: "700", margin: "0 0 4px", fontFamily: "Georgia, serif" }}>
            Snaplica
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", margin: 0 }}>
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "6px", letterSpacing: "0.05em" }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="snaplica@gmail.com"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "13px 16px",
                color: "#fff", fontSize: "14px", outline: "none",
                transition: "border-color 0.2s, background 0.2s",
                fontFamily: "Inter, sans-serif"
              }}
              onFocus={e => { e.target.style.borderColor = "rgba(201,162,39,0.5)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
              onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "6px", letterSpacing: "0.05em" }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••••"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "13px 16px",
                color: "#fff", fontSize: "14px", outline: "none",
                transition: "border-color 0.2s, background 0.2s",
                fontFamily: "Inter, sans-serif"
              }}
              onFocus={e => { e.target.style.borderColor = "rgba(201,162,39,0.5)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
              onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "10px", padding: "12px 16px", marginBottom: "16px",
              color: "#fca5a5", fontSize: "13px", lineHeight: "1.4"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={signingIn}
            style={{
              width: "100%",
              background: signingIn ? "rgba(201,162,39,0.5)" : "linear-gradient(135deg, #c9a227, #e8b93f)",
              color: "#000",
              border: "none", borderRadius: "12px",
              padding: "14px", fontSize: "15px", fontWeight: "600",
              cursor: signingIn ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              fontFamily: "Inter, sans-serif",
              boxShadow: signingIn ? "none" : "0 4px 16px rgba(201,162,39,0.25)"
            }}
          >
            {signingIn ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: "11px", marginTop: "24px", marginBottom: 0 }}>
          Snaplica Photography · Vijayawada · Built by WayzenTech
        </p>
      </div>
    </div>
  );
}
