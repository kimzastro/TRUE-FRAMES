import React, { useState } from "react";
import { FolderGit2, ShieldAlert, Sun, Moon, Monitor, Star } from "lucide-react";
import { motion } from "motion/react";
import { ThemeMode } from "../types";

interface HeaderProps {
  onAdminTrigger: () => void;
  isAdmin: boolean;
  onLogout: () => void;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  starredCount?: number;
  isStarredView?: boolean;
  onToggleStarredView?: () => void;
}

export default function Header({
  onAdminTrigger,
  isAdmin,
  onLogout,
  themeMode,
  onThemeChange,
  starredCount = 0,
  isStarredView = false,
  onToggleStarredView,
}: HeaderProps) {
  const [clickCount, setClickCount] = useState(0);

  const handleTitleClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        onAdminTrigger();
        return 0;
      }
      setTimeout(() => setClickCount(0), 2000);
      return newCount;
    });
  };

  return (
    <header id="app-header" className="sticky top-2 sm:top-4 z-40 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 mb-4 sm:mb-6">
      {/* Outer container with rounded-full ends and animated corner gradient border */}
      <div className="relative rounded-full p-[2px] overflow-hidden shadow-lg shadow-indigo-500/10 dark:shadow-indigo-950/40">
        {/* Animated rotating corner gradient glow */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,#6366f1,#8b5cf6,#ec4899,#10b981,#6366f1)] opacity-75 blur-[1px]"
        />

        {/* Main Rounded-Ended Inner Header Bar */}
        <div className="relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-full px-2.5 sm:px-6 py-1.5 sm:py-2.5 flex items-center justify-between border border-white/80 dark:border-zinc-800/80 shadow-xs transition-colors gap-1.5 sm:gap-3">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {/* App logo badge */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-indigo-200/80 dark:border-indigo-800/80 overflow-hidden shrink-0 shadow-2xs bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
              <img
                src="/logo.jpg"
                alt="ENGINOTES Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <FolderGit2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400 hidden" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1
                  id="app-title-name"
                  onClick={handleTitleClick}
                  onDoubleClick={onAdminTrigger}
                  title="Double-click to manage"
                  className="text-base sm:text-2xl font-black font-display tracking-tight text-zinc-900 dark:text-zinc-50 cursor-pointer select-none active:scale-98 transition-transform truncate"
                >
                  ENGINOTES
                </h1>
                <button
                  id="secret-admin-trigger"
                  onClick={onAdminTrigger}
                  className="w-1.5 h-1.5 rounded-full bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-default focus:outline-none shrink-0"
                  aria-label="Admin Access Portal"
                />
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-mono hidden xs:block truncate">Academic Resource Vault</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            {/* Starred / Bookmarks Quick Access Button */}
            {onToggleStarredView && (
              <button
                id="btn-header-starred"
                type="button"
                onClick={onToggleStarredView}
                title="View Starred Notes"
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none border shadow-2xs ${
                  isStarredView
                    ? "bg-amber-500 text-white border-amber-600 font-bold"
                    : "bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 border-zinc-200/80 dark:border-zinc-700/80"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${isStarredView ? "fill-white" : "fill-amber-400 text-amber-500"}`} />
                <span className="hidden sm:inline">Starred</span>
                {starredCount > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold leading-none ${
                      isStarredView ? "bg-white text-amber-600" : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {starredCount}
                  </span>
                )}
              </button>
            )}

            {/* Theme Mode Segmented Controller */}
            <div
              id="theme-switcher-group"
              className="flex items-center bg-zinc-100/90 dark:bg-zinc-800/90 p-0.5 sm:p-1 rounded-full border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs"
            >
              <button
                id="theme-btn-light"
                type="button"
                onClick={() => onThemeChange("light")}
                className={`p-1 sm:px-2 sm:py-1 rounded-full text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer select-none ${
                  themeMode === "light"
                    ? "bg-white text-amber-600 shadow-2xs font-bold ring-1 ring-zinc-200"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
                title="Switch to Light Theme"
                aria-label="Light Theme"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden md:inline">Light</span>
              </button>

              <button
                id="theme-btn-dark"
                type="button"
                onClick={() => onThemeChange("dark")}
                className={`p-1 sm:px-2 sm:py-1 rounded-full text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer select-none ${
                  themeMode === "dark"
                    ? "bg-indigo-600 text-white shadow-2xs font-bold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
                title="Switch to Dark Theme"
                aria-label="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
                <span className="hidden md:inline">Dark</span>
              </button>

              <button
                id="theme-btn-system"
                type="button"
                onClick={() => onThemeChange("system")}
                className={`p-1 sm:px-2 sm:py-1 rounded-full text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer select-none ${
                  themeMode === "system"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-bold ring-1 ring-zinc-200 dark:ring-zinc-600"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
                title="Follow System Theme"
                aria-label="System Theme"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">System</span>
              </button>
            </div>

            {isAdmin ? (
              <div className="flex items-center space-x-1.5">
                <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold font-mono bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-2xs">
                  <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5 sm:mr-1" />
                  <span className="hidden xs:inline">ADMIN</span>
                </span>
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-white border border-red-200 dark:border-red-800 hover:bg-red-600 rounded-full transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs"
                >
                  Exit
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}



