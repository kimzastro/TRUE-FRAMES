import React, { useState } from "react";
import { Folder, ArrowUpRight } from "lucide-react";
import { Subject, Material, ViewState } from "../types";
import { motion } from "motion/react";
import { getSubjectAvatar } from "../lib/subjectAvatars";

interface SubjectGridProps {
  subjects: Subject[];
  materials: Material[];
  onNavigate: (view: ViewState) => void;
  isAdmin: boolean;
  onDeleteSubject?: (id: string) => void;
}

export default function SubjectGrid({
  subjects,
  materials,
  onNavigate,
  isAdmin,
  onDeleteSubject,
}: SubjectGridProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 font-display">Engineering Subjects</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Select a course folder to view academic semesters and resources.</p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-12 text-center">
          <Folder className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-600 dark:text-zinc-300 font-medium">No subjects found.</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">
            {isAdmin ? "Click 'Add Subject' in the Admin panel to start." : "Check back later or double-click ENGINOTES to add subjects."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subj, index) => {
            const count = materials.filter((m) => m.subjectId === subj.id).length;
            const avatar = getSubjectAvatar(subj.icon, subj.id);
            const Icon = avatar.Icon;

            return (
              <motion.div
                key={subj.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative flex flex-col"
              >
                {/* Visual Folder Tab */}
                <div className="flex items-end h-4 pl-4 select-none">
                  <div className={`w-20 h-4 ${avatar.accent} rounded-t-lg folder-tab opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                </div>

                {/* Folder Body */}
                <div
                  onClick={() => onNavigate({ type: "subject", subjectId: subj.id })}
                  className={`flex-1 flex flex-col p-6 rounded-2xl rounded-tl-none border dark:border-zinc-800 shadow-xs group-hover:shadow-md transition-all duration-300 cursor-pointer ${avatar.bgLight} dark:bg-zinc-900`}
                >
                  {/* Folder Contents */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl ${avatar.iconBg} flex items-center justify-center shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold font-mono text-zinc-500 dark:text-zinc-400 bg-white/70 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-100 dark:border-zinc-700">
                      {count} {count === 1 ? "File" : "Files"}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-100 font-display group-hover:text-indigo-900 dark:group-hover:text-indigo-300 transition-colors flex items-center">
                      {subj.name}
                      <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5 line-clamp-2 h-10">
                      {subj.description || "Study guides, notes, and previous year papers."}
                    </p>
                  </div>

                  {/* Actions / Info */}
                  <div className="mt-4 pt-3 border-t border-zinc-150/50 dark:border-zinc-800/50 flex justify-between items-center text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                    <span>CODE: {subj.id.toUpperCase()}</span>
                    <span className={`font-semibold group-hover:underline ${avatar.lightText} dark:text-indigo-400`}>Open Folder</span>
                  </div>
                </div>


                 {/* Admin delete overlay button */}
                 {isAdmin && onDeleteSubject && (
                   <div className="absolute -top-2 -right-2 z-20">
                     {confirmDeleteId === subj.id ? (
                       <div 
                         onClick={(e) => e.stopPropagation()}
                         className="bg-white border border-red-200 text-red-700 shadow-lg rounded-xl p-2 flex flex-col items-center space-y-1 animate-in fade-in zoom-in-95 duration-100"
                       >
                         <span className="text-[9px] font-bold">Purge?</span>
                         <div className="flex space-x-1">
                           <button
                             id={`btn-confirm-delete-subj-${subj.id}`}
                             onClick={(e) => {
                               e.stopPropagation();
                               onDeleteSubject(subj.id);
                               setConfirmDeleteId(null);
                             }}
                             className="text-[9px] font-bold bg-red-600 hover:bg-red-700 text-white px-1.5 py-0.5 rounded cursor-pointer"
                           >
                             Yes
                           </button>
                           <button
                             id={`btn-cancel-delete-subj-${subj.id}`}
                             onClick={(e) => {
                               e.stopPropagation();
                               setConfirmDeleteId(null);
                             }}
                             className="text-[9px] font-bold bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-1 py-0.5 rounded cursor-pointer"
                           >
                             No
                           </button>
                         </div>
                       </div>
                     ) : (
                       <button
                         id={`btn-delete-subject-${subj.id}`}
                         onClick={(e) => {
                           e.stopPropagation();
                           setConfirmDeleteId(subj.id);
                         }}
                         className="bg-red-100 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 p-1.5 rounded-full shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                         title="Delete Subject Folder"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       </button>
                     )}
                   </div>
                 )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
