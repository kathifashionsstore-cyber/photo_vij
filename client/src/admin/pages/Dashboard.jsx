import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import {
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Image,
  MessageCircle,
  Users,
  UserCheck,
} from "lucide-react";
import { db } from "../../firebase";

const gold = "#c9a227";
const card = { background: "#0f0f12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 };

const today = () => new Date().toISOString().split("T")[0];
const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const fmt = (value) => {
  if (!value) return "-";
  const d = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const daysLeft = (endDate) => {
  const diff = new Date(`${endDate}T00:00:00`) - new Date(`${today()}T00:00:00`);
  return Math.ceil(diff / 86400000);
};

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [teams, setTeams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [leadsSnap, bookingsSnap, teamsSnap, assignmentsSnap, auditSnap] = await Promise.all([
          getDocs(collection(db, "leads")),
          getDocs(collection(db, "bookings")),
          getDocs(collection(db, "teams")),
          getDocs(collection(db, "assignments")),
          getDocs(query(collection(db, "auditLogs"), orderBy("createdAt", "desc"), limit(8))).catch(() => ({ docs: [] })),
        ]);

        const bookingList = bookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setLeads(leadsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setBookings(bookingList);
        setTeams(teamsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setAssignments(assignmentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const directLogs = auditSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (directLogs.length) {
          setAuditLogs(directLogs);
        } else {
          const derived = bookingList
            .flatMap((booking) => [
              ...(booking.auditLog || []).map((item, index) => ({
                id: `${booking.id}-audit-${index}`,
                action: item.action || item.label || "Booking activity",
                actor: booking.clientName,
                createdAt: item.at,
              })),
              ...(booking.statusHistory || []).map((item, index) => ({
                id: `${booking.id}-status-${index}`,
                action: item.label || item.status || "Status updated",
                actor: booking.clientName,
                createdAt: item.at,
              })),
            ])
            .sort((a, b) => (Date.parse(b.createdAt || 0) || 0) - (Date.parse(a.createdAt || 0) || 0))
            .slice(0, 8);
          setAuditLogs(derived);
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const activeAssignments = useMemo(
    () => assignments.filter((item) => item.status !== "completed" && item.endDate >= today()),
    [assignments],
  );

  const upcomingEvents = useMemo(() => {
    const start = today();
    const end = addDays(7);
    return bookings
      .filter((booking) => booking.eventDate && booking.eventDate >= start && booking.eventDate <= end)
      .sort((a, b) => String(a.eventDate).localeCompare(String(b.eventDate)))
      .slice(0, 8);
  }, [bookings]);

  const teamStatus = (team) => {
    const active = activeAssignments.filter((item) => item.teamId === team.id);
    if (!active.length) return { free: true, text: "Available" };
    const soonest = [...active].sort((a, b) => new Date(a.endDate) - new Date(b.endDate))[0];
    const left = daysLeft(soonest.endDate);
    return {
      free: false,
      text: left === 0 ? "Completes today" : left === 1 ? "Completes tomorrow" : `Busy until ${fmt(soonest.endDate)}`,
      client: soonest.clientName,
    };
  };

  const KPI = ({ icon: Icon, label, value, color, sub }) => (
    <div style={{ ...card, display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: "#fff" }}>{loading ? "..." : value}</p>
        {sub && <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{sub}</p>}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>Dashboard</h1>
        <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 24 }}>
        <KPI icon={Users} label="Total Leads" value={leads.length} color="#3b82f6" sub="All opportunities" />
        <KPI icon={Calendar} label="Bookings" value={bookings.length} color={gold} sub="All event records" />
        <KPI icon={UserCheck} label="Teams" value={teams.length} color="#22c55e" sub="Crew units" />
        <KPI icon={Clock} label="Active Assignments" value={activeAssignments.length} color="#f59e0b" sub="Currently scheduled" />
      </div>

      <div style={{ ...card, marginBottom: 16 }}>
        <h3 style={sectionTitle}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.label}
                href={action.href}
                target={action.external ? "_blank" : undefined}
                rel={action.external ? "noreferrer" : undefined}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "20px 12px", background: `${action.bg}18`, border: `1px solid ${action.bg}30`, borderRadius: 14, textDecoration: "none", color: action.bg, transition: "all 0.2s", textAlign: "center" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = `${action.bg}25`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = `${action.bg}18`; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <Icon size={26} />
                <span style={{ fontSize: 12, fontWeight: 800 }}>{action.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(320px,0.85fr)", gap: 16, alignItems: "start" }}>
        <div style={card}>
          <h3 style={sectionTitle}>Upcoming Events - Next 7 Days</h3>
          {upcomingEvents.length === 0 ? (
            <p style={emptyText}>No events in the next 7 days.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {upcomingEvents.map((event) => (
                <div key={event.id} style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 12, alignItems: "start" }}>
                  <div style={{ borderLeft: `3px solid ${gold}`, paddingLeft: 10, color: gold, fontSize: 12, fontWeight: 800 }}>
                    {fmt(event.eventDate)}
                  </div>
                  <div>
                    <p style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: 13 }}>{event.eventType} - {event.clientName}</p>
                    <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.42)", fontSize: 12 }}>{event.eventTime || "Time TBD"} - {event.venue || event.venueAddress || "Venue not added"}</p>
                    <p style={{ margin: "3px 0 0", color: event.assignedTeamName ? "#22c55e" : "#f59e0b", fontSize: 11 }}>{event.assignedTeamName || "No team assigned"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={sectionTitle}>Team Availability</h3>
          {teams.length === 0 ? (
            <p style={emptyText}>No teams registered.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {teams.slice(0, 8).map((team) => {
                const status = teamStatus(team);
                return (
                  <div key={team.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 10 }}>
                    <div>
                      <p style={{ margin: 0, color: "#fff", fontSize: 13, fontWeight: 800 }}>{team.teamName || team.name || "Untitled Team"}</p>
                      <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{status.client || "Ready for assignment"}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, borderRadius: 999, padding: "4px 9px", background: status.free ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: status.free ? "#22c55e" : "#ef4444", whiteSpace: "nowrap" }}>
                      {status.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ ...card, marginTop: 16 }}>
        <h3 style={sectionTitle}>Recent Activity</h3>
        {auditLogs.length === 0 ? (
          <p style={emptyText}>No activity recorded yet.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {auditLogs.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "rgba(255,255,255,0.62)", fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: gold, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, color: "#fff", fontWeight: 700 }}>{item.action || item.type || "Activity"}</p>
                  <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.35)" }}>{item.actor || item.user || "Snaplica"} - {fmt(item.createdAt || item.at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const quickActions = [
  { icon: Calendar, label: "New Booking", href: "/admin/bookings", bg: gold },
  { icon: UserCheck, label: "Assign Team", href: "/admin/teams", bg: "#3b82f6" },
  { icon: Clock, label: "Calendar", href: "/admin/calendar", bg: "#8b5cf6" },
  { icon: Image, label: "Gallery", href: "/admin/gallery", bg: "#22c55e" },
  { icon: MessageCircle, label: "WhatsApp", href: "https://wa.me/919494387387", bg: "#25D366", external: true },
  { icon: Bell, label: "Announce", href: "/admin/announcements", bg: "#f97316" },
];

const sectionTitle = { margin: "0 0 16px", fontSize: 14, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.06em" };
const emptyText = { margin: 0, color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "24px 0" };
