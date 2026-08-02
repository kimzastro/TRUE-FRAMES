import React, { useMemo, useState } from "react";
import { FileText, ArrowLeft, ExternalLink, Trash2, Calendar, CheckCircle } from "lucide-react";
import { Subject, Material, ViewState } from "../types";
import { formatDate } from "../utils";
import { motion } from "motion/react";

interface MaterialListProps {
  subject: Subject;
  semester: number;
  category: "pyqs" | "notes" | "short_notes";
  materials: Material[];
  onNavigate: (view: ViewState) => void;
  onDownload: (id: string) => void;
  isAdmin: boolean;
  onDeleteMaterial: (id: string) => void;
}

export default function MaterialList({
  subject,
  semester,
  category,
  materials,
  onNavigate,
  onDownload,
  isAdmin,
  onDeleteMaterial,
}: MaterialListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter materials to match exact subject, semester, and category
  const filteredMaterials = useMemo(() => {
    return materials.filter(
      (m) => m.subjectId === subject.id && m.semester === semester && m.category === category
    );
  }, [materials, subject.id, semester, category]);

  const getCategoryLabel = (cat: "pyqs" | "notes" | "short_notes") => {
    switch (cat) {
      case "pyqs":
        return "Previous Year Questions (PYQs)";
      case "notes":
        return "Lecture Notes";
      case "short_notes":
        return "Short Notes / Cheat Sheets";
      default:
        return cat;
    }
  };

  const getCategoryColor = (cat: "pyqs" | "notes" | "short_notes") => {
    switch (cat) {
      case "pyqs":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900";
      case "notes":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900";
      case "short_notes":
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900";
      default:
        return "text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border-zinc-150 dark:border-zinc-700";
    }
  };

  return (
    <div>
      {/* Header Block */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider font-mono uppercase">
              {subject.name} • Semester {semester}
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold font-mono border rounded uppercase ${getCategoryColor(category)}`}>
              {category === "short_notes" ? "Short Notes" : category.toUpperCase()}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 font-display mt-1">{getCategoryLabel(category)}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Click download to save files directly to your device for offline study.</p>
        </div>

        <button
          id="btn-back-to-categories"
          onClick={() => onNavigate({ type: "semester", subjectId: subject.id, semester: semester })}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Categories</span>
        </button>
      </div>

      {/* Materials List/Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-16 text-center">
          <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-600 dark:text-zinc-300 font-medium text-base">No files uploaded yet in this catalog.</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 max-w-md mx-auto">
            {isAdmin
              ? "Use the upload form in the Admin dashboard to add PDFs for this semester."
              : "No resources are currently published for this category. Double-click ENGINOTES to login as admin and add materials."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((mat, index) => (
            <motion.div
              key={mat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-700 rounded-xl p-5 flex flex-col justify-between hover:shadow-xs transition-all group relative"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-indigo-50/70 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block uppercase">RESOURCE LINK</span>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        Google Drive
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      {confirmDeleteId === mat.id ? (
                        <div className="flex items-center space-x-1 bg-red-50 dark:bg-red-950 border border-red-150 dark:border-red-900 px-2 py-1 rounded-lg">
                          <span className="text-[10px] font-bold text-red-700 dark:text-red-300 mr-1">Delete?</span>
                          <button
                            id={`btn-confirm-delete-mat-${mat.id}`}
                            onClick={() => {
                              onDeleteMaterial(mat.id);
                              setConfirmDeleteId(null);
                            }}
                            className="text-[9px] font-bold bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            id={`btn-cancel-delete-mat-${mat.id}`}
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-[9px] font-bold bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-delete-mat-${mat.id}`}
                          onClick={() => setConfirmDeleteId(mat.id)}
                          className="p-1.5 text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg border border-transparent hover:border-red-100 dark:hover:border-red-900 transition-all cursor-pointer"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors">
                  {mat.title}
                </h3>

                {/* Badges/Tags */}
                {mat.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {mat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/50 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom detail action row */}
              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center text-[10px] text-zinc-400 dark:text-zinc-500 font-mono space-x-3">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-zinc-300 dark:text-zinc-600" />
                    {formatDate(mat.uploadDate)}
                  </span>
                  <span className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/50">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Google Drive
                  </span>
                </div>

                <button
                  id={`btn-download-${mat.id}`}
                  onClick={() => window.open(mat.driveLink, "_blank", "noopener,noreferrer")}
                  className="inline-flex items-center space-x-1 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white border border-indigo-100 dark:border-indigo-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs"
                  title="Open Link in New Tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Link</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

}
