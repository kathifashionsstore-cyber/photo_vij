import React, { useState } from 'react';
import { Bot, Save, CheckCircle } from 'lucide-react';
import { SERVICES } from '../../data/services';

const serviceListText = SERVICES.map((service) => service.label).join(", ");

export const ChatbotKnowledge = () => {
  const [kb, setKb] = useState({
    location: "Snaplica Photography studio is located at Ibrahimpatnam, Vijayawada, Andhra Pradesh, India. You can view our coordinates on the Contact page.",
    services: `We cover exactly these services: ${serviceListText}. Ask clients for date, venue, and coverage needs before suggesting a crew setup.`,
    delivery: "We deliver RAW selection galleries to your Customer Portal within 4 days. Edited cinematic clips and printed albums are fully delivered within 3 to 4 weeks."
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 font-sans max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">Chatbot Knowledge Base</h1>
        <p className="text-xs text-gray-500 mt-1 font-light">Customize automated answers for client questions.</p>
      </div>

      <div className="bg-brand-card border border-white/5 rounded-3xl p-8 space-y-6">
        <h3 className="text-white font-serif font-bold text-lg border-b border-white/5 pb-3 flex items-center gap-2">
          <Bot className="w-5 h-5 text-brand-gold" /> Knowledge Overrides
        </h3>

        {success && (
          <div className="p-3 bg-emerald-950/20 border border-emerald-950/50 text-emerald-400 text-xs rounded-xl flex items-center gap-1.5 leading-relaxed font-light">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Chatbot KB definitions updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider">Studio Location Info</label>
            <textarea 
              required
              value={kb.location}
              onChange={(e) => setKb(prev => ({ ...prev, location: e.target.value }))}
              rows="3"
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider">Services description</label>
            <textarea 
              required
              value={kb.services}
              onChange={(e) => setKb(prev => ({ ...prev, services: e.target.value }))}
              rows="3"
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-gray-500 uppercase tracking-wider">Deliverable Timelines</label>
            <textarea 
              required
              value={kb.delivery}
              onChange={(e) => setKb(prev => ({ ...prev, delivery: e.target.value }))}
              rows="3"
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none text-white focus:border-brand-gold resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-brand-gold text-black hover:bg-amber-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            Update KB <Save className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotKnowledge;
