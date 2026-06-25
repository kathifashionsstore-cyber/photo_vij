import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SERVICES } from '../data/services';

const serviceKeywords = SERVICES.flatMap((service) => [service.id, service.label, ...(service.keywords || [])]).map((item) => item.toLowerCase());
const serviceListText = SERVICES.map((service) => service.label).join(", ");

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm SnapBot, Sonu's assistant. How can I help you capture your special moments today?", isBot: true }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "Where is the studio?",
    "What services do you offer?",
    "How do I book Sonu & crew?",
    "What is photo delivery time?"
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const knowledgeBase = {
    location: "Snaplica Photography studio is located at Ibrahimpatnam, Vijayawada, Andhra Pradesh, India. You can view our coordinates on the Contact page.",
    services: `We cover exactly these services: ${serviceListText}. Share your event date and venue so Sonu can suggest the right crew setup.`,
    book: "You can book our dates online. Go to the Book tab, share your event details, and Sonu will contact you to confirm availability and next steps.",
    delivery: "We deliver RAW selection galleries to your Customer Portal within 4 days. Edited cinematic clips and printed albums are fully delivered within 3 to 4 weeks.",
    default: "I'm not sure about that detail. You can call or WhatsApp Sonu directly at 9494387387 or email snaplicaphotography@gmail.com for custom queries."
  };

  const handleSend = (text) => {
    if (!text.trim()) return;

    const newMsgs = [...messages, { id: Date.now(), text, isBot: false }];
    setMessages(newMsgs);
    setInputValue("");

    // Generate response
    setTimeout(() => {
      const cleanText = text.toLowerCase();
      let reply = knowledgeBase.default;

      if (cleanText.includes("location") || cleanText.includes("where") || cleanText.includes("address") || cleanText.includes("place")) {
        reply = knowledgeBase.location;
      } else if (cleanText.includes("service") || cleanText.includes("shoot") || cleanText.includes("coverage") || cleanText.includes("crew") || serviceKeywords.some((keyword) => cleanText.includes(keyword))) {
        reply = knowledgeBase.services;
      } else if (cleanText.includes("book") || cleanText.includes("schedule") || cleanText.includes("hire") || cleanText.includes("reserve")) {
        reply = knowledgeBase.book;
      } else if (cleanText.includes("delivery") || cleanText.includes("time") || cleanText.includes("when") || cleanText.includes("photo")) {
        reply = knowledgeBase.delivery;
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, text: reply, isBot: true }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-[calc(7.75rem+env(safe-area-inset-bottom,0px))] right-4 z-[9010] pointer-events-auto md:bottom-6 md:right-6">
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-brand-gold hover:bg-amber-500 rounded-full flex items-center justify-center text-black shadow-2xl pulse-ring relative"
        title="Chat with SnapBot"
      >
        {isOpen ? <X className="w-6 h-6" /> : <img src="/logo.webp" alt="Snaplica AI" className="h-9 w-9 rounded-full object-contain" />}
      </motion.button>

      {/* Conversation Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-20 right-0 h-[min(450px,calc(100vh-11rem))] w-[min(20rem,calc(100vw-2rem))] bg-[#0F1117] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden md:w-96"
          >
            {/* Chat header */}
            <div className="bg-black/40 border-b border-white/5 px-4 py-4 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                <img src="/logo.webp" alt="Snaplica AI" className="h-7 w-7 rounded-full object-contain" />
              </div>
              <div>
                <h4 className="text-white font-serif font-bold text-sm">Snaplica AI</h4>
                <span className="text-[9px] text-emerald-400 font-sans flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                </span>
              </div>
            </div>

            {/* Chat history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex items-start gap-2 max-w-[85%]
                    ${m.isBot ? "mr-auto text-left" : "ml-auto flex-row-reverse text-right"}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0
                    ${m.isBot ? "bg-brand-gold/10 text-brand-gold" : "bg-white/10 text-white"}`}
                  >
                    {m.isBot ? <img src="/logo.webp" alt="Snaplica AI" className="h-5 w-5 rounded-full object-contain" /> : <User className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs font-sans font-light leading-relaxed
                    ${m.isBot 
                      ? "bg-brand-card text-gray-300 rounded-tl-none border border-white/5" 
                      : "bg-brand-gold text-black rounded-tr-none font-medium"}`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick replies pills */}
            <div className="px-4 py-2 border-t border-white/5 flex gap-1.5 overflow-x-auto whitespace-nowrap bg-black/10 select-none">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-400 hover:text-brand-gold hover:border-brand-gold/20 transition-all font-sans"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Text entry field */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="p-3 border-t border-white/5 bg-black/40 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about location, services, booking..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder:text-gray-600 outline-none focus:border-brand-gold transition-colors font-sans"
              />
              <button 
                type="submit"
                className="p-2.5 bg-brand-gold hover:bg-amber-500 rounded-xl text-black transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotWidget;
