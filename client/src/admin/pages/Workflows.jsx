import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Mail, Send, AlertTriangle, Play, Settings2 } from 'lucide-react';

export const WorkflowEngine = () => {
  const [workflows, setWorkflows] = useState([
    { id: "wf1", name: "Grand Wedding Automation", trigger: "Booking Created", action: "Send WhatsApp Greeting", active: true },
    { id: "wf2", name: "Shoot Date Escalation", trigger: "24h Before Event", action: "Check Crew Assignment Status", active: true },
    { id: "wf3", name: "Post-Event Delivery Alert", trigger: "Photos Selection Ready", action: "Send Portal Link Email", active: false }
  ]);

  const toggleActive = (id) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w));
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Visual Workflow Engine</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">Build operations nodes linking triggers to WhatsApp & email stubs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Workflow List */}
        <div className="lg:col-span-2 space-y-4">
          {workflows.map((wf) => (
            <div 
              key={wf.id}
              className="bg-brand-card border border-white/5 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="text-brand-gold w-5 h-5" />
                  <h3 className="text-white font-serif font-bold text-base">{wf.name}</h3>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Trigger: <strong className="text-gray-300 font-medium">{wf.trigger}</strong></span>
                  <span>Action: <strong className="text-gray-300 font-medium">{wf.action}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Active Toggle Switch */}
                <button 
                  onClick={() => toggleActive(wf.id)}
                  className={`w-12 h-6 rounded-full relative flex items-center p-1 transition-colors
                    ${wf.active ? 'bg-brand-gold' : 'bg-white/10'}`}
                >
                  <motion.div 
                    layout
                    className="w-4 h-4 bg-black rounded-full" 
                    animate={{ x: wf.active ? 24 : 0 }}
                  />
                </button>

                <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
                  <Play className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Node Builder panel */}
        <div className="lg:col-span-1 bg-brand-card border border-white/5 rounded-3xl p-6 space-y-6">
          <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-brand-gold" /> Node Details
          </h3>

          <div className="space-y-4 text-xs font-light text-gray-400 leading-relaxed">
            <div className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-3">
              <span className="text-[10px] text-brand-gold uppercase font-bold tracking-wider">Trigger Event</span>
              <p className="text-white font-medium">When a booking request status moves to "Approved"</p>
            </div>
            
            <div className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-3">
              <span className="text-[10px] text-brand-gold uppercase font-bold tracking-wider">Condition Guard</span>
              <p className="text-white font-medium">If event type equals "Wedding" and a full team package is selected</p>
            </div>

            <div className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-3">
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Outbound Action</span>
              <div className="flex items-center gap-2 text-white font-medium mt-1">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Shoot WhatsApp Template Alert to assigned team lead</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkflowEngine;
