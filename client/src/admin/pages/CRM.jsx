import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  UserRound,
  X,
} from "lucide-react";
import { buildClientFollowUpWhatsApp, formatDate, normalizePhone } from "../../utils/whatsapp";
import { SERVICES, getServiceById } from "../../data/services";

const gold = "#c9a227";

const STAGES = [
  { id: "new_inquiry", label: "New Inquiry", color: "#6366f1" },
  { id: "contacted", label: "Contacted", color: "#8b5cf6" },
  { id: "quotation_sent", label: "Quotation Sent", color: "#f59e0b" },
  { id: "negotiation", label: "Negotiation", color: "#f97316" },
  { id: "confirmed", label: "Booked", color: gold },
  { id: "assigned", label: "Assigned", color: "#06b6d4" },
  { id: "completed", label: "Completed", color: "#22c55e" },
  { id: "delivered", label: "Delivered", color: "#10b981" },
  { id: "closed", label: "Closed", color: "#6b7280" },
];

const STATUS_ALIASES = {
  "New Inquiry": "new_inquiry",
  "Contacted": "contacted",
  "Quotation Sent": "quotation_sent",
  "Negotiation": "negotiation",
  "Booked": "confirmed",
  "Assigned": "assigned",
  "Completed": "completed",
  "Delivered": "delivered",
  "Closed": "closed",
  pending: "new_inquiry",
  approved: "confirmed",
  booked: "confirmed",
  in_progress: "assigned",
};

const EVENT_TYPES = SERVICES.map((service) => ({ value: service.id, label: service.title }));
const EMPTY = {
  clientName: "",
  phone: "",
  email: "",
  eventType: "wedding",
  serviceType: "wedding",
  eventDate: "",
  venue: "",
  priority: "normal",
  notes: "",
  status: "new_inquiry",
};

const stageIndex = (status) => STAGES.findIndex((stage) => stage.id === normalizeStatus(status));
const stageMeta = (status) => STAGES.find((stage) => stage.id === normalizeStatus(status)) || STAGES[0];

const normalizeStatus = (status = "new_inquiry") => {
  if (STATUS_ALIASES[status]) return STATUS_ALIASES[status];
  const normalized = String(status).trim().toLowerCase().replace(/\s+/g, "_");
  return STAGES.some((stage) => stage.id === normalized) ? normalized : "new_inquiry";
};

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
};

const eventInitial = (eventType = "Event") => eventType.slice(0, 1).toUpperCase();
const normalizeServiceType = (item = {}) => {
  const value = item.serviceType || item.eventType || "";
  const slug = String(value).trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return getServiceById(slug)?.id || value || "wedding";
};
const serviceLabel = (item = {}) => getServiceById(normalizeServiceType(item))?.title || item.serviceType || item.eventType || "Service";

