import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen({ onComplete }) {
  const [phase, setPhase] = useState(0);
  // phase 0: black screen
  // phase 1: camera lens iris opens (SVG)
  // phase 2: SNAPLICA text draws in
  // phase 3: tagline appears
  // phase 4: golden line sweeps under text
  // phase 5: everything zooms toward viewer + fades, site revealed

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),   // iris starts opening
      setTimeout(() => setPhase(2), 900),   // text starts
      setTimeout(() => setPhase(3), 1600),  // tagline
      setTimeout(() => setPhase(4), 2000),  // gold line
      setTimeout(() => setPhase(5), 2500),  // exit
      setTimeout(() => onComplete(), 3100), // unmount
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase < 5 && (
        <motion.div
          className="fixed inset-0 z-[99999] bg-[#060608] flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Ambient radial glow behind logo */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 70%)" }}
            animate={{ scale: phase >= 1 ? [0.8, 1.1, 1] : 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Snaplica logo */}
          <motion.div
            className="relative mb-6"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: phase >= 1 ? 1 : 0, rotate: phase >= 1 ? 0 : -30 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <img
              src="/logo.webp"
              alt="Snaplica Photography"
              className="h-[90px] w-[90px] rounded-3xl object-contain ring-1 ring-[#c9a227]/30 shadow-2xl shadow-[#c9a227]/20"
            />
          </motion.div>

          {/* SNAPLICA text — each letter animates in */}
          <div className="flex items-center gap-[2px] mb-2 font-serif">
            {"SNAPLICA".split("").map((letter, i) => (
              <motion.span
                key={i}
                className="text-[2.8rem] font-bold text-white tracking-[0.15em] leading-none"
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{
                  opacity: phase >= 2 ? 1 : 0,
                  y: phase >= 2 ? 0 : 20,
                  filter: phase >= 2 ? "blur(0px)" : "blur(8px)"
                }}
                transition={{ duration: 0.5, delay: phase >= 2 ? i * 0.05 : 0, ease: "easeOut" }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* Gold sweep line */}
          <motion.div
            className="h-[1.5px] bg-gradient-to-r from-transparent via-[#c9a227] to-transparent mb-3"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: phase >= 4 ? "240px" : 0, opacity: phase >= 4 ? 1 : 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {/* Tagline */}
          <motion.p
            className="text-[#c9a227]/70 text-sm tracking-[0.3em] uppercase font-light font-sans"
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: phase >= 3 ? 1 : 0, letterSpacing: phase >= 3 ? "0.3em" : "0.5em" }}
            transition={{ duration: 0.7 }}
          >
            Photography · Vijayawada
          </motion.p>

          {/* Loading dots */}
          <div className="flex gap-1.5 mt-8">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#c9a227]/50"
                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
