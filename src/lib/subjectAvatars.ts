import React from "react";
import {
  Cpu,
  Activity,
  Lightbulb,
  Cog,
  Trees,
  ShieldCheck,
  Atom,
  BookOpen,
  GraduationCap,
  Flame,
  Code,
  Database,
  Globe,
  Terminal,
  Microscope,
  Wrench,
  Folder,
} from "lucide-react";

export interface SubjectAvatarOption {
  id: string;
  label: string;
  Icon: React.ElementType;
  gradient: string;
  bgLight: string;
  textColor: string;
  lightText: string;
  iconBg: string;
  accent: string;
}

export const SUBJECT_AVATAR_PRESETS: SubjectAvatarOption[] = [
  {
    id: "cpu",
    label: "Computer / Hardware",
    Icon: Cpu,
    gradient: "from-indigo-500 to-blue-600",
    bgLight: "bg-indigo-50 border-indigo-150 hover:bg-indigo-100/50",
    textColor: "text-indigo-900",
    lightText: "text-indigo-600",
    iconBg: "bg-indigo-600 text-white",
    accent: "bg-indigo-600",
  },
  {
    id: "activity",
    label: "Electronics & Pulse",
    Icon: Activity,
    gradient: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50 border-emerald-150 hover:bg-emerald-100/50",
    textColor: "text-emerald-900",
    lightText: "text-emerald-600",
    iconBg: "bg-emerald-600 text-white",
    accent: "bg-emerald-600",
  },
  {
    id: "lightbulb",
    label: "Electrical & Power",
    Icon: Lightbulb,
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50 border-amber-150 hover:bg-amber-100/50",
    textColor: "text-amber-900",
    lightText: "text-amber-600",
    iconBg: "bg-amber-500 text-white",
    accent: "bg-amber-500",
  },
  {
    id: "cog",
    label: "Mechanical / Gears",
    Icon: Cog,
    gradient: "from-rose-500 to-red-600",
    bgLight: "bg-rose-50 border-rose-150 hover:bg-rose-100/50",
    textColor: "text-rose-900",
    lightText: "text-rose-600",
    iconBg: "bg-rose-500 text-white",
    accent: "bg-rose-500",
  },
  {
    id: "trees",
    label: "Civil & Infrastructure",
    Icon: Trees,
    gradient: "from-sky-500 to-cyan-600",
    bgLight: "bg-sky-50 border-sky-150 hover:bg-sky-100/50",
    textColor: "text-sky-900",
    lightText: "text-sky-600",
    iconBg: "bg-sky-500 text-white",
    accent: "bg-sky-500",
  },
  {
    id: "shield",
    label: "Cybersecurity & IT",
    Icon: ShieldCheck,
    gradient: "from-violet-500 to-purple-600",
    bgLight: "bg-violet-50 border-violet-150 hover:bg-violet-100/50",
    textColor: "text-violet-900",
    lightText: "text-violet-600",
    iconBg: "bg-violet-600 text-white",
    accent: "bg-violet-600",
  },
  {
    id: "code",
    label: "Software & Coding",
    Icon: Code,
    gradient: "from-cyan-500 to-blue-600",
    bgLight: "bg-cyan-50 border-cyan-150 hover:bg-cyan-100/50",
    textColor: "text-cyan-900",
    lightText: "text-cyan-600",
    iconBg: "bg-cyan-600 text-white",
    accent: "bg-cyan-600",
  },
  {
    id: "database",
    label: "Data & Cloud Systems",
    Icon: Database,
    gradient: "from-teal-500 to-emerald-600",
    bgLight: "bg-teal-50 border-teal-150 hover:bg-teal-100/50",
    textColor: "text-teal-900",
    lightText: "text-teal-600",
    iconBg: "bg-teal-600 text-white",
    accent: "bg-teal-600",
  },
  {
    id: "atom",
    label: "Physics & Science",
    Icon: Atom,
    gradient: "from-fuchsia-500 to-pink-600",
    bgLight: "bg-fuchsia-50 border-fuchsia-150 hover:bg-fuchsia-100/50",
    textColor: "text-fuchsia-900",
    lightText: "text-fuchsia-600",
    iconBg: "bg-fuchsia-600 text-white",
    accent: "bg-fuchsia-600",
  },
  {
    id: "graduation",
    label: "Academic & Core",
    Icon: GraduationCap,
    gradient: "from-blue-600 to-indigo-700",
    bgLight: "bg-blue-50 border-blue-150 hover:bg-blue-100/50",
    textColor: "text-blue-900",
    lightText: "text-blue-600",
    iconBg: "bg-blue-600 text-white",
    accent: "bg-blue-600",
  },
  {
    id: "terminal",
    label: "Terminal & Systems",
    Icon: Terminal,
    gradient: "from-zinc-700 to-slate-900",
    bgLight: "bg-zinc-100 border-zinc-200 hover:bg-zinc-200/60",
    textColor: "text-zinc-900",
    lightText: "text-zinc-700",
    iconBg: "bg-zinc-800 text-white",
    accent: "bg-zinc-800",
  },
  {
    id: "flame",
    label: "Thermal & Energy",
    Icon: Flame,
    gradient: "from-orange-500 to-red-600",
    bgLight: "bg-orange-50 border-orange-150 hover:bg-orange-100/50",
    textColor: "text-orange-900",
    lightText: "text-orange-600",
    iconBg: "bg-orange-500 text-white",
    accent: "bg-orange-500",
  },
  {
    id: "globe",
    label: "Telecom & Networks",
    Icon: Globe,
    gradient: "from-purple-500 to-indigo-600",
    bgLight: "bg-purple-50 border-purple-150 hover:bg-purple-100/50",
    textColor: "text-purple-900",
    lightText: "text-purple-600",
    iconBg: "bg-purple-600 text-white",
    accent: "bg-purple-600",
  },
  {
    id: "microscope",
    label: "Biotech & Research",
    Icon: Microscope,
    gradient: "from-lime-500 to-emerald-600",
    bgLight: "bg-lime-50 border-lime-150 hover:bg-lime-100/50",
    textColor: "text-lime-900",
    lightText: "text-lime-600",
    iconBg: "bg-lime-600 text-white",
    accent: "bg-lime-600",
  },
  {
    id: "wrench",
    label: "Workshop & Tools",
    Icon: Wrench,
    gradient: "from-stone-500 to-zinc-700",
    bgLight: "bg-stone-50 border-stone-200 hover:bg-stone-100/50",
    textColor: "text-stone-900",
    lightText: "text-stone-600",
    iconBg: "bg-stone-600 text-white",
    accent: "bg-stone-600",
  },
];

export function getSubjectAvatar(iconId?: string, fallbackSubId?: string): SubjectAvatarOption {
  if (iconId) {
    const match = SUBJECT_AVATAR_PRESETS.find((item) => item.id === iconId);
    if (match) return match;
  }

  // Fallback check by subject ID string
  if (fallbackSubId) {
    const normalized = fallbackSubId.toLowerCase();
    if (normalized.includes("cse")) return SUBJECT_AVATAR_PRESETS[0]; // cpu
    if (normalized.includes("ece") || normalized.includes("electron")) return SUBJECT_AVATAR_PRESETS[1]; // activity
    if (normalized.includes("eee") || normalized.includes("electric")) return SUBJECT_AVATAR_PRESETS[2]; // lightbulb
    if (normalized.includes("me") || normalized.includes("mechanic")) return SUBJECT_AVATAR_PRESETS[3]; // cog
    if (normalized.includes("ce") || normalized.includes("civil")) return SUBJECT_AVATAR_PRESETS[4]; // trees
    if (normalized.includes("it") || normalized.includes("info")) return SUBJECT_AVATAR_PRESETS[5]; // shield
  }

  // Default fallback
  return SUBJECT_AVATAR_PRESETS[0];
}
