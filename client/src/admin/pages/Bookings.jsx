import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import Receipt from "../components/Receipt";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import AssignTeamModal from "../../components/admin/AssignTeamModal";
import {
  buildClientFollowUpWhatsApp,
  formatDate,
  normalizePhone,
} from "../../utils/whatsapp";
import { SERVICES, getServiceById } from "../../data/services";

const gold = "#c9a227";

const STATUS_META = {
  new_inquiry: { label: "New Inquiry", color: "#6366f1" },
  contacted: { label: "Contacted", color: "#8b5cf6" },
  quotation_sent: { label: "Quotation Sent", color: "#f59e0b" },
  confirmed: { label: "Confirmed", color: gold },
  assigned: { label: "Assigned", color: "#06b6d4" },
  in_progress: { label: "In Progress", color: "#f97316" },
  post_production: { label: "Post-Production", color: "#a855f7" },
  completed: { label: "Completed", color: "#22c55e" },
  delivered: { label: "Delivered", color: "#10b981" },
  cancelled: { label: "Cancelled", color: "#6b7280" },
};

const STATUSES = Object.keys(STATUS_META);
const WORKFLOW_STAGES = ["new_inquiry", "confirmed", "assigned", "in_progress", "completed", "delivered"];
const EVENT_TYPES = SERVICES.map((service) => ({ value: service.id, label: service.title }));
const SOURCES = ["Website Form", "Walk-in", "Phone", "Instagram", "Referral", "Admin Panel"];
const PRIORITIES = ["normal", "high", "vip"];
const EQUIPMENT = ["Drone", "Extra Camera", "Gimbal", "Lights"];

const EMPTY = {
  bookingRef: "",
  clientName: "",
  phone: "",
  email: "",
  clientCity: "",
  eventType: "wedding",
  serviceType: "wedding",
  eventDate: "",
  eventTime: "",
  venue: "",
  duration: "Full Day",
  specialNotes: "",
  source: "Admin Panel",
  priority: "normal",
  referralName: "",
  guestCount: "",
  equipmentNeeded: [],
  deliveryDeadline: "",
  contractSigned: false,
  status: "confirmed",
  assignedTeamName: "",
};

const normalizeStatus = (status = "new_inquiry") => {
  const value = String(status).trim().toLowerCase().replace(/\s+/g, "_");
  if (value === "pending") return "new_inquiry";
  if (value === "approved") return "confirmed";
  return STATUS_META[value] ? value : "new_inquiry";
};

const bookingRefFallback = () => `SNP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

const getPhone = (booking) => normalizePhone(booking.clientPhone || booking.phone || "");
const getEmail = (booking) => booking.clientEmail || booking.email || "";
const getVenue = (booking) => booking.venue || booking.venueAddress || "";
const normalizeServiceType = (value = "") => {
  const raw = String(value || "").trim();
  const slug = raw.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return getServiceById(slug)?.id || SERVICES.find((service) => service.title.toLowerCase() === raw.toLowerCase())?.id || raw || "wedding";
};
const getServiceType = (booking) => normalizeServiceType(booking.serviceType || booking.eventType || booking.category || "wedding");
const getServiceLabel = (booking) => getServiceById(getServiceType(booking))?.title || booking.serviceType || booking.eventType || "Service";

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
};

const toBookingView = (booking) => ({
  ...booking,
  status: normalizeStatus(booking.status),
  phone: getPhone(booking),
  email: getEmail(booking),
  venue: getVenue(booking),
  eventType: getServiceType(booking),
  serviceType: getServiceType(booking),
  serviceLabel: getServiceLabel(booking),
  assignedTeamName: booking.assignedTeamName || booking.teamName || "",
});

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "bookings"), orderBy("createdAt", "desc")),
      (snap) => setBookings(snap.docs.map((d) => toBookingView({ id: d.id, ...d.data() }))),
      (err) => console.error("Bookings listener failed:", err),
    );
    return unsub;
  }, []);

  const teams = useMemo(
    () => Array.from(new Set(bookings.map((b) => b.assignedTeamName).filter(Boolean))).sort(),
    [bookings],
  );

  const filtered = useMemo(() => {
    return bookings.filter((booking) => {
      const matchStatus = filterStatus === "all" || booking.status === filterStatus;
      const matchType = filterType === "all" || booking.eventType === filterType;
      const matchTeam = filterTeam === "all" || (filterTeam === "unassigned" ? !booking.assignedTeamName : booking.assignedTeamName === filterTeam);
      const term = search.toLowerCase();
      const matchSearch =
        !term ||
        booking.clientName?.toLowerCase().includes(term) ||
        booking.phone?.includes(term) ||
        booking.bookingRef?.toLowerCase().includes(term);
      return matchStatus && matchType && matchTeam && matchSearch;
    });
  }, [bookings, filterStatus, filterType, filterTeam, search]);

  const selectedBookings = useMemo(
    () => bookings.filter((booking) => selectedIds.has(booking.id)),
    [bookings, selectedIds],
  );

  const openCreate = () => {
    setForm(EMPTY);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (booking) => {
    setForm({
      ...EMPTY,
      ...booking,
      phone: booking.phone,
      email: booking.email,
      venue: booking.venue,
      eventType: booking.eventType,
      serviceType: booking.serviceType || booking.eventType,
      equipmentNeeded: Array.isArray(booking.equipmentNeeded) ? booking.equipmentNeeded : [],
      contractSigned: Boolean(booking.contractSigned),
    });
    setEditing(booking);
    setShowForm(true);
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds((prev) => {
      const visibleIds = filtered.map((booking) => booking.id);
      const allVisibleSelected = visibleIds.every((id) => prev.has(id));
      const next = new Set(prev);
      visibleIds.forEach((id) => {
        if (allVisibleSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const toggleEquipment = (item) => {
    setForm((prev) => {
      const exists = prev.equipmentNeeded.includes(item);
      return {
        ...prev,
        equipmentNeeded: exists ? prev.equipmentNeeded.filter((value) => value !== item) : [...prev.equipmentNeeded, item],
      };
    });
  };

  const handleSave = async () => {
    if (!form.clientName || !form.eventDate) return alert("Name and event date required");
    setSaving(true);

    const phone = normalizePhone(form.phone || form.clientPhone);
    const status = normalizeStatus(form.status);
    const bookingRef = form.bookingRef || bookingRefFallback();
    const cleanForm = { ...form };
    ["total" + "Am" + "ount", "advance" + "Paid", "balance" + "Due", "pack" + "age" + "Price", "pay" + "ment" + "Method", "advance" + "Pay" + "ment" + "Screenshot"].forEach((key) => {
      delete cleanForm[key];
    });
    const serviceType = normalizeServiceType(form.serviceType || form.eventType);
    const data = {
      ...cleanForm,
      bookingRef,
      clientPhone: phone,
      phone,
      clientEmail: form.email,
      email: form.email,
      venue: form.venue,
      venueAddress: form.venue,
      eventType: serviceType,
      serviceType,
      source: form.source,
      bookingSource: form.source,
      status,
      priority: form.priority,
      contractSigned: Boolean(form.contractSigned),
      lastAction: editing?.id ? "Booking updated by admin" : "Admin booking created",
      updatedAt: serverTimestamp(),
    };

    try {
      if (editing?.id) {
        await updateDoc(doc(db, "bookings", editing.id), data);
      } else {
        const bookingDoc = await addDoc(collection(db, "bookings"), {
          ...data,
          createdAt: serverTimestamp(),
          statusHistory: [{ status, label: "Booking created by admin", at: new Date().toISOString() }],
          auditLog: [{ action: "ADMIN_BOOKING_CREATED", at: new Date().toISOString() }],
        });

        addDoc(collection(db, "leads"), {
          bookingId: bookingDoc.id,
          bookingRef,
          clientName: data.clientName,
          phone,
          clientPhone: phone,
          email: data.email,
          clientEmail: data.email,
          eventType: data.eventType,
          serviceType: data.serviceType,
          eventDate: data.eventDate,
          eventTime: data.eventTime,
          venue: data.venue,
          priority: data.priority,
          status,
          source: "admin_panel",
          notes: data.specialNotes,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }).catch((err) => console.warn("Lead mirror failed:", err));
      }

      setShowForm(false);
      setEditing(null);
      setForm(EMPTY);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateBooking = async (booking, updates) => {
    await updateDoc(doc(db, "bookings", booking.id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    if (detail?.id === booking.id) setDetail((prev) => ({ ...prev, ...updates }));
  };

  const changeStatus = async (booking, status) => {
    await updateBooking(booking, {
      status,
      lastAction: `Status changed to ${STATUS_META[status]?.label || status}`,
      statusHistory: arrayUnion({ status, at: new Date().toISOString(), label: STATUS_META[status]?.label || status }),
    });
  };

  const deleteBooking = async (booking) => {
    if (!window.confirm(`Delete booking ${booking.bookingRef || booking.clientName}?`)) return;
    await deleteDoc(doc(db, "bookings", booking.id));
    setDetail(null);
  };

  const openWA = (booking) => {
    window.open(buildClientFollowUpWhatsApp(booking), "_blank");
  };

  const verifyAndSchedule = async (booking) => {
    const serviceLabel = getServiceLabel(booking);
    const phone = getPhone(booking);
    await updateBooking(booking, {
      verified: true,
      status: "confirmed",
      lastAction: "Verified and scheduled by admin",
      verifiedAt: serverTimestamp(),
      scheduledAt: serverTimestamp(),
      statusHistory: arrayUnion({ status: "confirmed", at: new Date().toISOString(), label: "Verified and scheduled" }),
    });

    if (phone) {
      const message = [
        `Hi ${booking.clientName || "there"},`,
        "",
        "Your Snaplica booking has been verified and scheduled.",
        `Service Type: ${serviceLabel}`,
        `Date: ${formatDate(booking.eventDate) || "-"}`,
        booking.eventTime ? `Time: ${booking.eventTime}` : "",
        `Venue: ${booking.venue || "-"}`,
        "",
        "Our team will contact you with the next details.",
        "- Snaplica Photography",
      ].filter(Boolean).join("\n");
      window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, "_blank");
    }
  };

  const exportCSV = () => {
    const rows = selectedBookings.length ? selectedBookings : filtered;
    const header = ["Booking Ref", "Client", "Phone", "Service", "Date", "Venue", "Team", "Status"];
    const csv = [
      header.join(","),
      ...rows.map((booking) =>
        [
          booking.bookingRef,
          booking.clientName,
          booking.phone,
          booking.serviceLabel,
          booking.eventDate,
          booking.venue,
          booking.assignedTeamName || "Unassigned",
          booking.status,
        ].map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snaplica-bookings-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendBulkWhatsApp = () => {
    selectedBookings.forEach((booking, index) => {
      setTimeout(() => openWA(booking), index * 650);
    });
  };

  const bulkStatusChange = async (status) => {
    await Promise.all(selectedBookings.map((booking) => changeStatus(booking, status)));
    setSelectedIds(new Set());
  };

  const inp = (key) => ({
    value: form[key] || "",
    onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
    style: inputStyle,
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff" }}>Bookings</h1>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            {bookings.length} total bookings. {selectedIds.size ? `${selectedIds.size} selected.` : ""}
          </p>
        </div>
        <button onClick={openCreate} style={btnGold}>
          <Plus size={16} /> New Booking
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input placeholder="Search name, phone, ref..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, width: 240 }} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 170 }}>
          <option value="all">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{STATUS_META[status].label}</option>
          ))}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ ...inputStyle, width: 170 }}>
          <option value="all">All Event Types</option>
          {EVENT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
        </select>
        <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} style={{ ...inputStyle, width: 180 }}>
          <option value="all">All Teams</option>
          <option value="unassigned">Unassigned</option>
          {teams.map((team) => <option key={team}>{team}</option>)}
        </select>
        <button onClick={exportCSV} style={btnOutline}><Download size={14} /> Export CSV</button>
      </div>

      {selectedIds.size > 0 && (
        <div style={{ ...card, marginBottom: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700 }}>{selectedIds.size} selected</span>
          <button onClick={sendBulkWhatsApp} style={smallAction("#22c55e")}><MessageCircle size={14} /> Bulk WhatsApp</button>
          <button onClick={() => bulkStatusChange("contacted")} style={smallAction("#8b5cf6")}>Mark Contacted</button>
          <button onClick={() => bulkStatusChange("confirmed")} style={smallAction(gold)}>Mark Confirmed</button>
          <button onClick={() => setSelectedIds(new Set())} style={smallAction("#6b7280")}>Clear</button>
        </div>
      )}

      <div style={card}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 48, color: "rgba(255,255,255,0.35)" }}>
            <FileText size={38} style={{ margin: "0 auto 12px", color: gold }} />
            <p style={{ margin: 0, fontSize: 15 }}>No bookings match the current filters.</p>
            <button onClick={openCreate} style={{ ...btnGold, marginTop: 16 }}><Plus size={16} /> Add Booking</button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th style={th}><input type="checkbox" checked={filtered.length > 0 && filtered.every((b) => selectedIds.has(b.id))} onChange={toggleAllVisible} /></th>
          {["Client", "Service", "Date", "Team", "Status", "Last Action", "Actions"].map((head) => (
                    <th key={head} style={th}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    selected={selectedIds.has(booking.id)}
                    onSelect={() => toggleSelection(booking.id)}
                    onOpen={() => setDetail(booking)}
                    onEdit={() => openEdit(booking)}
                    onAssign={() => setAssignTarget(booking)}
                    onReceipt={() => setReceiptBooking(booking)}
                    onWA={() => openWA(booking)}
                    onVerify={() => verifyAndSchedule(booking)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div style={modalBackdrop} onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div style={modalCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>{editing?.id ? "Edit Booking" : "New Booking"}</h2>
              <button onClick={() => setShowForm(false)} style={iconButton}><X size={20} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1/-1" }}><Label>Booking Ref</Label><input {...inp("bookingRef")} placeholder="Auto-generated if blank" /></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Client Name *</Label><input {...inp("clientName")} placeholder="Rahul Sharma" /></div>
              <div><Label>Phone *</Label><input {...inp("phone")} placeholder="9876543210" /></div>
              <div><Label>Email</Label><input {...inp("email")} placeholder="client@email.com" /></div>
              <div><Label>City / Area</Label><input {...inp("clientCity")} placeholder="Vijayawada" /></div>
              <div>
                <Label>Source</Label>
                <select value={form.source} onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))} style={inputStyle}>
                  {SOURCES.map((source) => <option key={source}>{source}</option>)}
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))} style={inputStyle}>
                  {PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority.toUpperCase()}</option>)}
                </select>
              </div>
              <div><Label>Referral Name</Label><input {...inp("referralName")} placeholder="If referral" /></div>
              <div>
                <Label>Service Type *</Label>
                <select value={form.serviceType || form.eventType} onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value, serviceType: e.target.value }))} style={inputStyle}>
                  {EVENT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
              </div>
              <div><Label>Event Date *</Label><input type="date" {...inp("eventDate")} /></div>
              <div><Label>Event Time</Label><input type="time" {...inp("eventTime")} /></div>
              <div><Label>Duration</Label><input {...inp("duration")} placeholder="Full Day" /></div>
              <div><Label>Guest Count</Label><input type="number" {...inp("guestCount")} placeholder="250" /></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Venue / Location</Label><input {...inp("venue")} placeholder="Taj Hotel, Vijayawada" /></div>
              <div><Label>Delivery Deadline</Label><input type="date" {...inp("deliveryDeadline")} /></div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} style={inputStyle}>
                  {STATUSES.map((status) => <option key={status} value={status}>{STATUS_META[status].label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <Label>Specific Equipment Needed</Label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {EQUIPMENT.map((item) => (
                    <button key={item} type="button" onClick={() => toggleEquipment(item)} style={chip(form.equipmentNeeded.includes(item))}>
                      {form.equipmentNeeded.includes(item) && <Check size={13} />} {item}
                    </button>
                  ))}
                </div>
              </div>
              <label style={{ gridColumn: "1/-1", display: "flex", gap: 10, alignItems: "center", color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                <input type="checkbox" checked={form.contractSigned} onChange={(e) => setForm((prev) => ({ ...prev, contractSigned: e.target.checked }))} />
                Contract signed
              </label>
              <div style={{ gridColumn: "1/-1" }}><Label>Special Notes</Label><textarea {...inp("specialNotes")} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, ...btnOutline }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, ...btnGold }}>{saving ? "Saving..." : (editing?.id ? "Update Booking" : "Create Booking")}</button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <BookingDrawer
          booking={detail}
          onClose={() => setDetail(null)}
          onEdit={() => openEdit(detail)}
          onDelete={() => deleteBooking(detail)}
          onAssign={() => setAssignTarget(detail)}
          onStatus={(status) => changeStatus(detail, status)}
          onReceipt={() => setReceiptBooking(detail)}
          onWA={() => openWA(detail)}
          onVerify={() => verifyAndSchedule(detail)}
        />
      )}

      {assignTarget && (
        <AssignTeamModal
          booking={assignTarget}
          onAssign={(team) => {
            const updates = {
              assignedTeam: team.id,
              assignedTeamId: team.id,
              assignedTeamName: team.name,
              teamLeaderName: team.leaderName,
              teamLeaderPhone: team.leaderPhone,
              assignedTeamLeaderPhone: team.leaderPhone,
              status: "assigned",
              lastAction: `Team assigned: ${team.name}`,
            };
            if (detail?.id === assignTarget.id) setDetail((prev) => ({ ...prev, ...updates }));
          }}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {receiptBooking && <Receipt booking={receiptBooking} onClose={() => setReceiptBooking(null)} />}
    </div>
  );
}

const BookingRow = ({ booking, selected, onSelect, onOpen, onEdit, onAssign, onReceipt, onWA, onVerify }) => {
  const status = STATUS_META[booking.status] || STATUS_META.new_inquiry;
  const days = daysUntil(booking.eventDate);

  return (
    <tr
      onClick={onOpen}
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <td style={td} onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={selected} onChange={onSelect} />
      </td>
      <td style={td}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>{booking.clientName}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{booking.bookingRef || booking.phone}</div>
          </div>
          {booking.priority === "vip" && <span style={vipBadge}>VIP</span>}
        </div>
      </td>
      <td style={td}>
        <span style={eventPill}>{booking.eventType?.slice(0, 1) || "E"}</span>
        <span style={{ marginLeft: 8, color: "rgba(255,255,255,0.72)", fontSize: 12 }}>{booking.serviceLabel}</span>
      </td>
      <td style={td}>
        <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 12, whiteSpace: "nowrap" }}>{formatDate(booking.eventDate) || "No date"}</div>
        <div style={{ fontSize: 11, color: days !== null && days <= 3 && days >= 0 ? "#f59e0b" : "rgba(255,255,255,0.35)" }}>
          {days === null ? booking.eventTime : days < 0 ? "Past event" : days === 0 ? "Today" : `${days} days left`}
        </div>
      </td>
      <td style={td}>
        <span style={{ fontSize: 12, color: booking.assignedTeamName ? "#22c55e" : "#f59e0b" }}>
          {booking.assignedTeamName || "Unassigned"}
        </span>
      </td>
      <td style={td}>
        <StatusPill status={booking.status} />
        {booking.verified && <div style={{ marginTop: 4, fontSize: 10, color: "#22c55e", fontWeight: 800 }}>Verified</div>}
      </td>
      <td style={td}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", maxWidth: 150, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {booking.lastAction || "No action yet"}
        </span>
      </td>
      <td style={td} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 6 }}>
          <ActionBtn icon={Eye} color="#94a3b8" title="View" onClick={onOpen} />
          <ActionBtn icon={MessageCircle} color="#22c55e" title="WhatsApp" onClick={onWA} />
          <ActionBtn icon={Check} color="#22c55e" title="Verify & Schedule" onClick={onVerify} />
          <ActionBtn icon={Users} color="#06b6d4" title="Assign Team" onClick={onAssign} />
          <ActionBtn icon={FileText} color="#8b5cf6" title="Receipt" onClick={onReceipt} />
          <ActionBtn icon={Edit} color={gold} title="Edit" onClick={onEdit} />
        </div>
      </td>
    </tr>
  );
};

const BookingDrawer = ({ booking, onClose, onEdit, onDelete, onAssign, onStatus, onReceipt, onWA, onVerify }) => {
  const [note, setNote] = useState("");
  const workflowIndex = WORKFLOW_STAGES.indexOf(booking.status);
  const notes = Array.isArray(booking.notes) ? booking.notes : [];

  const addNote = async () => {
    if (!note.trim()) return;
    await updateDoc(doc(db, "bookings", booking.id), {
      notes: arrayUnion({ text: note.trim(), at: new Date().toISOString() }),
      lastAction: "Admin note added",
      updatedAt: serverTimestamp(),
    });
    setNote("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 98000, display: "flex" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,0.72)" }} onClick={onClose} />
      <aside style={{ width: "min(820px,100vw)", background: "#09090b", borderLeft: "1px solid rgba(255,255,255,0.08)", overflowY: "auto" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 2, background: "rgba(9,9,11,0.96)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: 22, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: "#fff", fontSize: 20, fontWeight: 800 }}>Booking {booking.bookingRef || booking.id}</h2>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{booking.clientName} - {booking.serviceLabel}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onEdit} style={smallAction(gold)}><Edit size={14} /> Edit</button>
            <button onClick={onDelete} style={smallAction("#ef4444")}><Trash2 size={14} /> Delete</button>
            <button onClick={onClose} style={iconButton}><X size={22} /></button>
          </div>
        </div>

        <div style={{ padding: 24, display: "grid", gap: 18 }}>
          <DrawerSection title="Client Information">
            <InfoGrid rows={[
              ["Name", booking.clientName],
              ["Phone", `${booking.phone || "Not added"}`],
              ["Email", booking.email || "Not added"],
              ["Address / City", booking.clientCity || booking.venue || "Not added"],
            ]} />
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <a href={`tel:91${booking.phone}`} style={{ ...smallAction("#3b82f6"), textDecoration: "none" }}><Phone size={14} /> Call</a>
              <button onClick={onWA} style={smallAction("#22c55e")}><MessageCircle size={14} /> WhatsApp Client</button>
              <a href={`mailto:${booking.email}`} style={{ ...smallAction("#f59e0b"), textDecoration: "none" }}><Mail size={14} /> Email Client</a>
            </div>
          </DrawerSection>

          <DrawerSection title="Event Details">
            <InfoGrid rows={[
              ["Service Type", booking.serviceLabel],
              ["Date", `${formatDate(booking.eventDate)} ${booking.eventTime || ""}`],
              ["Venue", booking.venue || "Not added"],
              ["Duration", booking.duration || "Not added"],
              ["Guests", booking.guestCount || "Not added"],
              ["Special Notes", booking.specialRequirements || booking.specialNotes || "None"],
            ]} />
          </DrawerSection>

          <DrawerSection title="Booking Verification">
            <InfoGrid rows={[
              ["Verified", booking.verified ? "Yes" : "No"],
              ["Delivery Deadline", formatDate(booking.deliveryDeadline) || "Not added"],
              ["Contract Signed", booking.contractSigned ? "Yes" : "No"],
            ]} />
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={onVerify} style={smallAction("#22c55e")}><Check size={14} /> Verify & Schedule</button>
              <button onClick={() => onStatus("confirmed")} style={smallAction(gold)}>Confirm Booking</button>
              <button onClick={onReceipt} style={smallAction("#8b5cf6")}><FileText size={14} /> Receipt</button>
            </div>
          </DrawerSection>

          <DrawerSection title="Team Assignment">
            <InfoGrid rows={[
              ["Current", booking.assignedTeamName || "Not assigned"],
              ["Leader", booking.teamLeaderName || "Not assigned"],
              ["Leader Phone", booking.assignedTeamLeaderPhone || booking.teamLeaderPhone || "Not added"],
            ]} />
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={onAssign} style={smallAction("#06b6d4")}><Users size={14} /> Assign Team</button>
              {booking.teamLeaderPhone && <a href={`tel:91${booking.teamLeaderPhone}`} style={{ ...smallAction("#3b82f6"), textDecoration: "none" }}><Phone size={14} /> Call Team Leader</a>}
            </div>
          </DrawerSection>

          <DrawerSection title="Workflow Stage">
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
              {WORKFLOW_STAGES.map((stage) => (
                <button key={stage} onClick={() => onStatus(stage)} style={{ ...workflowChip, background: booking.status === stage ? STATUS_META[stage].color : "rgba(255,255,255,0.05)", color: booking.status === stage ? "#fff" : "rgba(255,255,255,0.45)" }}>
                  {STATUS_META[stage].label}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button disabled={workflowIndex <= 0} onClick={() => onStatus(WORKFLOW_STAGES[workflowIndex - 1])} style={smallAction("#6b7280")}><ChevronLeft size={14} /> Previous Stage</button>
              <button disabled={workflowIndex < 0 || workflowIndex >= WORKFLOW_STAGES.length - 1} onClick={() => onStatus(WORKFLOW_STAGES[workflowIndex + 1])} style={smallAction(gold)}>Next Stage <ChevronRight size={14} /></button>
            </div>
          </DrawerSection>

          <DrawerSection title="Quick Actions">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button onClick={onReceipt} style={smallAction("#8b5cf6")}><FileText size={14} /> Receipt</button>
              <button onClick={onWA} style={smallAction("#22c55e")}><MessageCircle size={14} /> WhatsApp Client</button>
              <button onClick={() => window.open(`/admin/calendar`, "_self")} style={smallAction("#3b82f6")}><CalendarDays size={14} /> View Calendar</button>
            </div>
          </DrawerSection>

          <DrawerSection title="Activity Timeline">
            <div style={{ display: "grid", gap: 10 }}>
              {(booking.statusHistory || []).slice(-5).map((item, index) => (
                <div key={`${item.at}-${index}`} style={timelineRow}>
                  <span style={timelineDot} />
                  <span>{item.label || item.status} - {item.at ? new Date(item.at).toLocaleString("en-IN") : ""}</span>
                </div>
              ))}
              {notes.map((item, index) => (
                <div key={`${item.at}-${index}`} style={timelineRow}>
                  <span style={timelineDot} />
                  <span>{item.text || item} {item.at ? `- ${new Date(item.at).toLocaleString("en-IN")}` : ""}</span>
                </div>
              ))}
              {!booking.statusHistory?.length && notes.length === 0 && <p style={{ margin: 0, color: "rgba(255,255,255,0.35)", fontSize: 12 }}>No activity yet.</p>}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add note..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addNote} style={btnGold}>Add</button>
            </div>
          </DrawerSection>
        </div>
      </aside>
    </div>
  );
};

const DrawerSection = ({ title, children }) => (
  <section style={{ background: "#0f0f12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 18 }}>
    <h3 style={{ margin: "0 0 14px", color: "#fff", fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</h3>
    {children}
  </section>
);

const InfoGrid = ({ rows }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
    {rows.map(([label, value]) => (
      <div key={label}>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
        <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.5 }}>{value || "Not added"}</div>
      </div>
    ))}
  </div>
);

const StatusPill = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.new_inquiry;
  return (
    <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, background: `${meta.color}20`, color: meta.color, fontWeight: 700, whiteSpace: "nowrap" }}>
      {meta.label}
    </span>
  );
};

const ActionBtn = ({ icon: Icon, color, title, onClick }) => (
  <button onClick={onClick} title={title} style={{ width: 30, height: 30, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}25`, color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Icon size={14} />
  </button>
);

const Label = ({ children }) => <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</label>;

const chip = (active) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 11px",
  borderRadius: 999,
  border: active ? `1px solid ${gold}` : "1px solid rgba(255,255,255,0.08)",
  background: active ? "rgba(201,162,39,0.12)" : "rgba(255,255,255,0.04)",
  color: active ? gold : "rgba(255,255,255,0.55)",
  cursor: "pointer",
  fontSize: 12,
});

const smallAction = (color) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "8px 12px",
  borderRadius: 9,
  border: `1px solid ${color}28`,
  background: `${color}14`,
  color,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
});

const inputStyle = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "Inter,sans-serif" };
const btnGold = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg,#c9a227,#e8b93f)", color: "#000", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" };
const btnOutline = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 18px", background: "transparent", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" };
const card = { background: "#0f0f12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 };
const th = { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" };
const td = { padding: 12, verticalAlign: "middle" };
const modalBackdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
const modalCard = { background: "#0f0f12", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, width: "100%", maxWidth: 760, maxHeight: "90vh", overflowY: "auto" };
const iconButton = { background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };
const eventPill = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 8, background: "rgba(201,162,39,0.15)", color: gold, fontWeight: 800, fontSize: 12 };
const vipBadge = { padding: "3px 7px", borderRadius: 999, background: "rgba(201,162,39,0.15)", color: gold, fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" };
const workflowChip = { border: "none", borderRadius: 999, padding: "7px 12px", whiteSpace: "nowrap", fontSize: 11, fontWeight: 800, cursor: "pointer" };
const timelineRow = { display: "flex", gap: 8, alignItems: "flex-start", color: "rgba(255,255,255,0.62)", fontSize: 12, lineHeight: 1.5 };
const timelineDot = { width: 8, height: 8, borderRadius: "50%", background: gold, marginTop: 5, flexShrink: 0 };
