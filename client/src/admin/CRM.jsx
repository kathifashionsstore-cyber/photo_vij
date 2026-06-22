import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash, Edit, Mail, Phone, ChevronRight, ChevronLeft } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export const CRM = () => {
  const [leads, setLeads] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    phone: "",
    email: "",
    eventType: "wedding",
    budget: "",
    stage: "new" // new -> contacted -> proposal -> booked -> lost
  });
  const [loading, setLoading] = useState(false);

  const columns = [
    { id: "new", title: "New Leads", color: "#F59E0B" },
    { id: "contacted", title: "Contacted", color: "#6366F1" },
    { id: "proposal", title: "Proposal Sent", color: "#EC4899" },
    { id: "booked", title: "Booked", color: "#10B981" },
    { id: "lost", title: "Lost", color: "#EF4444" }
  ];

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'contacts'));
        const items = [];
        querySnapshot.forEach(doc => {
          items.push({ id: doc.id, ...doc.data() });
        });

        if (items.length === 0) {
          // Mock data fallback for immediate testing
          setLeads([
            { id: "1", name: "Anil Kumar", phone: "9494387387", email: "anil@gmail.com", eventType: "wedding", budget: "120000", stage: "new" },
            { id: "2", name: "Divya Reddy", phone: "9988776655", email: "divya@gmail.com", eventType: "pre-wedding", budget: "35000", stage: "contacted" },
            { id: "3", name: "Srinivas Rao", phone: "9876543210", email: "sri@gmail.com", eventType: "corporate", budget: "150000", stage: "proposal" },
            { id: "4", name: "Pooja Hegde", phone: "9900112233", email: "pooja@gmail.com", eventType: "wedding", budget: "180000", stage: "booked" }
          ]);
        } else {
          // Normalize stage mapping
          const mapped = items.map(it => ({
            ...it,
            stage: it.status === 'new' ? 'new' : (it.stage || 'new'),
            budget: it.budget || "50000"
          }));
          setLeads(mapped);
        }
      } catch (err) {
        console.error("Error fetching leads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'contacts'), {
        ...newLead,
        createdAt: new Date().toISOString()
      });
      setLeads(prev => [...prev, { id: docRef.id, ...newLead }]);
      setShowAddModal(false);
      setNewLead({
        name: "",
        phone: "",
        email: "",
        eventType: "wedding",
        budget: "",
        stage: "new"
      });
    } catch (err) {
      console.error("Add lead error:", err);
    }
  };

  const moveStage = async (id, direction) => {
    const lead = leads.find(l => l.id === id);
    const stages = columns.map(c => c.id);
    const currIdx = stages.indexOf(lead.stage);
    let nextIdx = currIdx + direction;
    if (nextIdx >= 0 && nextIdx < stages.length) {
      const nextStage = stages[nextIdx];
      // Update local state
      setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: nextStage } : l));
      
      // Update db
      try {
        await updateDoc(doc(db, 'contacts', id), { stage: nextStage });
      } catch (err) {
        console.error("Firestore stage update failed:", err);
      }
    }
  };

  const handleDelete = async (id) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    try {
      await deleteDoc(doc(db, 'contacts', id));
    } catch (err) {
      console.error("Firestore delete lead error:", err);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Lead Management</h1>
          <p className="text-xs text-gray-500 mt-1 font-light">Trace conversions and pipeline progress.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-brand-gold hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Lead
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        {columns.map((col) => {
          const colLeads = leads.filter(l => l.stage === col.id);
          return (
            <div key={col.id} className="bg-brand-card/40 border border-white/5 rounded-2xl p-4 flex flex-col min-h-[500px]">
              {/* Header column */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <h3 className="text-white font-serif font-bold text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  {col.title}
                </h3>
                <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400 font-bold">
                  {colLeads.length}
                </span>
              </div>

              {/* Lead Cards List */}
              <div className="space-y-4 flex-1 overflow-y-auto">
                {colLeads.map((lead) => (
                  <motion.div
                    key={lead.id}
                    layoutId={`lead-${lead.id}`}
                    className="p-4 bg-brand-card border border-white/5 hover:border-white/10 rounded-xl space-y-3 relative group"
                  >
                    <div>
                      <h4 className="text-white font-serif font-bold text-sm">{lead.name}</h4>
                      <span className="text-[10px] text-brand-gold font-mono uppercase tracking-wider block mt-0.5">
                        {lead.eventType}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-600" />
                        <span>{lead.phone}</span>
                      </div>
                      {lead.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-600" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-[10px] text-gray-400 font-medium">
                        Budget: ₹{Number(lead.budget || 0).toLocaleString('en-IN')}
                      </span>
                      
                      <button 
                        onClick={() => handleDelete(lead.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded text-gray-500 hover:text-red-400 transition-all"
                        title="Delete Lead"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Left/Right movement hooks */}
                    <div className="flex justify-between items-center gap-2 pt-1">
                      <button 
                        onClick={() => moveStage(lead.id, -1)}
                        disabled={lead.stage === 'new'}
                        className="p-1 bg-white/5 hover:bg-white/10 rounded disabled:opacity-25"
                      >
                        <ChevronLeft className="w-3 h-3 text-white" />
                      </button>
                      <button 
                        onClick={() => moveStage(lead.id, 1)}
                        disabled={lead.stage === 'booked' || lead.stage === 'lost'}
                        className="p-1 bg-white/5 hover:bg-white/10 rounded disabled:opacity-25"
                      >
                        <ChevronRight className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Overlay Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99000] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0F1117] border border-white/10 rounded-2xl p-6 max-w-md w-full space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h3 className="text-white font-serif font-bold text-lg">Create New Pipeline Lead</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAddLead} className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider">Client Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Adithya"
                    value={newLead.name}
                    onChange={(e) => setNewLead(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase tracking-wider">Phone</label>
                    <input 
                      required
                      type="tel" 
                      placeholder="e.g. 9876543210"
                      value={newLead.phone}
                      onChange={(e) => setNewLead(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-gray-500 uppercase tracking-wider">Budget (INR)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="e.g. 100000"
                      value={newLead.budget}
                      onChange={(e) => setNewLead(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. client@gmail.com"
                    value={newLead.email}
                    onChange={(e) => setNewLead(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-500 uppercase tracking-wider">Photography Category</label>
                  <select 
                    value={newLead.eventType}
                    onChange={(e) => setNewLead(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-full bg-black/90 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
                  >
                    <option value="wedding">Wedding Ceremony</option>
                    <option value="pre-wedding">Pre-Wedding Shoot</option>
                    <option value="birthday">Birthday Celebration</option>
                    <option value="corporate">Corporate Portrait</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-brand-gold text-black hover:bg-amber-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Insert Lead
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CRM;
