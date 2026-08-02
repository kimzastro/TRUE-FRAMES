import React, { useState, useMemo } from "react";
import { BookOpen, Calendar, Search, Tag, X, FileDown, ChevronRight } from "lucide-react";
import { Subject, Material, ViewState } from "../types";
import { formatBytes, formatDate } from "../utils";
import { motion } from "motion/react";
import { getSubjectAvatar } from "../lib/subjectAvatars";

interface SemesterGridProps {
  subject: Subject;
  materials: Material[];
  onNavigate: (view: ViewState) => void;
  onDownload: (id: string) => void;
}

export default function SemesterGrid({ subject, materials, onNavigate, onDownload }: SemesterGridProps) {
  const [searchTag, setSearchTag] = useState("");

  const avatar = getSubjectAvatar(subject.icon, subject.id);
  const IconComponent = avatar.Icon;

  // Get all materials belonging to this subject
  const subjectMaterials = useMemo(() => {
    return materials.filter((m) => m.subjectId === subject.id);
  }, [materials, subject.id]);

  // Extract all unique tags in this subject for quick suggestions
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    subjectMaterials.forEach((m) => {
      m.tags.forEach((t) => tags.add(t));
    });
    return Array.from(tags).slice(0, 8); // top 8 tags
  }, [subjectMaterials]);

  // Filter materials if search is active
  const filteredMaterials = useMemo(() => {
    if (!searchTag.trim()) return [];
    const query = searchTag.toLowerCase().trim();
    return subjectMaterials.filter((m) =>
      m.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      m.title.toLowerCase().includes(query)
    );
  }, [subjectMaterials, searchTag]);

  // Count files for each semester
  const semesterCounts = useMemo(() => {
    const counts: Record<number, { total: number; pyqs: number; notes: number; shorts: number }> = {};
    for (let i = 1; i <= 8; i++) {
      counts[i] = { total: 0, pyqs: 0, notes: 0, shorts: 0 };
    }
    subjectMaterials.forEach((m) => {
      const sem = m.semester;
      if (sem >= 1 && sem <= 8) {
        counts[sem].total++;
        if (m.category === "pyqs") counts[sem].pyqs++;
        if (m.category === "notes") counts[sem].notes++;
        if (m.category === "short_notes") counts[sem].shorts++;
      }
    });
    return counts;
  }, [subjectMaterials]);

  return (
    <div>
      {/* Title block */}
      <div className="mb-6 flex items-start space-x-3.5">
        <div className={`p-3 rounded-2xl ${avatar.iconBg} shrink-0 shadow-xs mt-0.5`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider font-mono uppercase">Subject Archive</span>
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 font-display mt-0.5">{subject.name}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">{subject.description || "Course syllabus, PYQs, lecture notes, and revision files sorted by semester."}</p>
        </div>
      </div>

      {/* Tag Search Bar */}
      <div id="tag-search-container" className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-5 mb-8 shadow-xs transition-colors">
        <label htmlFor="tag-search-input" className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
          Filter Subject Entries by Tags / Keywords
        </label>
        <div className="relative">
          <input
            id="tag-search-input"
            type="text"
            placeholder="Search tags (e.g., dsa, trees, op-amp, entropy) or resource titles..."
            value={searchTag}
            onChange={(e) => setSearchTag(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 rounded-xl py-3 pl-11 pr-10 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-sans"
          />
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 absolute left-3.5 top-3.5" />
          {searchTag && (
            <button
              onClick={() => setSearchTag("")}
              className="absolute right-3.5 top-3.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Tags */}
        {allTags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 flex items-center mr-1">
              <Tag className="w-3 h-3 mr-1" /> Quick tags:
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchTag(tag)}
                className={`text-xs px-2.5 py-1 rounded-md font-mono border transition-all cursor-pointer ${
                  searchTag === tag
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Conditional Rendering: If search results are showing */}
      {searchTag.trim() ? (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100">
            <h3 className="font-bold font-display text-zinc-800 text-lg flex items-center">
              Search Results
              <span className="ml-2 px-2.5 py-0.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full font-mono">
                {filteredMaterials.length} found
              </span>
            </h3>
            <button
              onClick={() => setSearchTag("")}
              className="text-xs font-mono text-indigo-600 hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-8 text-center text-zinc-500 text-sm">
              No files matching <span className="font-mono text-indigo-600">"{searchTag}"</span> in this subject.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white border border-zinc-150 rounded-xl p-4 flex flex-col justify-between hover:shadow-xs hover:border-indigo-200 transition-all group"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold font-mono bg-zinc-50 border border-zinc-150 text-zinc-600 uppercase rounded">
                        Sem {mat.semester} • {mat.category === "pyqs" ? "PYQ" : mat.category === "notes" ? "Notes" : "Short Notes"}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                        {formatBytes(mat.fileSize)}
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-900 group-hover:text-indigo-900 transition-colors text-sm line-clamp-1">
                      {mat.title}
                    </h4>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mat.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-50 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-zinc-400">
                      {formatDate(mat.uploadDate)}
                    </span>
                    <button
                      id={`btn-search-dl-${mat.id}`}
                      onClick={() => onDownload(mat.id)}
                      className="flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors font-mono cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Always display semesters - standard 8 boxes */}
      <div className="mt-2">
        <h3 className="text-sm font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
          {searchTag.trim() ? "Browse All Semesters" : "Academic Semesters"}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => {
            const semesterNum = i + 1;
            const counts = semesterCounts[semesterNum] || { total: 0, pyqs: 0, notes: 0, shorts: 0 };

            return (
              <motion.div
                key={semesterNum}
                whileHover={{ scale: 1.02 }}
                onClick={() =>
                  onNavigate({
                    type: "semester",
                    subjectId: subject.id,
                    semester: semesterNum,
                  })
                }
                className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-2xl p-5 hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors font-display">
                    Semester {semesterNum}
                  </h4>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-0.5">
                    {counts.total} total {counts.total === 1 ? "resource" : "resources"}
                  </p>
                </div>

                {/* Sub counts */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-1 text-[10px] text-center font-mono text-zinc-400 dark:text-zinc-500">
                  <div>
                    <span className="block font-bold text-zinc-700 dark:text-zinc-300">{counts.pyqs}</span>
                    <span>PYQs</span>
                  </div>
                  <div>
                    <span className="block font-bold text-zinc-700 dark:text-zinc-300">{counts.notes}</span>
                    <span>Notes</span>
                  </div>
                  <div>
                    <span className="block font-bold text-zinc-700 dark:text-zinc-300">{counts.shorts}</span>
                    <span>Shorts</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
