import React, { useState, useMemo } from "react";
import { Star, Eye, ExternalLink, ArrowLeft, Search, X, Folder, Calendar } from "lucide-react";
import { Material, Subject, ViewState } from "../types";
import { formatDate } from "../utils";
import { motion } from "motion/react";

interface StarredNotesViewProps {
  materials: Material[];
  subjects: Subject[];
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onPreview: (material: Material) => void;
  onClose: () => void;
  onNavigate: (view: ViewState) => void;
}

export default function StarredNotesView({
  materials,
  subjects,
  bookmarkedIds,
  onToggleBookmark,
  onPreview,
  onClose,
  onNavigate,
}: StarredNotesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const subjectMap = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Retrieve bookmarked material objects
  const starredMaterials = useMemo(() => {
    const set = new Set(bookmarkedIds);
    return materials.filter((m) => set.has(m.id));
  }, [materials, bookmarkedIds]);

  const filteredMaterials = useMemo(() => {
    if (!searchTerm.trim()) return starredMaterials;
    const q = searchTerm.toLowerCase().trim();
    return starredMaterials.filter((m) => {
      const subj = subjectMap.get(m.subjectId);
      return (
        m.title.toLowerCase().includes(q) ||
        (subj && subj.name.toLowerCase().includes(q)) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [starredMaterials, searchTerm, subjectMap]);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "pyqs":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-100 dark:border-blue-900";
      case "notes":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 border-emerald-100 dark:border-emerald-900";
      case "short_notes":
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border-amber-100 dark:border-amber-900";
      default:
        return "text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700";
    }
  };

  return (
    <div id="starred-notes-section">
      {/* Top Bar */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-500 border border-amber-200 dark:border-amber-800">
              <Star className="w-4 h-4 fill-amber-400" />
            </span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 tracking-wider font-mono uppercase">
              Quick Study Desk
            </span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 font-display mt-1">
            Starred Notes & Bookmarks
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Your saved exam papers, revision guides, and lecture materials for instant 1-click access.
          </p>
        </div>

        <button
          id="btn-close-starred"
          onClick={onClose}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </button>
      </div>

      {/* Filter / Search Bar inside Starred */}
      {starredMaterials.length > 0 && (
        <div className="relative mb-6">
          <input
            id="starred-search-input"
            type="text"
            placeholder="Search within your starred files by topic, title, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-950 rounded-xl py-2.5 pl-10 pr-9 outline-none text-sm transition-all"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Grid or Empty State */}
      {starredMaterials.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center mb-3">
            <Star className="w-7 h-7 text-amber-500 fill-amber-200/50" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-display">No Starred Notes Yet</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            Click the star icon on any lecture note, PYQ paper, or formula cheat sheet to keep it right here for rapid reference during exams.
          </p>
          <button
            onClick={onClose}
            className="mt-5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            Browse Subjects
          </button>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No starred notes match "{searchTerm}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map((mat, index) => {
            const subj = subjectMap.get(mat.subjectId);
            return (
              <motion.div
                key={mat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700 rounded-xl p-5 flex flex-col justify-between shadow-xs transition-all group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {subj ? subj.name : mat.subjectId.toUpperCase()} • Sem {mat.semester}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold font-mono border rounded uppercase ${getCategoryColor(
                          mat.category
                        )}`}
                      >
                        {mat.category === "short_notes" ? "Short Notes" : mat.category.toUpperCase()}
                      </span>
                    </div>

                    <button
                      id={`btn-unstar-${mat.id}`}
                      onClick={() => onToggleBookmark(mat.id)}
                      title="Remove from Starred"
                      className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/60 border border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition-colors cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-amber-900 dark:group-hover:text-amber-300 transition-colors">
                    {mat.title}
                  </h3>

                  {mat.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {mat.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-zinc-300 dark:text-zinc-600" />
                    {formatDate(mat.uploadDate)}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      id={`btn-preview-star-${mat.id}`}
                      onClick={() => onPreview(mat)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white border border-indigo-100 dark:border-indigo-900 transition-all cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <a
                      href={mat.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Open in Google Drive"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
