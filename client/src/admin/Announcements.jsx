import React, { useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';

export const Announcements = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, text: "🌟 Website crafted by WayzenTech — Contact 9398724704" },
    { id: 2, text: "🏆 2× Times Business Award Winner — Vijayawada's #1 Studio" },
    { id: 3, text: "🎬 Book your dream wedding shoot — Call 9494387387 today!" }
  ]);
  const [newText, setNewText] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setAlerts(prev => [...prev, { id: Date.now(), text: newText }]);
    setNewText("");
  };

  const handleDelete = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-8 font-sans max-w-3xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Top Alert Announcements</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">Add or remove alerts shown in the top header scrolling ticker.</p>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-3xl p-6 space-y-6">
        <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3 flex items-center gap-2">
          <Bell className="w-5 h-5 text-brand-gold" /> Alert Notices Ticker List
        </h3>

        <form onSubmit={handleAdd} className="flex gap-3 text-xs">
          <input 
            required
            type="text" 
            placeholder="e.g. 📸 Now booking pre-wedding shoots for July 2026!"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold"
          />
          <button 
            type="submit"
            className="px-5 py-3 bg-brand-gold hover:bg-amber-500 text-black font-bold uppercase tracking-wider rounded-xl transition-all"
          >
            Add Alert
          </button>
        </form>

        <div className="space-y-3">
          {alerts.map((al) => (
            <div key={al.id} className="p-4 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center text-xs">
              <span className="text-gray-300 font-sans">{al.text}</span>
              <button 
                onClick={() => handleDelete(al.id)}
                className="p-1.5 hover:bg-white/5 rounded text-gray-500 hover:text-red-400 transition-colors"
                title="Remove Notice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
