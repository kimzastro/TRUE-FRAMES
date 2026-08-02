import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Subject, ViewState } from "../types";

interface BreadcrumbProps {
  viewState: ViewState;
  subjects: Subject[];
  onNavigate: (view: ViewState) => void;
}

export default function Breadcrumb({ viewState, subjects, onNavigate }: BreadcrumbProps) {
  const getSubjectName = (id: string) => {
    return subjects.find((s) => s.id === id)?.name || id;
  };

  const getCategoryLabel = (category: "pyqs" | "notes" | "short_notes") => {
    switch (category) {
      case "pyqs":
        return "PYQs";
      case "notes":
        return "Notes";
      case "short_notes":
        return "Short Notes";
      default:
        return category;
    }
  };

  return (
    <nav id="app-breadcrumb" className="flex items-center space-x-1.5 md:space-x-2 text-sm text-zinc-500 dark:text-zinc-400 py-4 overflow-x-auto whitespace-nowrap scrollbar-none select-none">
      <button
        id="breadcrumb-home"
        onClick={() => onNavigate({ type: "home" })}
        className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors cursor-pointer"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Portal Home</span>
      </button>

      {viewState.type !== "home" && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
          <button
            id="breadcrumb-subject"
            onClick={() => onNavigate({ type: "subject", subjectId: viewState.subjectId })}
            disabled={viewState.type === "subject"}
            className={`font-medium transition-colors cursor-pointer ${
              viewState.type === "subject"
                ? "text-zinc-800 dark:text-zinc-200 font-semibold cursor-default"
                : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            }`}
          >
            {getSubjectName(viewState.subjectId)}
          </button>
        </>
      )}

      {viewState.type !== "home" && viewState.type !== "subject" && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
          <button
            id="breadcrumb-semester"
            onClick={() =>
              onNavigate({
                type: "semester",
                subjectId: viewState.subjectId,
                semester: viewState.semester,
              })
            }
            disabled={viewState.type === "semester"}
            className={`font-medium transition-colors cursor-pointer ${
              viewState.type === "semester"
                ? "text-zinc-800 dark:text-zinc-200 font-semibold cursor-default"
                : "text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            }`}
          >
            Semester {viewState.semester}
          </button>
        </>
      )}

      {viewState.type === "category" && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0" />
          <span className="text-zinc-800 dark:text-zinc-200 font-semibold font-display">
            {getCategoryLabel(viewState.category)}
          </span>
        </>
      )}
    </nav>
  );

}
