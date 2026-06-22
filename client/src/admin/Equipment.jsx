import React, { useState } from 'react';
import { Camera, Plus, Check, Trash } from 'lucide-react';

export const Equipment = () => {
  const [items, setItems] = useState([
    { id: "e1", name: "Sony A7SIII", model: "Body-001", type: "camera", status: "assigned", team: "Team Alfa" },
    { id: "e2", name: "Sony FE 24-70mm GM", model: "Lens-002", type: "lens", status: "available", team: "" },
    { id: "e3", name: "DJI Mavic 3 Pro", model: "Drone-001", type: "drone", status: "assigned", team: "Team Beta" }
  ]);

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Studio Equipment</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">Trace camera body allocations, lenses, and drone arrays.</p>
      </div>

      <div className="bg-brand-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-black/20 text-gray-500 uppercase tracking-wider font-semibold border-b border-white/5">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Model/No</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4">Assigned Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-serif font-bold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-brand-gold" /> {item.name}
                  </td>
                  <td className="px-6 py-4 font-mono">{item.model}</td>
                  <td className="px-6 py-4 uppercase text-[10px] tracking-wider text-gray-500 font-bold">{item.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-bold
                      ${item.status === 'available' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-brand-gold border border-brand-gold/20'}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-400">{item.team || "None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Equipment;
