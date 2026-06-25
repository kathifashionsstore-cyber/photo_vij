import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  BarChart2,
  Bell,
  BookOpen,
  Bot,
  Calendar,
  Camera,
  ChevronLeft,
  Flag,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  UserCheck,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/crm", label: "CRM Pipeline", icon: Users },
  { path: "/admin/calendar", label: "Calendar", icon: Calendar },
  { path: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { path: "/admin/teams", label: "Teams & Crew", icon: UserCheck },
  { path: "/admin/gallery", label: "Gallery Assets", icon: Image },
  { path: "/admin/highlights", label: "Highlights", icon: Camera },
  { path: "/admin/services", label: "Services Manager", icon: BookOpen },
  { path: "/admin/announcements", label: "Announcements", icon: Bell },
  { path: "/admin/banners", label: "Banners", icon: Flag },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { path: "/admin/chatbot", label: "Chatbot KB", icon: Bot },
  { path: "/admin/workflows", label: "Workflow Engine", icon: Workflow },
  { path: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login", { replace: true });
  };

  const sidebarWidth = isMobile ? "min(320px, calc(100vw - 32px))" : collapsed ? "64px" : "240px";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060608", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.68)", border: "none" }}
        />
      )}

      <aside
        style={{
          width: sidebarWidth,
          minHeight: isMobile ? "auto" : "100vh",
          maxHeight: isMobile ? "calc(100vh - 32px)" : "100vh",
          background: "#0a0a0d",
          borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.06)",
          border: isMobile ? "1px solid rgba(255,255,255,0.1)" : undefined,
          borderRadius: isMobile ? "22px 22px 0 0" : 0,
          display: "flex",
          flexDirection: "column",
          transition: isMobile ? "transform 0.28s ease" : "width 0.3s ease",
          position: "fixed",
          top: isMobile ? "auto" : 0,
          left: isMobile ? 16 : 0,
          right: isMobile ? 16 : "auto",
          bottom: 0,
          zIndex: isMobile ? 999 : 100,
          transform: isMobile ? (sidebarOpen ? "translateY(0)" : "translateY(calc(100% + 24px))") : "none",
          overflowY: "auto",
          overflowX: "hidden",
          boxShadow: isMobile ? "0 -24px 80px rgba(0,0,0,0.7)" : "none",
        }}
      >
        <div
          style={{
            padding: "20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: collapsed && !isMobile ? "center" : "space-between",
          }}
        >
          {(!collapsed || isMobile) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <img src="/logo.webp" alt="Snaplica" style={{ width: 34, height: 34, borderRadius: 10, objectFit: "contain", background: "rgba(255,255,255,0.04)" }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", color: "#fff", whiteSpace: "nowrap" }}>SNAPLICA ADM</div>
              </div>
            </div>
          )}
          {collapsed && !isMobile && <img src="/logo.webp" alt="Snaplica" style={{ width: 32, height: 32, borderRadius: 9, objectFit: "contain" }} />}
          <button
            type="button"
            onClick={() => (isMobile ? setSidebarOpen(false) : setCollapsed((value) => !value))}
            style={ghostButton}
            aria-label={isMobile ? "Close admin menu" : "Toggle sidebar"}
          >
            {isMobile ? <X size={18} /> : collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => isMobile && setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 10,
                marginBottom: 2,
                textDecoration: "none",
                fontSize: 13,
                fontWeight: 600,
                color: isActive ? "#c9a227" : "rgba(255,255,255,0.55)",
                background: isActive ? "rgba(201,162,39,0.1)" : "transparent",
                borderLeft: isActive ? "2px solid #c9a227" : "2px solid transparent",
                justifyContent: collapsed && !isMobile ? "center" : "flex-start",
                whiteSpace: "nowrap",
                overflow: "hidden",
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {(!collapsed || isMobile) && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, justifyContent: collapsed && !isMobile ? "center" : "space-between" }}>
          {(!collapsed || isMobile) && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,162,39,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#c9a227", flexShrink: 0 }}>
                {user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 12, color: "#fff", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                <div style={{ fontSize: 10, color: "rgba(201,162,39,0.7)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Admin</div>
              </div>
            </div>
          )}
          <button type="button" onClick={handleLogout} title="Logout" style={ghostButton}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div style={{ marginLeft: isMobile ? 0 : collapsed ? "64px" : "240px", flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.3s ease", minHeight: "100vh", width: "100%" }}>
        <header style={{ height: 60, background: "#0a0a0d", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 14px" : "0 24px", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo.webp" alt="Snaplica" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "contain" }} />
            <div style={{ display: isMobile ? "none" : "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", width: 280 }}>
              <Search size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>Global Search... Ctrl+K</span>
            </div>
          </div>
          <button type="button" style={ghostButton} aria-label="Notifications">
            <Bell size={20} />
          </button>
        </header>

        <main style={{ flex: 1, padding: isMobile ? "16px 14px 88px" : "24px", overflowY: "auto", width: "100%", boxSizing: "border-box" }}>
          <Outlet />
        </main>
      </div>

      {isMobile && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open admin menu"
          style={{
            position: "fixed",
            left: 18,
            bottom: 18,
            zIndex: 997,
            width: 54,
            height: 54,
            borderRadius: 18,
            border: "1px solid rgba(201,162,39,0.35)",
            background: "linear-gradient(135deg,#c9a227,#e8b93f)",
            color: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
            cursor: "pointer",
          }}
        >
          <Menu size={22} />
        </button>
      )}
    </div>
  );
}

const ghostButton = {
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.45)",
  cursor: "pointer",
  padding: 4,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
