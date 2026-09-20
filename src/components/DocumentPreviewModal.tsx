import React, { useEffect, useState } from "react";
import { X, ExternalLink, Download, Star, Maximize2, Minimize2, AlertCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Material, Subject } from "../types";
import { parseDriveLink } from "../utils";

interface DocumentPreviewModalProps {
  material: Material | null;
  subject?: Subject | null;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onClose: () => void;
}

export default function DocumentPreviewModal({
  material,
  subject,
  isBookmarked,
  onToggleBookmark,
  onClose,
}: DocumentPreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!material) return null;

  const linkInfo = parseDriveLink(material.driveLink);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "pyqs":
        return "PYQs (Exam Papers)";
      case "notes":
        return "Lecture Notes";
      case "short_notes":
        return "Short Notes / Cheat Sheet";
      default:
        return category.toUpperCase();
    }
  };

  return (
    <AnimatePresence>
      <div
        id="document-preview-overlay"
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full transition-all duration-200 ${
            isFullscreen
              ? "h-[98vh] max-w-[98vw]"
              : "h-[88vh] max-w-5xl"
          }`}
        >
          {/* Modal Header */}
          <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                    {subject ? subject.name : material.subjectId.toUpperCase()} • Sem {material.semester}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded font-semibold">
                    {getCategoryLabel(material.category)}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
                  {material.title}
                </h3>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
              {/* Star / Bookmark button */}
              <button
                id="btn-preview-bookmark"
                type="button"
                onClick={() => onToggleBookmark(material.id)}
                title={isBookmarked ? "Remove from Starred Notes" : "Add to Starred Notes"}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isBookmarked
                    ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-500"
                    : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-amber-500"
                }`}
              >
                <Star className={`w-4 h-4 ${isBookmarked ? "fill-amber-400" : ""}`} />
              </button>

              {/* Direct Open in Drive */}
              <a
                id="btn-preview-external"
                href={linkInfo.viewUrl || material.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Google Drive tab"
                className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Drive</span>
              </a>

              {/* Download link */}
              <a
                id="btn-preview-download"
                href={linkInfo.directDownloadUrl || material.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Direct Download"
                className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>

              {/* Maximize toggle */}
              <button
                id="btn-preview-fullscreen"
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Restore window" : "Maximize window"}
                className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer hidden md:inline-flex"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close button */}
              <button
                id="btn-preview-close"
                type="button"
                onClick={onClose}
                title="Close viewer (Esc)"
                className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body / Iframe Area */}
          <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 relative flex items-center justify-center overflow-hidden">
            {/* Loading indicator */}
            {!iframeLoaded && !loadError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50/80 dark:bg-zinc-900/80 z-10 pointer-events-none">
                <div className="w-8 h-8 border-3 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-3">Loading interactive document preview...</p>
              </div>
            )}

            {/* Embedded Drive / Docs Preview */}
            {linkInfo.previewUrl ? (
              <iframe
                id="document-preview-iframe"
                src={linkInfo.previewUrl}
                title={material.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIframeLoaded(true)}
                onError={() => {
                  setIframeLoaded(true);
                  setLoadError(true);
                }}
              />
            ) : (
              <div className="p-8 text-center max-w-md">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Direct Link Preview</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
                  This resource points to an external link. You can open it in a new window to view and study.
                </p>
                <a
                  href={material.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Resource</span>
                </a>
              </div>
            )}
          </div>

          {/* Quick Notice Footer */}
          <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            <span className="truncate">
              If Google Drive restricts in-frame preview, click "Drive" or "Download" above.
            </span>
            <span className="hidden sm:inline shrink-0 font-semibold text-indigo-600 dark:text-indigo-400">
              ESC to exit
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
