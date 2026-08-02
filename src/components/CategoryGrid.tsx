import React, { useMemo } from "react";
import { HelpCircle, BookOpen, FileText, ChevronRight, ArrowLeft } from "lucide-react";
import { Subject, Material, ViewState } from "../types";
import { motion } from "motion/react";

interface CategoryGridProps {
  subject: Subject;
  semester: number;
  materials: Material[];
  onNavigate: (view: ViewState) => void;
}

export default function CategoryGrid({ subject, semester, materials, onNavigate }: CategoryGridProps) {
  // Filter materials for this subject and semester
  const semesterMaterials = useMemo(() => {
    return materials.filter((m) => m.subjectId === subject.id && m.semester === semester);
  }, [materials, subject.id, semester]);

  // Counts for each of the 3 boxes
  const counts = useMemo(() => {
    return {
      pyqs: semesterMaterials.filter((m) => m.category === "pyqs").length,
      notes: semesterMaterials.filter((m) => m.category === "notes").length,
      short_notes: semesterMaterials.filter((m) => m.category === "short_notes").length,
    };
  }, [semesterMaterials]);

  const categories = [
    {
      id: "pyqs" as const,
      name: "PYQs",
      description: "Previous Year Question papers, Mid-semester exams, and Solution keys.",
      icon: HelpCircle,
      count: counts.pyqs,
      color: {
        border: "hover:border-blue-300 dark:hover:border-blue-700",
        bg: "bg-blue-50/20 dark:bg-blue-950/20",
        iconBg: "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
        text: "text-blue-800 dark:text-blue-300",
        hoverBg: "hover:bg-blue-50/50 dark:hover:bg-blue-900/30",
      },
    },
    {
      id: "notes" as const,
      name: "Notes",
      description: "Comprehensive class notes, detailed lecture slides, and professor reference material.",
      icon: BookOpen,
      count: counts.notes,
      color: {
        border: "hover:border-emerald-300 dark:hover:border-emerald-700",
        bg: "bg-emerald-50/20 dark:bg-emerald-950/20",
        iconBg: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
        text: "text-emerald-800 dark:text-emerald-300",
        hoverBg: "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30",
      },
    },
    {
      id: "short_notes" as const,
      name: "Short Notes",
      description: "Quick revision sheets, formula cheat sheets, and summarized flashcards.",
      icon: FileText,
      count: counts.short_notes,
      color: {
        border: "hover:border-amber-300 dark:hover:border-amber-700",
        bg: "bg-amber-50/20 dark:bg-amber-950/20",
        iconBg: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
        text: "text-amber-800 dark:text-amber-300",
        hoverBg: "hover:bg-amber-50/50 dark:hover:bg-amber-900/30",
      },
    },
  ];

  return (
    <div>
      {/* Header and Back Button */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider font-mono uppercase">
            {subject.name} • Semester {semester}
          </span>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 font-display mt-0.5">Resource Categories</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Choose a resource category to view and download study materials.</p>
        </div>

        <button
          id="btn-back-to-subject"
          onClick={() => onNavigate({ type: "subject", subjectId: subject.id })}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Semesters</span>
        </button>
      </div>

      {/* Grid of 3 Category Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat, index) => {
          const Icon = cat.icon;
          const styles = cat.color;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              onClick={() =>
                onNavigate({
                  type: "category",
                  subjectId: subject.id,
                  semester: semester,
                  category: cat.id,
                })
              }
              className={`bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-6 hover:shadow-sm cursor-pointer transition-all duration-300 flex flex-col justify-between group h-64 ${styles.border} ${styles.hoverBg}`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className={`p-3 rounded-xl ${styles.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs font-bold font-mono text-zinc-400 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 px-2 py-0.5 rounded-full">
                      {cat.count} {cat.count === 1 ? "File" : "Files"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-550 transition-all" />
                  </div>
                </div>

                <h3 className={`text-xl font-bold font-display ${styles.text}`}>
                  {cat.name}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 line-clamp-4 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400 dark:text-zinc-500">
                <span>Browse Vault</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">Open Catalog</span>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
