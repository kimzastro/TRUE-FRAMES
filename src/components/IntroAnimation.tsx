import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FolderGit2, Sparkles, GraduationCap } from "lucide-react";

interface IntroAnimationProps {
  onComplete?: () => void;
  autoPlay?: boolean;
}

export default function IntroAnimation({ onComplete, autoPlay = true }: IntroAnimationProps) {
  const [phase, setPhase] = useState<"logoIn" | "expanding" | "done">("logoIn");

  useEffect(() => {
    if (!autoPlay) return;

    // Phase 1: Logo enters and pauses briefly in center (0ms - 900ms)
    const logoTimer = setTimeout(() => {
      setPhase("expanding");
    }, 1100);

    // Phase 2: Circle expands outwards to reveal site (1100ms - 2200ms)
    const doneTimer = setTimeout(() => {
      setPhase("done");
      if (onComplete) onComplete();
    }, 2200);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(doneTimer);
    };
  }, [autoPlay, onComplete]);

  if (phase === "done") return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] overflow-hidden pointer-events-none select-none">
        {/* Background Overlay with Circle Expansion Mask */}
        <motion.div
          initial={{ clipPath: "circle(100% at 50% 50%)" }}
          animate={
            phase === "expanding"
              ? { clipPath: "circle(0% at 50% 50%)" }
              : { clipPath: "circle(100% at 50% 50%)" }
          }
          transition={{
            duration: 1.1,
            ease: [0.76, 0, 0.24, 1], // Smooth exponential ease Out/In
          }}
          className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-indigo-950 to-zinc-900 flex items-center justify-center pointer-events-auto"
        >
          {/* Subtle Ambient Radial Glows in Center */}
          <div className="absolute w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute w-[300px] h-[300px] bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Centered Logo & Title Content */}
          <div className="relative z-10 flex flex-col items-center text-center p-6 max-w-sm">
            {/* Pulsing Outer Circle Rings */}
            <div className="relative mb-6">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0.8, 1.3, 1], opacity: [0, 0.8, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute -inset-4 rounded-full border-2 border-indigo-400/50 blur-[2px]"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1.2], opacity: [0, 0.5, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                className="absolute -inset-8 rounded-full border border-violet-400/30"
              />

              {/* Logo Icon Badge */}
              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  delay: 0.1,
                }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-1 shadow-2xl shadow-indigo-500/50 flex items-center justify-center relative overflow-hidden"
              >
                {/* Fallback image or custom vector icon */}
                <img
                  src="/logo.jpg"
                  alt="ENGINOTES Logo"
                  className="w-full h-full object-cover rounded-[20px] shadow-inner"
                  onError={(e) => {
                    // Fallback to vector icon if image fails
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-indigo-600/20 backdrop-blur-[1px] hidden border-2 border-white/20 rounded-[20px] flex items-center justify-center">
                  <FolderGit2 className="w-12 h-12 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Brand Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-display drop-shadow-md flex items-center justify-center space-x-2">
                <span>ENGINOTES</span>
                <Sparkles className="w-6 h-6 text-indigo-400 animate-bounce" />
              </h1>
              
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-mono text-indigo-200 border border-white/15">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-300" />
                <span>Academic Resource Portal</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