export default function CRM() {
  const [leadDocs, setLeadDocs] = useState([]);
  const [bookingDocs, setBookingDocs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const unsubLeads = onSnapshot(
      query(collection(db, "leads"), orderBy("createdAt", "desc")),
      (snap) => setLeadDocs(snap.docs.map((d) => ({ id: d.id, sourceCollection: "leads", ...d.data() }))),
      (err) => console.error("Lead listener failed:", err),
    );

    const unsubBookings = onSnapshot(
      query(collection(db, "bookings"), orderBy("createdAt", "desc")),
      (snap) => setBookingDocs(snap.docs.map((d) => ({ id: d.id, sourceCollection: "bookings", ...d.data() }))),
      (err) => console.error("Booking listener failed:", err),
    );

    return () => {
      unsubLeads();
      unsubBookings();
    };
  }, []);

  const leads = useMemo(() => {
    const leadBookingIds = new Set(leadDocs.map((lead) => lead.bookingId).filter(Boolean));
    const normalizedLeads = leadDocs.map((lead) => normalizeLead(lead, "leads"));
    const bookingLeads = bookingDocs
      .filter((booking) => !leadBookingIds.has(booking.id))
      .map((booking) => normalizeLead(booking, "bookings"));

    return [...normalizedLeads, ...bookingLeads].sort((a, b) => {
      const aDate = a.createdAt?.toMillis?.() || Date.parse(a.createdAt || 0) || 0;
      const bDate = b.createdAt?.toMillis?.() || Date.parse(b.createdAt || 0) || 0;
      return bDate - aDate;
    });
  }, [leadDocs, bookingDocs]);

  const handleSave = async () => {
    if (!form.clientName) return alert("Client name required");
    setSaving(true);
    try {
      await addDoc(collection(db, "leads"), {
        ...form,
        phone: normalizePhone(form.phone),
        eventType: normalizeServiceType(form),
        serviceType: normalizeServiceType(form),
        status: normalizeStatus(form.status),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setShowForm(false);
      setForm(EMPTY);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateLeadStage = async (lead, nextStatus) => {
    const updates = {
      status: nextStatus,
      updatedAt: serverTimestamp(),
      lastAction: `Moved to ${stageMeta(nextStatus).label}`,
    };

    const writes = [];
    if (lead.sourceCollection === "leads") {
      writes.push(updateDoc(doc(db, "leads", lead.id), updates));
      if (lead.bookingId) writes.push(updateDoc(doc(db, "bookings", lead.bookingId), updates));
    } else {
      writes.push(updateDoc(doc(db, "bookings", lead.id), updates));
    }

    await Promise.all(writes);
    setDetail((prev) => (prev?.id === lead.id ? { ...prev, ...updates, status: nextStatus } : prev));
  };

  const moveStage = async (lead, direction) => {
    const idx = stageIndex(lead.status);
    const next = STAGES[idx + direction];
    if (!next) return;
    await updateLeadStage(lead, next.id);
  };

  const inp = (key) => ({
    value: form[key] || "",
    onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
    style: iStyle,
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff" }}>CRM Pipeline</h1>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            {leads.length} opportunities from leads and bookings
          </p>
        </div>
        <button onClick={() => setShowForm(true)} style={btnGold}>
          <Plus size={16} /> New Lead
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16 }}>
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((lead) => normalizeStatus(lead.status) === stage.id);
          return (
            <div key={stage.id} style={columnStyle}>
              <div style={columnHeaderStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.72)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {stage.label}
                  </span>
                </div>
                <span style={countPill}>{stageLeads.length}</span>
              </div>

              <div style={{ padding: 10, minHeight: 180 }}>
                {stageLeads.length === 0 && (
                  <div style={{ textAlign: "center", padding: "28px 0", color: "rgba(255,255,255,0.18)", fontSize: 12 }}>
                    No leads
                  </div>
                )}
                {stageLeads.map((lead) => (
                  <LeadCard key={`${lead.sourceCollection}-${lead.id}`} lead={lead} onOpen={() => setDetail(lead)} onMove={moveStage} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {detail && (
        <LeadDrawer
          lead={detail}
          onClose={() => setDetail(null)}
          onMove={moveStage}
          onSetStage={updateLeadStage}
        />
      )}

      {showForm && (
        <div style={modalBackdrop} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: "#fff", fontWeight: 700 }}>New Lead</h2>
              <button onClick={() => setShowForm(false)} style={iconButton}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1/-1" }}>
                <Label>Client Name *</Label>
                <input {...inp("clientName")} placeholder="Rahul Sharma" />
              </div>
              <div>
                <Label>Phone *</Label>
                <input {...inp("phone")} placeholder="9876543210" />
              </div>
              <div>
                <Label>Email</Label>
                <input {...inp("email")} placeholder="client@email.com" />
              </div>
              <div>
                <Label>Service Type</Label>
                <select value={form.serviceType || form.eventType} onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value, serviceType: e.target.value }))} style={iStyle}>
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Event Date</Label>
                <input type="date" {...inp("eventDate")} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <Label>Venue</Label>
                <input {...inp("venue")} placeholder="Taj Hotel, Vijayawada" />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <Label>Notes</Label>
                <textarea {...inp("notes")} rows={3} style={{ ...iStyle, resize: "vertical" }} placeholder="Special requirements..." />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, ...btnOutline }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, ...btnGold }}>{saving ? "Saving..." : "Add Lead"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const normalizeLead = (item, sourceCollection) => ({
  ...item,
  sourceCollection,
  status: normalizeStatus(item.status),
  clientName: item.clientName || item.name || "Unnamed Client",
  phone: normalizePhone(item.clientPhone || item.phone || item.clientPhoneNumber || ""),
  email: item.clientEmail || item.email || "",
  venue: item.venue || item.venueAddress || "",
  eventType: normalizeServiceType(item),
  serviceType: normalizeServiceType(item),
  serviceLabel: serviceLabel(item),
  notes: item.notes || item.specialRequirements || item.specialNotes || item.comments || "",
  priority: item.priority || "normal",
  teamName: item.assignedTeamName || item.teamName || "",
});

const LeadCard = ({ lead, onOpen, onMove }) => {
  const days = daysUntil(lead.eventDate);
  const meta = stageMeta(lead.status);

  return (
    <div style={leadCardStyle} onClick={onOpen}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: "#d1d5db", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          <span style={eventBadge}>{eventInitial(lead.serviceLabel)}</span>
          {lead.serviceLabel || "Service"}
        </span>
        {lead.priority === "vip" && <span style={vipBadge}>VIP</span>}
      </div>

      <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13, color: "#fff" }}>{lead.clientName}</p>
      {lead.autoUpdatedAt && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4, display: "inline-block" }}>auto</span>}
      <InfoLine icon={Phone}>{lead.phone || "No phone"}</InfoLine>
      <InfoLine icon={CalendarDays}>
        {formatDate(lead.eventDate) || "No date"} {days !== null ? `- ${days < 0 ? "past" : `${days} days`}` : ""}
      </InfoLine>
      <p style={{ margin: "6px 0", fontSize: 11, color: "rgba(255,255,255,0.42)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {lead.venue || "Venue not added"}
      </p>

      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <span style={{ ...miniPill, color: meta.color, background: `${meta.color}16`, borderColor: `${meta.color}30` }}>
          {meta.label}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <span style={{ fontSize: 10, color: lead.teamName ? "#22c55e" : "#f59e0b" }}>
          {lead.teamName || "Unassigned"}
        </span>
        <div style={{ display: "flex", gap: 5 }}>
          <button onClick={(e) => { e.stopPropagation(); onMove(lead, -1); }} style={qBtn("#6b7280")} title="Move back">
            <ChevronLeft size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); window.open(buildClientFollowUpWhatsApp(lead), "_blank"); }} style={qBtn("#22c55e")} title="WhatsApp">
            <MessageCircle size={12} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMove(lead, 1); }} style={qBtn(gold)} title="Move forward">
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const LeadDrawer = ({ lead, onClose, onMove, onSetStage }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div style={{ flex: 1, background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
    <div style={{ width: 400, maxWidth: "100vw", background: "#0f0f12", borderLeft: "1px solid rgba(255,255,255,0.08)", padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, color: "#fff", fontSize: 18, fontWeight: 700 }}>{lead.clientName}</h3>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{lead.bookingRef || lead.id}</p>
        </div>
        <button onClick={onClose} style={iconButton}><X size={18} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <button onClick={() => window.open(`tel:91${lead.phone}`)} style={drawerAction("#3b82f6")}><Phone size={14} /> Call</button>
        <button onClick={() => window.open(buildClientFollowUpWhatsApp(lead), "_blank")} style={drawerAction("#22c55e")}><MessageCircle size={14} /> WhatsApp</button>
        <a href={`mailto:${lead.email}`} style={{ ...drawerAction("#f59e0b"), textDecoration: "none" }}><Mail size={14} /> Email</a>
        <button onClick={() => onMove(lead, 1)} style={drawerAction(gold)}><ChevronRight size={14} /> Next Stage</button>
      </div>

      {[
        ["Phone", lead.phone || "Not added"],
        ["Email", lead.email || "Not added"],
        ["Service Type", lead.serviceLabel || "Not added"],
        ["Date", formatDate(lead.eventDate) || "Not added"],
        ["Venue", lead.venue || "Not added"],
        ["Team", lead.teamName || "Unassigned"],
        ["Source", lead.source || lead.bookingSource || lead.sourceCollection],
        ["Notes", lead.notes || "No notes"],
      ].map(([key, value]) => (
        <div key={key} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 10 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{key}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.5 }}>{value}</div>
        </div>
      ))}

      <div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Pipeline Stage</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {STAGES.map((stage) => (
            <button
              key={stage.id}
              onClick={() => onSetStage(lead, stage.id)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                background: normalizeStatus(lead.status) === stage.id ? stage.color : "rgba(255,255,255,0.05)",
                color: normalizeStatus(lead.status) === stage.id ? "#fff" : "rgba(255,255,255,0.48)",
              }}
            >
              {stage.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const InfoLine = ({ icon: Icon, children }) => (
  <p style={{ margin: "0 0 4px", display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
    <Icon size={12} style={{ color: "rgba(201,162,39,0.8)" }} />
    {children}
  </p>
);

const qBtn = (color) => ({
  width: 27,
  height: 27,
  borderRadius: 7,
  background: `${color}15`,
  border: `1px solid ${color}25`,
  color,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const drawerAction = (color) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "9px 10px",
  background: `${color}14`,
  border: `1px solid ${color}26`,
  color,
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
});

const Label = ({ children }) => (
  <label style={{ display: "block", color: "rgba(255,255,255,0.4)", fontSize: 11, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
    {children}
  </label>
);

const columnStyle = {
  minWidth: 260,
  maxWidth: 260,
  background: "#0a0a0d",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 14,
  overflow: "hidden",
};
const columnHeaderStyle = { padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" };
const countPill = { fontSize: 11, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)", padding: "2px 8px", borderRadius: 20 };
const leadCardStyle = { background: "#0f0f12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 12, marginBottom: 10, cursor: "pointer" };
const eventBadge = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 7, background: "rgba(201,162,39,0.15)", color: gold, fontWeight: 800 };
const vipBadge = { padding: "3px 7px", borderRadius: 999, background: "rgba(201,162,39,0.15)", color: gold, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" };
const miniPill = { border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.48)", borderRadius: 999, padding: "3px 8px", fontSize: 10, fontWeight: 700 };
const iStyle = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "Inter,sans-serif" };
const btnGold = { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg,#c9a227,#e8b93f)", color: "#000", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const btnOutline = { padding: "10px 18px", background: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" };
const iconButton = { background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex" };
const modalBackdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
const modalCard = { background: "#0f0f12", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" };
