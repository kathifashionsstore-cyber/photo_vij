// src/admin/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, Calendar, BookOpen, UserCheck,
  DollarSign, Image, Bell, Flag, BarChart2, Bot,
  Workflow, Settings, LogOut, Search, ChevronLeft, Menu
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "/admin/dashboard",     label: "Dashboard",      icon: LayoutDashboard },
  { path: "/admin/crm",           label: "CRM Pipeline",   icon: Users },
  { path: "/admin/calendar",      label: "Calendar",       icon: Calendar },
  { path: "/admin/bookings",      label: "Bookings",       icon: BookOpen },
  { path: "/admin/teams",         label: "Teams & Crew",   icon: UserCheck },
  { path: "/admin/finance",       label: "Finance Log",    icon: DollarSign },
  { path: "/admin/gallery",       label: "Gallery Assets", icon: Image },
  { path: "/admin/announcements", label: "Announcements",  icon: Bell },
  { path: "/admin/banners",       label: "Banners",        icon: Flag },
  { path: "/admin/analytics",     label: "Analytics",      icon: BarChart2 },
  { path: "/admin/chatbot",       label: "Chatbot KB",     icon: Bot },
  { path: "/admin/workflows",     label: "Workflow Engine",icon: Workflow },
  { path: "/admin/settings",      label: "Settings",       icon: Settings },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060608", color: "#fff", fontFamily: "Inter, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: collapsed ? "64px" : "240px",
        minHeight: "100vh",
        background: "#0a0a0d",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        transition: "width 0.3s ease",
        position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
        overflowY: "auto", overflowX: "hidden"
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "10px", justifyContent: collapsed ? "center" : "space-between" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src="/logo.webp" alt="Snaplica" style={{ width: "34px", height: "34px", borderRadius: "10px", objectFit: "contain", flexShrink: 0, background: "rgba(255,255,255,0.04)" }} />
              <div>
                <div style={{ fontWeight: "700", fontSize: "14px", letterSpacing: "0.08em", color: "#fff" }}>SNAPLICA ADM</div>
              </div>
            </div>
          )}
          {collapsed && <img src="/logo.webp" alt="Snaplica" style={{ width: "32px", height: "32px", borderRadius: "9px", objectFit: "contain" }} />}
          <button onClick={() => setCollapsed(c => !c)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "4px" }}>
            {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 12px", borderRadius: "10px", marginBottom: "2px",
                textDecoration: "none", fontSize: "13px", fontWeight: "500",
                color: isActive ? "#c9a227" : "rgba(255,255,255,0.5)",
                background: isActive ? "rgba(201,162,39,0.1)" : "transparent",
                borderLeft: isActive ? "2px solid #c9a227" : "2px solid transparent",
                transition: "all 0.15s",
                justifyContent: collapsed ? "center" : "flex-start",
                whiteSpace: "nowrap", overflow: "hidden"
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "10px", justifyContent: collapsed ? "center" : "space-between" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(201,162,39,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#c9a227", flexShrink: 0 }}>
                {user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "12px", color: "#fff", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                <div style={{ fontSize: "10px", color: "rgba(201,162,39,0.7)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin</div>
              </div>
            </div>
          )}
          <button onClick={handleLogout} title="Logout" style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px", flexShrink: 0, display: "flex" }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ marginLeft: collapsed ? "64px" : "240px", flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.3s ease", minHeight: "100vh" }}>

        {/* Top bar */}
        <header style={{ height: "60px", background: "#0a0a0d", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/logo.webp" alt="Snaplica" style={{ width: "30px", height: "30px", borderRadius: "8px", objectFit: "contain" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "8px 14px", width: "280px" }}>
              <Search size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>Global Search... Ctrl+K</span>
            </div>
          </div>
          <button style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
            <Bell size={20} />
          </button>
        </header>

        {/* PAGE CONTENT — THIS IS THE KEY: <Outlet /> renders the child route */}
        <main style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
