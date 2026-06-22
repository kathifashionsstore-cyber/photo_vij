// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // ⏳ Wait for Firebase to respond — show spinner, never redirect yet
  if (loading) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        background: "#060608",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: "16px", zIndex: 9999
      }}>
        <div style={{
          width: "44px", height: "44px",
          border: "2px solid rgba(201,162,39,0.2)",
          borderTop: "2px solid #c9a227",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", fontFamily: "Inter, sans-serif" }}>
          Loading admin panel...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ❌ Not logged in → go to admin login (saves current path to redirect back)
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // ❌ Logged in but not admin role
  const adminRoles = ["admin", "superadmin", "manager"];
  if (!adminRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Authenticated admin
  return children;
}
