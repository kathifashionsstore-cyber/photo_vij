import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  updateDoc,
  getDocs
} from "firebase/firestore";
import { db } from "../../firebase";
import { 
  Phone, 
  Users, 
  Receipt, 
  Eye, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon, 
  ArrowRight,
  ExternalLink
} from "lucide-react";
import AssignTeamModal from "../../components/admin/AssignTeamModal";
import { 
  buildClientConfirmationWhatsApp, 
  buildTeamAssignmentWhatsApp
} from "../../utils/whatsapp";

const STATUS_COLORS = {
  new_inquiry:     { bg: "#6366f1", border: "#4f46e5", text: "#fff", label: "New Inquiry" },
  contacted:       { bg: "#8b5cf6", border: "#7c3aed", text: "#fff", label: "Contacted" },
  quotation_sent:  { bg: "#f59e0b", border: "#d97706", text: "#000", label: "Details Sent" },
  booked:          { bg: "#3b82f6", border: "#2563eb", text: "#fff", label: "Booked" },
  assigned:        { bg: "#06b6d4", border: "#0891b2", text: "#000", label: "Assigned" },
  in_progress:     { bg: "#f97316", border: "#ea580c", text: "#fff", label: "In Progress" },
  completed:       { bg: "#22c55e", border: "#16a34a", text: "#fff", label: "Completed" },
  editing:         { bg: "#a855f7", border: "#9333ea", text: "#fff", label: "Editing" },
  delivered:       { bg: "#10b981", border: "#059669", text: "#fff", label: "Delivered" },
  cancelled:       { bg: "#6b7280", border: "#4b5563", text: "#fff", label: "Cancelled" },
  pending_details: { bg: "#ef4444", border: "#dc2626", text: "#fff", label: "Details Needed" }
};

const WAIcon = ({ size = 14 }) => (
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

export const Calendar = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [bookingForAssign, setBookingForAssign] = useState(null);
  
  // Dashboard indicators
  const [todayEvents, setTodayEvents] = useState([]);
  const [tomorrowEvents, setTomorrowEvents] = useState([]);
  const [tomorrowTeamsAvailability, setTomorrowTeamsAvailability] = useState([]);

  // Subscribe to bookings in real-time
  useEffect(() => {
    const q = query(collection(db, "bookings"));
    const unsub = onSnapshot(q, (snap) => {
      const bList = [];
      snap.forEach(d => {
        bList.push({ id: d.id, ...d.data() });
      });
      setBookings(bList);
      calculateSummaryEvents(bList);
    });
    return unsub;
  }, []);

  const calculateSummaryEvents = async (bList) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Filter today & tomorrow events
    const todayList = bList.filter(b => b.eventDate === todayStr && b.status !== "cancelled");
    const tomorrowList = bList.filter(b => b.eventDate === tomorrowStr && b.status !== "cancelled");
    setTodayEvents(todayList);
    setTomorrowEvents(tomorrowList);

    // Fetch tomorrow's team availability
    try {
      const teamsSnap = await getDocs(collection(db, "teams"));
      const membersSnap = await getDocs(collection(db, "members"));
      
      const membersList = [];
      membersSnap.forEach(d => {
        membersList.push({ id: d.id, ...d.data() });
      });

      const bookedTeamIdsTomorrow = new Set(
        tomorrowList.map(b => b.assignedTeam).filter(Boolean)
      );

      const availability = [];
      teamsSnap.forEach(tDoc => {
        const tData = tDoc.data();
        const leader = membersList.find(m => m.id === tData.leaderId);
        availability.push({
          id: tDoc.id,
          name: tData.name,
          leaderName: leader ? leader.name : "None",
          isFree: !bookedTeamIdsTomorrow.has(tDoc.id),
          assignedEvent: tomorrowList.find(b => b.assignedTeam === tDoc.id)
        });
      });
      setTomorrowTeamsAvailability(availability);
    } catch (err) {
      console.error("Error calculating team availability:", err);
    }
  };

  const handleEventClick = (info) => {
    const bookingId = info.event.id;
    const found = bookings.find(b => b.id === bookingId);
    if (found) {
      setSelectedEvent(found);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status: newStatus });
      setSelectedEvent(prev => prev && prev.id === bookingId ? { ...prev, status: newStatus } : prev);
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleAssignSuccess = (team) => {
    if (selectedEvent) {
      setSelectedEvent(prev => ({
        ...prev,
        assignedTeam: team.id,
        assignedTeamName: team.name,
        teamLeaderName: team.leaderName,
        teamLeaderPhone: team.leaderPhone,
        status: "assigned"
      }));
    }
  };

  const calendarEvents = bookings.map(b => ({
    id: b.id,
    title: `📸 ${b.clientName || "Client"} - ${b.eventType || "Event"}`,
    start: b.eventDate,
    end: b.eventEndDate || b.eventDate,
    backgroundColor: STATUS_COLORS[b.status]?.bg || "#6366f1",
    borderColor: STATUS_COLORS[b.status]?.border || "#4f46e5",
    textColor: STATUS_COLORS[b.status]?.text || "#fff"
  }));

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Interactive Operations Calendar</h1>
          <p className="text-xs text-gray-500 mt-1 font-light">
            Manage shoots, confirm lead status, assign teams, and route notifications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-10 gap-8 items-start">
        {/* LEFT PANEL: Interactive calendar (70%) */}
        <div className="xl:col-span-7 bg-[#0f0f12] border border-white/5 p-6 rounded-3xl shadow-2xl overflow-hidden">
          <div className="calendar-container text-xs text-white">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,listMonth"
              }}
              events={calendarEvents}
              eventClick={handleEventClick}
              editable={true}
              selectable={true}
              height="auto"
            />
          </div>
        </div>

        {/* RIGHT PANEL: Context Sidebar (30%) */}
        <div className="xl:col-span-3 space-y-6">
          {selectedEvent ? (
            /* Selected Event Context Panel */
            <div className="bg-[#0f0f12] border border-brand-gold/30 rounded-3xl p-6 space-y-5 shadow-2xl relative">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-500 hover:text-white text-xs border border-white/10 px-2 py-1 rounded"
                >
                  Clear Selection
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gold block font-semibold">
                  Event Details
                </span>
                <h3 className="text-white font-serif font-bold text-lg leading-tight">
                  {selectedEvent.eventType}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>{formatDate(selectedEvent.eventDate)} {selectedEvent.eventTime ? `at ${selectedEvent.eventTime}` : ""}</span>
                </div>
                {selectedEvent.venue && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.venue + " Vijayawada")}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="hover:underline text-brand-gold flex items-center gap-1 leading-none"
                    >
                      {selectedEvent.venue} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="border-t border-white/5 pt-4 space-y-2">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                  Client Profile
                </h4>
                <div className="text-xs">
                  <p className="font-semibold text-white">{selectedEvent.clientName}</p>
                  <p className="text-gray-500 font-mono mt-0.5">{selectedEvent.phone}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <a 
                    href={`tel:${selectedEvent.phone}`}
                    className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                  <button 
                    onClick={() => {
                      const waUrl = buildClientConfirmationWhatsApp(
                        selectedEvent.phone, 
                        selectedEvent.clientName, 
                        selectedEvent.eventType, 
                        selectedEvent.eventDate, 
                        selectedEvent.venue
                      );
                      window.open(waUrl, "_blank");
                    }}
                    className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                  >
                    <WAIcon size={12} /> Confirm WA
                  </button>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                    Operational Team
                  </h4>
                  {!selectedEvent.assignedTeam && (
                    <span className="text-[9px] bg-amber-500/10 text-brand-gold px-1.5 py-0.5 rounded font-mono">Unassigned</span>
                  )}
                </div>
                {selectedEvent.assignedTeam ? (
                  <div className="text-xs space-y-2">
                    <div>
                      <p className="font-semibold text-white">{selectedEvent.assignedTeamName}</p>
                      <p className="text-gray-500 font-light mt-0.5">
                        Leader: {selectedEvent.teamLeaderName || "None"}
                      </p>
                    </div>
                    {selectedEvent.teamLeaderPhone && (
                      <button 
                        onClick={() => {
                          const waUrl = buildTeamAssignmentWhatsApp(selectedEvent.teamLeaderPhone, selectedEvent);
                          window.open(waUrl, "_blank");
                        }}
                        className="w-full py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                      >
                        <WAIcon size={12} /> WA Location to Crew
                      </button>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setBookingForAssign(selectedEvent);
                      setAssignModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-brand-gold text-black hover:bg-amber-500 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    Assign Operational Crew
                  </button>
                )}

                {selectedEvent.assignedTeam && (
                  <button 
                    onClick={() => {
                      setBookingForAssign(selectedEvent);
                      setAssignModalOpen(true);
                    }}
                    className="w-full py-2 border border-white/10 hover:bg-white/5 text-gray-300 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                  >
                    Reassign Team
                  </button>
                )}
              </div>

              <div className="border-t border-white/5 pt-4 space-y-2">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                  Status & Schedule
                </h4>
                <div className="flex gap-2 items-center text-xs">
                  <span className="text-gray-500">Pipeline Status:</span>
                  <select 
                    value={selectedEvent.status || "booked"}
                    onChange={(e) => updateBookingStatus(selectedEvent.id, e.target.value)}
                    className="bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-[11px] focus:border-brand-gold outline-none"
                  >
                    {Object.entries(STATUS_COLORS).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Default Operations Overview */
            <div className="space-y-6">
              {/* TODAY'S EVENTS WIDGET */}
              <div className="bg-[#0f0f12] border border-white/5 rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="text-white font-serif font-bold text-base flex items-center gap-1.5 border-b border-white/5 pb-3">
                  <CalendarIcon className="w-4 h-4 text-brand-gold" /> Today's Events ({todayEvents.length})
                </h3>
                {todayEvents.length === 0 ? (
                  <p className="text-xs text-gray-600 font-light">No operational events scheduled today.</p>
                ) : (
                  <div className="space-y-3">
                    {todayEvents.map(event => (
                      <div 
                        key={event.id} 
                        onClick={() => setSelectedEvent(event)}
                        className="p-3 border-l-2 bg-black/30 border-white/5 hover:border-brand-gold rounded-r-xl transition-all cursor-pointer space-y-1.5"
                        style={{ borderLeftColor: STATUS_COLORS[event.status]?.bg }}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-xs text-white truncate max-w-[130px]">{event.eventType} - {event.clientName}</p>
                          <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 uppercase tracking-wider">{event.eventTime || "Full Day"}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{event.venue}</p>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-brand-gold truncate font-medium">
                            👥 {event.assignedTeamName || "Unassigned"}
                          </span>
                          {event.teamLeaderPhone && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const waUrl = buildTeamAssignmentWhatsApp(event.teamLeaderPhone, event);
                                window.open(waUrl, "_blank");
                              }}
                              className="text-[9px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded hover:bg-green-500/20 flex items-center gap-0.5"
                            >
                              <WAIcon size={10} /> Msg
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* TOMORROW'S EVENTS WIDGET */}
              <div className="bg-[#0f0f12] border border-white/5 rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="text-white font-serif font-bold text-base flex items-center gap-1.5 border-b border-white/5 pb-3">
                  <Clock className="w-4 h-4 text-brand-gold" /> Tomorrow's Schedule ({tomorrowEvents.length})
                </h3>
                {tomorrowEvents.length === 0 ? (
                  <p className="text-xs text-gray-600 font-light">No operational events scheduled tomorrow.</p>
                ) : (
                  <div className="space-y-3">
                    {tomorrowEvents.map(event => (
                      <div 
                        key={event.id} 
                        onClick={() => setSelectedEvent(event)}
                        className="p-3 border-l-2 bg-black/30 border-white/5 hover:border-brand-gold rounded-r-xl transition-all cursor-pointer space-y-1.5"
                        style={{ borderLeftColor: STATUS_COLORS[event.status]?.bg }}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-xs text-white truncate max-w-[130px]">{event.eventType} - {event.clientName}</p>
                          <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 uppercase tracking-wider">{event.eventTime || "Full Day"}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{event.venue}</p>
                        <div className="flex justify-between items-center text-[10px] pt-1">
                          {event.assignedTeam ? (
                            <span className="text-brand-gold font-medium">👥 {event.assignedTeamName}</span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookingForAssign(event);
                                setAssignModalOpen(true);
                              }}
                              className="text-[9px] bg-amber-500/10 text-brand-gold px-2 py-0.5 rounded hover:bg-brand-gold hover:text-black font-semibold uppercase tracking-wider"
                            >
                              Assign Team
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AVAILABLE TEAMS TOMORROW */}
              <div className="bg-[#0f0f12] border border-white/5 rounded-3xl p-6 space-y-4 shadow-2xl">
                <h3 className="text-white font-serif font-bold text-base flex items-center gap-1.5 border-b border-white/5 pb-3">
                  <Users className="w-4 h-4 text-brand-gold" /> Tomorrow's Team Status
                </h3>
                {tomorrowTeamsAvailability.length === 0 ? (
                  <p className="text-xs text-gray-600 font-light">No operational crew units registered.</p>
                ) : (
                  <div className="space-y-2.5">
                    {tomorrowTeamsAvailability.map(team => (
                      <div key={team.id} className="flex justify-between items-center text-xs p-2 bg-black/20 rounded-xl border border-white/5">
                        <div>
                          <p className="font-medium text-white">{team.name}</p>
                          <p className="text-[10px] text-gray-500">Leader: {team.leaderName}</p>
                        </div>
                        <div>
                          {team.isFree ? (
                            <span className="text-[8px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                              Free
                            </span>
                          ) : (
                            <span className="text-[8px] uppercase tracking-wider font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-mono">
                              Booked
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {assignModalOpen && bookingForAssign && (
        <AssignTeamModal 
          booking={bookingForAssign}
          onClose={() => {
            setAssignModalOpen(false);
            setBookingForAssign(null);
          }}
          onAssign={handleAssignSuccess}
        />
      )}
    </div>
  );
};

export default Calendar;
