import React, { useState, useEffect } from "react";
import { arrayUnion, collection, getDocs, updateDoc, doc, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { buildTeamAssignmentWhatsApp, normalizePhone } from "../../utils/whatsapp";

const WAIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.59 1.967 14.11 .943 11.998.943c-5.444 0-9.868 4.373-9.873 9.804-.002 1.73.465 3.424 1.353 4.966l-.999 3.65 3.784-.982zM17.15 14.39c-.28-.14-1.65-.81-1.91-.9-.26-.1-.45-.14-.64.14-.19.28-.73.9-.9 1.09-.17.19-.34.21-.62.07-1.22-.61-2.03-1.07-2.83-2.45-.21-.36-.07-.55.07-.69.13-.13.28-.33.42-.49.14-.16.19-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.17-.01-.36-.01-.56-.01-.2 0-.52.07-.79.37-.27.3-1.03 1-1.03 2.44 0 1.44 1.05 2.84 1.19 3.03.14.19 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.71.22 1.35.19 1.86.11.57-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.12-.26-.19-.54-.33z"/>
  </svg>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

export default function AssignTeamModal({ booking, onAssign, onClose }) {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [draggingTeamId, setDraggingTeamId] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch teams, members + check conflicts for booking date
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [teamsSnap, membersSnap, bookingsSnap] = await Promise.all([
          getDocs(collection(db, "teams")),
          getDocs(collection(db, "members")),
          booking.eventDate
            ? getDocs(query(collection(db, "bookings"), where("eventDate", "==", booking.eventDate)))
            : Promise.resolve({ forEach: () => {} })
        ]);

        const membersList = [];
        membersSnap.forEach(d => {
          membersList.push({ id: d.id, ...d.data() });
        });

        const busyTeamIds = new Set();
        bookingsSnap.forEach(doc => {
          const bData = doc.data();
          const assignedId = bData.assignedTeamId || bData.assignedTeam;
          if (assignedId && bData.status !== "cancelled") {
            busyTeamIds.add(assignedId);
          }
        });

        const teamsList = [];
        teamsSnap.forEach(doc => {
          const tData = doc.data();
          const leader = membersList.find(m => m.id === tData.leaderId);
          const leaderName = tData.leaderName || tData.leader || leader?.name || "None Assigned";
          const leaderPhone = normalizePhone(tData.leaderPhone || tData.assignedTeamLeaderPhone || tData.phone || leader?.phone || "");
          teamsList.push({
            id: doc.id,
            name: tData.teamName || tData.name || "Untitled Team",
            leaderName,
            leaderPhone,
            rating: tData.rating || 5,
            members: Array.isArray(tData.members) ? tData.members : [],
            isAvailable: !busyTeamIds.has(doc.id)
          });
        });

        // Sort available teams first
        teamsList.sort((a, b) => (a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1));
        setTeams(teamsList);
      } catch (err) {
        console.error("Error fetching assignment data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (booking?.id) fetchData();
  }, [booking?.id, booking?.eventDate]);

  const handleAssign = async () => {
    if (!selectedTeam) return;
    setSending(true);
    try {
      // 1. Update booking in Firestore
      await updateDoc(doc(db, "bookings", booking.id), {
        assignedTeam: selectedTeam.id,
        assignedTeamId: selectedTeam.id,
        assignedTeamName: selectedTeam.name,
        teamLeaderName: selectedTeam.leaderName,
        teamLeaderPhone: selectedTeam.leaderPhone,
        assignedTeamLeaderPhone: selectedTeam.leaderPhone,
        status: "assigned",
        assignedAt: serverTimestamp(),
        lastAction: `Team assigned: ${selectedTeam.name}`,
        statusHistory: arrayUnion({
          status: "assigned",
          label: `Team assigned: ${selectedTeam.name}`,
          at: new Date().toISOString()
        })
      });

      // 2. Write audit log
      await addDoc(collection(db, "auditLogs"), {
        action: "TEAM_ASSIGNED",
        bookingId: booking.id,
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        by: auth.currentUser?.uid || "system",
        timestamp: serverTimestamp()
      });

      // 3. Open WhatsApp with location if leader phone exists
      if (selectedTeam.leaderPhone) {
        const waUrl = buildTeamAssignmentWhatsApp(selectedTeam.leaderPhone, {
          ...booking,
          teamLeaderName: selectedTeam.leaderName
        });
        window.open(waUrl, "_blank");
      }

      onAssign(selectedTeam);
      onClose();
    } catch (e) {
      console.error("Failed to assign team:", e);
    } finally {
      setSending(false);
    }
  };

  const chooseTeam = (team) => {
    if (team?.isAvailable) setSelectedTeam(team);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const teamId = event.dataTransfer.getData("text/plain") || draggingTeamId;
    const team = teams.find((item) => item.id === teamId);
    chooseTeam(team);
    setDraggingTeamId("");
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[99000] flex items-center justify-center p-4">
      <div className="bg-[#0F1117] border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl relative overflow-hidden">
        {/* Shimmer Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-brand-gold/5 rounded-full blur-2xl" />

        <div className="flex justify-between items-start border-b border-white/5 pb-3">
          <div>
            <h3 className="text-white font-serif font-bold text-lg">Assign Operational Team</h3>
            <p className="text-[10px] text-gray-500 font-light mt-0.5">
              {booking.eventType} for {booking.clientName} on {formatDate(booking.eventDate)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1">✕</button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-gray-500 font-mono">Verifying Availability...</span>
          </div>
        ) : (
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className={`rounded-2xl border border-dashed p-4 text-center transition-colors ${
                selectedTeam ? "border-brand-gold bg-brand-gold/10" : "border-white/10 bg-black/30"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">
                {selectedTeam ? `Dropped: ${selectedTeam.name}` : `Drop team for ${booking.clientName || "this booking"}`}
              </p>
              <p className="mt-1 text-[9px] text-gray-500">Click a team below as the fallback for mobile and keyboard use.</p>
            </div>
            {teams.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-6">No teams registered. Go to Teams dashboard first.</p>
            ) : (
              teams.map((team) => (
                <div
                  key={team.id}
                  draggable={team.isAvailable}
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", team.id);
                    setDraggingTeamId(team.id);
                  }}
                  onDragEnd={() => setDraggingTeamId("")}
                  onClick={() => chooseTeam(team)}
                  className={`p-4 rounded-2xl border transition-all flex justify-between items-center cursor-pointer
                    ${!team.isAvailable 
                      ? 'opacity-40 bg-black/20 border-white/5 cursor-not-allowed' 
                      : draggingTeamId === team.id
                        ? 'border-brand-gold bg-brand-gold/20'
                      : selectedTeam?.id === team.id
                        ? 'border-brand-gold bg-brand-gold/10'
                        : 'border-white/5 bg-black/40 hover:border-white/10'}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-serif font-bold text-sm">{team.name}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono
                        ${team.isAvailable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}
                      >
                        {team.isAvailable ? 'Free' : 'Booked'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 block">
                      Leader: <strong className="text-gray-300 font-medium">{team.leaderName}</strong>
                    </span>
                    <span className="text-[9px] text-gray-600 block">
                      {team.members.length} member{team.members.length === 1 ? "" : "s"} registered
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono text-brand-gold">⭐ {team.rating || 5}.0</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTeam && (
          <div className="bg-emerald-950/20 border border-emerald-950/50 rounded-2xl p-4 space-y-1 text-xs">
            <p className="font-semibold text-emerald-400">Selected: {selectedTeam.name}</p>
            <p className="text-[10px] text-gray-400">
              Leader: {selectedTeam.leaderName} {selectedTeam.leaderPhone ? `(${selectedTeam.leaderPhone})` : ""}
            </p>
            <p className="text-[9px] text-emerald-500/80 leading-relaxed font-light mt-1">
              ✅ Confirming will open WhatsApp automatically with event schedule and Google Maps venue link.
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 py-3 border border-white/10 hover:bg-white/5 rounded-xl text-xs uppercase tracking-wider font-semibold text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedTeam || sending}
            className="flex-1 py-3 bg-brand-gold text-black hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-brand-gold rounded-xl text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-1.5"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <WAIcon size={14} /> Assign & WA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
