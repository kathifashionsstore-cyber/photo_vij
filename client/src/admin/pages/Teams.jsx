import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import {
  Calendar,
  CheckCircle,
  Clock,
  MessageCircle,
  Phone,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { db } from "../../firebase";

const gold = "#c9a227";

const ROLES = [
  "Candid Photographer",
  "Candid Videographer",
  "Traditional Photo",
  "Traditional Video",
  "Audience Coverage Traditional Video",
  "Audience Coverage Traditional Photo",
  "Audience Coverage Candid Video",
  "Audience Coverage Candid Photo",
  "Drone",
  "Live",
  "Screen",
];

const EMPTY_TEAM = { teamName: "", leaderName: "", leaderPhone: "", notes: "" };
const EMPTY_MEMBER = { name: "", phone: "", role: "Candid Photographer" };

const today = () => new Date().toISOString().split("T")[0];

const EMPTY_ASSIGN = {
  teamId: "",
  bookingId: "",
  clientName: "",
  eventType: "Wedding",
  startDate: today(),
  endDate: today(),
  venue: "",
  notes: "",
};

const eventTypes = ["Wedding", "Pre-Wedding", "Birthday", "Corporate", "Product Shoot", "Baby Shoot", "Other"];

const daysLeft = (endDate) => {
  const diff = new Date(`${endDate}T00:00:00`) - new Date(`${today()}T00:00:00`);
  return Math.ceil(diff / 86400000);
};

const fmt = (value) => {
  if (!value) return "-";
  const d = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const normalizePhone = (phone = "") => String(phone).replace(/\D/g, "").replace(/^91/, "");

const getTeamName = (team) => team.teamName || team.name || "Untitled Team";
const getLeaderName = (team) => team.leaderName || team.leader || "Not added";
const getLeaderPhone = (team) => normalizePhone(team.leaderPhone || team.phone || "");
const getMembers = (team) => (Array.isArray(team.members) ? team.members : []);

const groupedByRole = (members) =>
  members.reduce((acc, member) => {
    const role = member.role || "Unassigned";
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {});

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showTeam, setShowTeam] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [teamForm, setTeamForm] = useState(EMPTY_TEAM);
  const [members, setMembers] = useState([{ ...EMPTY_MEMBER }]);
  const [assignForm, setAssignForm] = useState(EMPTY_ASSIGN);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("teams");

  useEffect(() => {
    const unsubTeams = onSnapshot(
      query(collection(db, "teams"), orderBy("createdAt", "desc")),
      (snap) => setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Teams listener failed:", err),
    );

    const unsubAssignments = onSnapshot(
      query(collection(db, "assignments"), orderBy("startDate", "desc")),
      (snap) => setAssignments(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error("Assignments listener failed:", err),
    );

    return () => {
      unsubTeams();
      unsubAssignments();
    };
  }, []);

  const activeAssignments = useMemo(
    () => assignments.filter((item) => item.status !== "completed" && item.endDate >= today()),
    [assignments],
  );

  const getTeamStatus = (teamId) => {
    const active = activeAssignments.filter((item) => item.teamId === teamId);
    if (active.length === 0) return { free: true, label: "Available" };

    const soonest = [...active].sort((a, b) => new Date(a.endDate) - new Date(b.endDate))[0];
    const left = daysLeft(soonest.endDate);

    return {
      free: false,
      daysLeft: left,
      assignment: soonest,
      label: left === 0 ? "Completes today" : left === 1 ? "Completes tomorrow" : `Busy until ${fmt(soonest.endDate)} (${left} days left)`,
    };
  };

  const resetTeam = () => {
    setTeamForm(EMPTY_TEAM);
    setMembers([{ ...EMPTY_MEMBER }]);
  };

  const resetAssign = () => setAssignForm(EMPTY_ASSIGN);

  const saveTeam = async () => {
    if (!teamForm.teamName.trim() || !teamForm.leaderName.trim()) {
      alert("Team name and leader are required");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "teams"), {
        ...teamForm,
        leaderPhone: normalizePhone(teamForm.leaderPhone),
        members: members
          .filter((member) => member.name.trim())
          .map((member) => ({ ...member, phone: normalizePhone(member.phone) })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      resetTeam();
      setShowTeam(false);
    } catch (err) {
      alert("Failed to save team: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveAssignment = async () => {
    if (!assignForm.teamId || !assignForm.clientName.trim() || !assignForm.startDate) {
      alert("Team, client, and start date are required");
      return;
    }

    const endDate = assignForm.endDate || assignForm.startDate;
    if (endDate < assignForm.startDate) {
      alert("End date cannot be before start date");
      return;
    }

    const team = teams.find((item) => item.id === assignForm.teamId);
    setSaving(true);
    try {
      await addDoc(collection(db, "assignments"), {
        ...assignForm,
        endDate,
        teamName: team ? getTeamName(team) : "",
        teamLeaderPhone: team ? getLeaderPhone(team) : "",
        status: "active",
        createdAt: serverTimestamp(),
      });

      if (team && getLeaderPhone(team)) {
        const mapQ = encodeURIComponent(`${assignForm.venue || "Vijayawada"} Vijayawada`);
        const msg = encodeURIComponent(
          [
            "*NEW SNAPLICA ASSIGNMENT*",
            "",
            `Hi ${getLeaderName(team)}!`,
            "",
            `Event: ${assignForm.eventType}`,
            `Client: ${assignForm.clientName}`,
            `Start: ${fmt(assignForm.startDate)}`,
            `End: ${fmt(endDate)}`,
            `Venue: ${assignForm.venue || "-"}`,
            assignForm.notes ? `Notes: ${assignForm.notes}` : "",
            "",
            `Location: https://maps.google.com/maps?q=${mapQ}`,
            "",
            "Please confirm availability.",
            "- Snaplica Admin",
          ].filter(Boolean).join("\n"),
        );
        window.open(`https://wa.me/91${getLeaderPhone(team)}?text=${msg}`, "_blank");
      }

      resetAssign();
      setShowAssign(false);
      setTab("assignments");
    } catch (err) {
      alert("Failed to assign team: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const markComplete = async (id) => {
    await updateDoc(doc(db, "assignments", id), { status: "completed", completedAt: serverTimestamp() });
  };

  const deleteAssignment = async (id) => {
    if (window.confirm("Remove this assignment?")) {
      await deleteDoc(doc(db, "assignments", id));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff" }}>Teams & Crew</h1>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            {teams.length} teams. {activeAssignments.length} active assignments.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => setShowAssign(true)} style={{ ...btnGold, background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.25)" }}>
            <Calendar size={15} /> Assign Project
          </button>
          <button onClick={() => setShowTeam(true)} style={btnGold}>
            <Plus size={15} /> New Team
          </button>
        </div>
      </div>

      <div style={tabs}>
        {["teams", "assignments"].map((item) => (
          <button key={item} onClick={() => setTab(item)} style={tabButton(tab === item)}>
            {item}
          </button>
        ))}
      </div>

      {tab === "teams" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
          {teams.length === 0 && (
            <EmptyState title="No teams yet" action="Add First Team" onAction={() => setShowTeam(true)} />
          )}

          {teams.map((team) => {
            const status = getTeamStatus(team.id);
            const roleGroups = groupedByRole(getMembers(team));
            const rolesCovered = Object.keys(roleGroups);

            return (
              <div key={team.id} style={{ ...card, borderColor: status.free ? "rgba(255,255,255,0.07)" : "rgba(239,68,68,0.24)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, color: gold, fontWeight: 800 }}>{getTeamName(team)}</h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Leader: {getLeaderName(team)}</p>
                  </div>
                  <StatusBadge status={status} />
                </div>

                {!status.free && (
                  <div style={busyBox}>
                    <p style={{ margin: 0, color: "#fecaca", fontSize: 12, fontWeight: 700 }}>
                      {status.assignment.eventType} - {status.assignment.clientName}
                    </p>
                    <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                      {fmt(status.assignment.startDate)} to {fmt(status.assignment.endDate)}
                    </p>
                    <p style={{ margin: "5px 0 0", color: status.daysLeft <= 1 ? "#fbbf24" : "#f87171", fontSize: 11, fontWeight: 700 }}>
                      <Clock size={11} style={{ display: "inline", marginRight: 4 }} />
                      {status.label}
                    </p>
                  </div>
                )}

                <p style={{ display: "flex", alignItems: "center", gap: 6, margin: "0 0 12px", color: "rgba(255,255,255,0.42)", fontSize: 12 }}>
                  <Users size={13} /> {getMembers(team).length} members. Roles covered: {rolesCovered.length || 0}
                </p>

                {rolesCovered.length > 0 && (
                  <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
                    {rolesCovered.map((role) => (
                      <div key={role} style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.025)", borderRadius: 10, padding: 10 }}>
                        <div style={{ color: "rgba(201,162,39,0.9)", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 5 }}>
                          {role}
                        </div>
                        {roleGroups[role].map((member, index) => (
                          <div key={`${role}-${member.name}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "3px 0", color: "rgba(255,255,255,0.62)", fontSize: 12 }}>
                            <span>{member.name}</span>
                            <span style={{ color: "rgba(255,255,255,0.32)" }}>{member.phone || ""}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <a href={`tel:+91${getLeaderPhone(team)}`} style={{ ...smallAction("#3b82f6"), flex: 1, textDecoration: "none" }}>
                    <Phone size={13} /> Call
                  </a>
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(`Hi ${getLeaderName(team)}! Checking in from Snaplica Photography. Please update your team status.`);
                      window.open(`https://wa.me/91${getLeaderPhone(team)}?text=${msg}`, "_blank");
                    }}
                    style={{ ...smallAction("#22c55e"), flex: 1 }}
                  >
                    <MessageCircle size={13} /> WhatsApp
                  </button>
                  <button
                    onClick={() => {
                      setAssignForm((prev) => ({ ...prev, teamId: team.id }));
                      setShowAssign(true);
                    }}
                    style={{ ...smallAction(gold), flex: 1 }}
                  >
                    Assign
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "assignments" && (
        <div style={card}>
          {assignments.length === 0 ? (
            <p style={{ margin: 0, padding: 36, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
              No assignments yet. Use Assign Project to schedule crew.
            </p>
          ) : (
            assignments.map((item) => {
              const left = daysLeft(item.endDate);
              const active = item.status === "active" && item.endDate >= today();
              return (
                <div key={item.id} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: item.status === "completed" ? "#22c55e" : active ? "#f59e0b" : "#6b7280", marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                      <div>
                        <p style={{ margin: 0, color: "#fff", fontSize: 13, fontWeight: 700 }}>
                          {item.teamName} - {item.eventType}
                        </p>
                        <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Client: {item.clientName}</p>
                        <p style={{ margin: "3px 0 0", color: "rgba(255,255,255,0.38)", fontSize: 12 }}>
                          {fmt(item.startDate)} to {fmt(item.endDate)}. {item.venue || "Venue not added"}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {active && (
                          <span style={{ ...pill, background: left <= 1 ? "rgba(251,191,36,0.1)" : "rgba(239,68,68,0.1)", color: left <= 1 ? "#fbbf24" : "#ef4444" }}>
                            {left === 0 ? "Due today" : left === 1 ? "Due tomorrow" : `${left}d left`}
                          </span>
                        )}
                        {item.status === "completed" && <span style={{ ...pill, background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>Completed</span>}
                        {active && (
                          <button onClick={() => markComplete(item.id)} style={smallAction("#22c55e")}>
                            <CheckCircle size={13} /> Mark Done
                          </button>
                        )}
                        <button onClick={() => deleteAssignment(item.id)} style={{ ...smallAction("#ef4444"), padding: 8 }} title="Remove assignment">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showTeam && (
        <Modal title="New Team" onClose={() => setShowTeam(false)} width={620}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <Label>Team Name *</Label>
              <input value={teamForm.teamName} onChange={(e) => setTeamForm((prev) => ({ ...prev, teamName: e.target.value }))} placeholder="Team A" style={inputStyle} />
            </div>
            <div>
              <Label>Leader Name *</Label>
              <input value={teamForm.leaderName} onChange={(e) => setTeamForm((prev) => ({ ...prev, leaderName: e.target.value }))} placeholder="Ravi Kumar" style={inputStyle} />
            </div>
            <div>
              <Label>Leader Phone</Label>
              <input value={teamForm.leaderPhone} onChange={(e) => setTeamForm((prev) => ({ ...prev, leaderPhone: e.target.value }))} placeholder="9876543210" style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <Label>Notes</Label>
              <textarea value={teamForm.notes} onChange={(e) => setTeamForm((prev) => ({ ...prev, notes: e.target.value }))} rows={2} placeholder="Any additional info..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Label>Team Members</Label>
              <button type="button" onClick={() => setMembers((prev) => [...prev, { ...EMPTY_MEMBER }])} style={miniGold}>
                <Plus size={13} /> Add Member
              </button>
            </div>
            {members.map((member, index) => (
              <div key={index} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr)) auto", gap: 8, alignItems: "end", marginBottom: 8 }}>
                <div>
                  <Label>Name</Label>
                  <input value={member.name} onChange={(e) => updateMember(index, "name", e.target.value, setMembers)} placeholder="Name" style={inputStyle} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <input value={member.phone} onChange={(e) => updateMember(index, "phone", e.target.value, setMembers)} placeholder="Phone" style={inputStyle} />
                </div>
                <div>
                  <Label>Role</Label>
                  <select value={member.role} onChange={(e) => updateMember(index, "role", e.target.value, setMembers)} style={inputStyle}>
                    {ROLES.map((role) => <option key={role}>{role}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => setMembers((prev) => prev.filter((_, i) => i !== index))} style={{ ...smallAction("#ef4444"), height: 40, padding: 10 }} title="Remove member">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="button" onClick={() => setShowTeam(false)} style={{ flex: 1, ...btnOutline }}>Cancel</button>
            <button type="button" onClick={saveTeam} disabled={saving} style={{ flex: 2, ...btnGold }}>{saving ? "Saving..." : "Save Team"}</button>
          </div>
        </Modal>
      )}

      {showAssign && (
        <Modal title="Assign Project" onClose={() => setShowAssign(false)} width={620}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            <div style={{ gridColumn: "1/-1" }}>
              <Label>Team *</Label>
              <select value={assignForm.teamId} onChange={(e) => setAssignForm((prev) => ({ ...prev, teamId: e.target.value }))} style={inputStyle}>
                <option value="">Choose team</option>
                {teams.map((team) => {
                  const status = getTeamStatus(team.id);
                  const roles = Object.keys(groupedByRole(getMembers(team))).join(", ");
                  return (
                    <option key={team.id} value={team.id}>
                      {status.free ? "Available" : status.label} - {getTeamName(team)} {roles ? `(${roles})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <Label>Booking ID</Label>
              <input value={assignForm.bookingId} onChange={(e) => setAssignForm((prev) => ({ ...prev, bookingId: e.target.value }))} placeholder="Optional booking ID" style={inputStyle} />
            </div>
            <div>
              <Label>Client Name *</Label>
              <input value={assignForm.clientName} onChange={(e) => setAssignForm((prev) => ({ ...prev, clientName: e.target.value }))} placeholder="Rahul Sharma" style={inputStyle} />
            </div>
            <div>
              <Label>Event Type</Label>
              <select value={assignForm.eventType} onChange={(e) => setAssignForm((prev) => ({ ...prev, eventType: e.target.value }))} style={inputStyle}>
                {eventTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <Label>Venue</Label>
              <input value={assignForm.venue} onChange={(e) => setAssignForm((prev) => ({ ...prev, venue: e.target.value }))} placeholder="Taj Hotel" style={inputStyle} />
            </div>
            <div>
              <Label>Start Date *</Label>
              <input type="date" value={assignForm.startDate} onChange={(e) => setAssignForm((prev) => ({ ...prev, startDate: e.target.value, endDate: prev.endDate || e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <Label>End Date</Label>
              <input type="date" value={assignForm.endDate} onChange={(e) => setAssignForm((prev) => ({ ...prev, endDate: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <Label>Notes</Label>
              <textarea value={assignForm.notes} onChange={(e) => setAssignForm((prev) => ({ ...prev, notes: e.target.value }))} rows={3} placeholder="Schedule, reporting time, or gear notes..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button type="button" onClick={() => setShowAssign(false)} style={{ flex: 1, ...btnOutline }}>Cancel</button>
            <button type="button" onClick={saveAssignment} disabled={saving} style={{ flex: 2, ...btnGold }}>{saving ? "Assigning..." : "Assign & WhatsApp"}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const updateMember = (index, key, value, setMembers) => {
  setMembers((prev) => {
    const next = [...prev];
    next[index] = { ...next[index], [key]: value };
    return next;
  });
};

const StatusBadge = ({ status }) => (
  <span style={{
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 800,
    whiteSpace: "nowrap",
    background: status.free ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
    color: status.free ? "#22c55e" : "#ef4444",
  }}>
    {status.free ? "Available" : status.daysLeft === 1 ? "Completes tomorrow" : "Busy"}
  </span>
);

const EmptyState = ({ title, action, onAction }) => (
  <div style={{ ...card, gridColumn: "1/-1", padding: 58, textAlign: "center" }}>
    <Users size={46} style={{ color: gold, opacity: 0.5, margin: "0 auto 12px" }} />
    <p style={{ margin: 0, color: "rgba(255,255,255,0.48)", fontSize: 15 }}>{title}</p>
    <button onClick={onAction} style={{ ...btnGold, marginTop: 16 }}><Plus size={15} /> {action}</button>
  </div>
);

const Modal = ({ title, width, children, onClose }) => (
  <div style={modalBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div style={{ ...modalCard, maxWidth: width }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <h2 style={{ margin: 0, color: "#fff", fontSize: 18, fontWeight: 800 }}>{title}</h2>
        <button onClick={onClose} style={iconButton}><X size={20} /></button>
      </div>
      {children}
    </div>
  </div>
);

const Label = ({ children }) => (
  <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 11, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
    {children}
  </label>
);

const tabs = { display: "flex", gap: 4, marginBottom: 20, background: "rgba(255,255,255,0.03)", padding: 4, borderRadius: 12, width: "fit-content" };
const tabButton = (active) => ({ padding: "8px 20px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, textTransform: "capitalize", background: active ? "#fff" : "transparent", color: active ? "#000" : "rgba(255,255,255,0.42)" });
const card = { background: "#0f0f12", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 };
const busyBox = { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: 10, padding: 10, marginBottom: 12 };
const pill = { fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 800 };
const inputStyle = { width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, outline: "none", fontFamily: "Inter,sans-serif" };
const btnGold = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 18px", background: "linear-gradient(135deg,#c9a227,#e8b93f)", color: "#000", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" };
const btnOutline = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 18px", background: "transparent", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" };
const miniGold = { display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.22)", color: gold, borderRadius: 7, padding: "5px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" };
const smallAction = (color) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 10px", borderRadius: 9, border: `1px solid ${color}28`, background: `${color}14`, color, fontSize: 12, fontWeight: 800, cursor: "pointer" });
const modalBackdrop = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 };
const modalCard = { background: "#0f0f12", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "clamp(16px,4vw,28px)", width: "100%", maxHeight: "90vh", overflowY: "auto", boxSizing: "border-box" };
const iconButton = { background: "transparent", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };
