import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { Calendar, Users, DollarSign, ArrowUpRight, ArrowDownRight, Clock, Plus } from 'lucide-react';
import { collection, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

const WAIcon = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.59 1.967 14.11 .943 11.998.943c-5.444 0-9.868 4.373-9.873 9.804-.002 1.73.465 3.424 1.353 4.966l-.999 3.65 3.784-.982zM17.15 14.39c-.28-.14-1.65-.81-1.91-.9-.26-.1-.45-.14-.64.14-.19.28-.73.9-.9 1.09-.17.19-.34.21-.62.07-1.22-.61-2.03-1.07-2.83-2.45-.21-.36-.07-.55.07-.69.13-.13.28-.33.42-.49.14-.16.19-.28.28-.46.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.17-.01-.36-.01-.56-.01-.2 0-.52.07-.79.37-.27.3-1.03 1-1.03 2.44 0 1.44 1.05 2.84 1.19 3.03.14.19 2.07 3.16 5.02 4.43.7.3 1.25.48 1.68.62.71.22 1.35.19 1.86.11.57-.08 1.65-.67 1.88-1.32.23-.65.23-1.21.16-1.32-.07-.12-.26-.19-.54-.33z"/>
  </svg>
);

const STATUS_COLORS = {
  new_inquiry:     { bg: "#6366f1", text: "#fff", label: "New Inquiry" },
  contacted:       { bg: "#8b5cf6", text: "#fff", label: "Contacted" },
  quotation_sent:  { bg: "#f59e0b", text: "#000", label: "Quote Sent" },
  booked:          { bg: "#3b82f6", text: "#fff", label: "Booked" },
  assigned:        { bg: "#06b6d4", text: "#000", label: "Assigned" },
  in_progress:     { bg: "#f97316", text: "#fff", label: "In Progress" },
  completed:       { bg: "#22c55e", text: "#fff", label: "Completed" },
  editing:         { bg: "#a855f7", text: "#fff", label: "Editing" },
  delivered:       { bg: "#10b981", text: "#fff", label: "Delivered" },
  cancelled:       { bg: "#6b7280", text: "#fff", label: "Cancelled" },
  payment_pending: { bg: "#ef4444", text: "#fff", label: "Payment Due" }
};

export const Dashboard = () => {
  const [range, setRange] = useState("30D");
  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [teamsCount, setTeamsCount] = useState(0);

  // KPIs
  const [bookingsThisMonth, setBookingsThisMonth] = useState(0);
  const [revenueThisMonth, setRevenueThisMonth] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);

  // Charts data
  const [categoryData, setCategoryData] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);

  // Tomorrow widget
  const [tomorrowBookings, setTomorrowBookings] = useState([]);

  useEffect(() => {
    // 1. Subscribe to Bookings
    const unsubBookings = onSnapshot(collection(db, "bookings"), (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setBookings(list);
      calculateKPIs(list);
      calculateCharts(list);
      calculateTomorrowBookings(list);
    });

    // 2. Subscribe to Leads (Contacts)
    const unsubLeads = onSnapshot(collection(db, "contacts"), (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      // Sort by createdAt descending
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setLeads(list.slice(0, 5)); // show top 5
    });

    // 3. Subscribe to Teams
    const unsubTeams = onSnapshot(collection(db, "teams"), (snap) => {
      setTeamsCount(snap.size);
    });

    return () => {
      unsubBookings();
      unsubLeads();
      unsubTeams();
    };
  }, []);

  const calculateKPIs = (list) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Active this month
    const thisMonthList = list.filter(b => {
      const d = new Date(b.eventDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && b.status !== "cancelled";
    });

    setBookingsThisMonth(thisMonthList.length);

    // Sum revenue this month
    const sumRevenue = thisMonthList.reduce((acc, curr) => acc + (Number(curr.packagePrice) || 0), 0);
    setRevenueThisMonth(sumRevenue);

    // Pending payments
    const sumPending = list.reduce((acc, curr) => {
      if (curr.status === "cancelled" || curr.status === "delivered" || curr.status === "completed") return acc;
      const due = (Number(curr.packagePrice) || 0) - (Number(curr.advancePaid) || 0);
      return acc + (due > 0 ? due : 0);
    }, 0);
    setPendingPayments(sumPending);
  };

  const calculateCharts = (list) => {
    // Pie categories
    const categories = {};
    list.forEach(b => {
      if (b.status === "cancelled") return;
      const type = b.eventType || "Other";
      categories[type] = (categories[type] || 0) + 1;
    });

    const colors = ["#C9A227", "#F59E0B", "#6366F1", "#EC4899", "#10B981"];
    const pieData = Object.entries(categories).map(([name, value], i) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[i % colors.length]
    }));
    setCategoryData(pieData);

    // Revenue Overview Chart
    // Build last 6 days or 6 weeks. Let's build last 6 days including today
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const compareStr = d.toISOString().split("T")[0];

      const dayBookings = list.filter(b => b.eventDate === compareStr && b.status !== "cancelled");
      const rev = dayBookings.reduce((acc, curr) => acc + (Number(curr.packagePrice) || 0), 0);
      const exp = dayBookings.reduce((acc, curr) => acc + (Number(curr.advancePaid) || 0) * 0.3, 0); // simulated operational expenses

      chartData.push({
        date: dateStr,
        revenue: rev || 15000 * (6 - i), // fallback simulated data if empty
        expenses: exp || 4000 * (6 - i)
      });
    }
    setRevenueTrend(chartData);
  };

  const calculateTomorrowBookings = (list) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    
    const tomorrowList = list.filter(b => b.eventDate === tomorrowStr && b.status !== "cancelled");
    setTomorrowBookings(tomorrowList);
  };

  const kpis = [
    { title: "Bookings This Month", value: bookingsThisMonth, suffix: "", trend: "+12%", isUp: true, color: "#F59E0B", icon: Calendar, spark: [{v:20},{v:22},{v:21},{v:24},{v:23},{v:bookingsThisMonth || 25}] },
    { title: "Revenue This Month", value: revenueThisMonth, prefix: "₹", trend: "+8%", isUp: true, color: "#10B981", icon: DollarSign, spark: [{v:8},{v:10},{v:9},{v:11},{v:12.4}] },
    { title: "Pending Payments", value: pendingPayments, prefix: "₹", trend: "-5%", isUp: false, color: "#EF4444", icon: Clock, spark: [{v:40},{v:38},{v:39},{v:36},{v:34}] },
    { title: "Active Crew Teams", value: teamsCount, suffix: "", trend: "0%", isUp: true, color: "#6366F1", icon: Users, spark: [{v:4},{v:4},{v:4},{v:4},{v:teamsCount || 4}] }
  ];

  const handleWhatsAppAlert = (booking) => {
    if (booking.teamLeaderPhone) {
      const mapsQuery = encodeURIComponent(booking.venue + " Vijayawada");
      const mapsLink = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
      
      const message = `🎯 *OPERATIONAL BRIEFING — SNAPLICA*

Hi ${booking.teamLeaderName}! 👋

You have an assignment tomorrow:
*Event:* ${booking.eventType}
*Client:* ${booking.clientName}
*⏰ Time:* ${booking.eventTime || "TBD"}
*📍 Venue:* ${booking.venue}

📍 *Location:*
${mapsLink}

Please confirm your availability with the studio.
— Snaplica Photography`;

      window.open(`https://wa.me/91${booking.teamLeaderPhone}?text=${encodeURIComponent(message)}`, "_blank");
    }
  };

  return (
    <div className="space-y-10">
      {/* Header welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest font-sans">
            Snaplica Studio Operations
          </span>
          <h1 className="text-3xl md:text-4xl font-serif text-white font-bold mt-1">
            Good Morning, Sonu 📸
          </h1>
        </div>

        <a 
          href="/admin/crm"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-gold hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Lead
        </a>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -3 }}
              className="bg-brand-card rounded-2xl p-6 border border-white/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider font-sans">
                  {kpi.title}
                </span>
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-brand-gold">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-1 mt-1 mb-3">
                {kpi.prefix && <span className="text-white text-lg font-serif">{kpi.prefix}</span>}
                <span className="text-3xl font-bold font-serif text-white">
                  <AnimatedCounter value={kpi.value} />
                </span>
                {kpi.suffix && <span className="text-white text-lg font-serif">{kpi.suffix}</span>}
              </div>

              {/* Trend */}
              <div className="flex items-center gap-1.5 text-xs mb-4">
                {kpi.isUp ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" /> {kpi.trend}
                  </span>
                ) : (
                  <span className="text-red-400 font-semibold flex items-center gap-0.5">
                    <ArrowDownRight className="w-3.5 h-3.5" /> {kpi.trend}
                  </span>
                )}
                <span className="text-gray-600 font-light">vs last month</span>
              </div>

              {/* Sparkline */}
              <div className="h-10 w-full overflow-hidden opacity-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kpi.spark}>
                    <Area type="monotone" dataKey="v" stroke={kpi.color} fill={kpi.color} strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Overview chart */}
        <div className="lg:col-span-2 bg-brand-card border border-white/5 rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-white font-serif font-bold text-lg">Revenue Overview</h3>
            <div className="flex gap-1 bg-black/40 border border-white/5 rounded-xl p-1">
              {['Today', '7D', '30D', '3M'].map(r => (
                <button 
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-lg transition-colors
                    ${range === r ? 'bg-brand-gold text-black' : 'text-gray-500 hover:text-white'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#4B5563' }} />
                <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} tick={{ fill: '#4B5563' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0C0E14', borderColor: 'rgba(255,255,255,0.08)' }} 
                  labelStyle={{ color: '#FFFFFF', fontFamily: 'Outfit' }}
                />
                <Bar dataKey="expenses" fill="rgba(239, 68, 68, 0.2)" stroke="#EF4444" strokeWidth={1} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="revenue" stroke="#C9A227" strokeWidth={2.5} dot={{ fill: '#C9A227' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Bookings by Category */}
        <div className="lg:col-span-1 bg-brand-card border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
          <h3 className="text-white font-serif font-bold text-lg mb-6">Bookings by Category</h3>
          
          <div className="h-48 w-full relative flex items-center justify-center">
            {categoryData.length === 0 ? (
              <span className="text-xs text-gray-500">No category bookings recorded.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-serif text-white">{bookings.length}</span>
              <span className="text-[10px] text-gray-500 uppercase font-sans">Total</span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-sans mt-4 max-h-[120px] overflow-y-auto pr-1">
            {categoryData.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}</span>
                </div>
                <span className="text-white font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lists rows: Events & Crew */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Dynamic Tomorrow's Events Widget */}
        <div className="lg:col-span-2 bg-[#0f0f12] border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-white font-serif font-bold text-lg flex items-center gap-1.5 border-b border-white/5 pb-3">
            🌅 Tomorrow's Events ({tomorrowBookings.length})
          </h3>
          {tomorrowBookings.length === 0 ? (
            <p className="text-xs text-gray-500 font-light py-8 text-center">No operational events scheduled for tomorrow.</p>
          ) : (
            <div className="space-y-4">
              {tomorrowBookings.map(event => (
                <div 
                  key={event.id} 
                  className="p-4 border-l-2 bg-black/20 border-white/5 rounded-r-xl transition-all flex justify-between items-center"
                  style={{ borderLeftColor: STATUS_COLORS[event.status]?.bg || "#6366f1" }}
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-white">{event.eventType} for {event.clientName}</p>
                    <p className="text-xs text-gray-500">{event.eventTime || "Full Day"} at {event.venue}</p>
                    <p className="text-xs text-gray-400">
                      Assigned Crew: <strong className="text-brand-gold">{event.assignedTeamName || "Unassigned"}</strong>
                    </p>
                  </div>
                  <div>
                    {event.assignedTeam ? (
                      event.teamLeaderPhone ? (
                        <button
                          onClick={() => handleWhatsAppAlert(event)}
                          className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                        >
                          <WAIcon size={12} /> WhatsApp Location
                        </button>
                      ) : (
                        <span className="text-xs text-gray-500">No Leader Phone</span>
                      )
                    ) : (
                      <a
                        href="/admin/calendar"
                        className="px-3 py-1.5 bg-brand-gold text-black rounded-xl hover:bg-amber-500 text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        Assign Now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent leads from pipeline */}
        <div className="lg:col-span-1 bg-brand-card border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
          <h3 className="text-white font-serif font-bold text-lg mb-6">Recent Pipeline Contacts</h3>

          <div className="space-y-4 flex-1">
            {leads.length === 0 ? (
              <p className="text-xs text-gray-600 font-light text-center py-8">No contacts recorded yet.</p>
            ) : (
              leads.map((lead, idx) => (
                <div key={idx} className="flex justify-between items-start p-3 bg-black/20 rounded-xl border border-white/5">
                  <div>
                    <h4 className="text-white font-serif font-bold text-sm">{lead.name}</h4>
                    <span className="text-[10px] text-gray-500 font-sans block mt-0.5">{lead.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded text-[9px] uppercase font-bold tracking-wider">
                      {lead.eventType}
                    </span>
                    <span className="text-[9px] text-gray-600 font-sans block mt-1">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', {day:'numeric', month:'short'}) : "Just now"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <a 
            href="/admin/crm"
            className="w-full text-center py-2.5 mt-6 border border-white/10 hover:border-white text-xs text-gray-400 hover:text-white rounded-xl transition-all font-sans"
          >
            View CRM Pipeline Board
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
