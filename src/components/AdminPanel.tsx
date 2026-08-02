import React, { useState, useEffect } from "react";
import { FolderGit2, Link as LinkIcon, FileText, Plus, ListFilter, Trash2, KeyRound, AlertCircle, Sparkles, X, Users, Download, FileSpreadsheet, ExternalLink, CheckCircle2 } from "lucide-react";
import { Subject, Material } from "../types";
import { SUBJECT_AVATAR_PRESETS, getSubjectAvatar } from "../lib/subjectAvatars";

interface AdminPanelProps {
  subjects: Subject[];
  materials: Material[];
  onAddSubject: (name: string, description: string, icon?: string) => Promise<boolean>;
  onDeleteSubject: (id: string) => Promise<boolean>;
  onAddMaterial: (materialData: {
    title: string;
    subjectId: string;
    semester: number;
    category: "pyqs" | "notes" | "short_notes";
    tags: string;
    driveLink: string;
  }) => Promise<boolean>;
  onDeleteMaterial: (id: string) => Promise<boolean>;
  onClose: () => void;
}

export default function AdminPanel({
  subjects,
  materials,
  onAddSubject,
  onDeleteSubject,
  onAddMaterial,
  onDeleteMaterial,
  onClose,
}: AdminPanelProps) {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<"upload" | "subjects" | "materials" | "registrations">("upload");

  // Student Registrations State
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [sheetsLoading, setSheetsLoading] = useState(false);
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string | null>(null);
  const [sheetsError, setSheetsError] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    setRegLoading(true);
    try {
      const res = await fetch("/api/registrations");
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      }
    } catch (err) {
      console.error("Error fetching registrations:", err);
    } finally {
      setRegLoading(false);
    }
  };

  const handleDownloadSpreadsheet = async (type: "all" | "webdev" = "all") => {
    try {
      const endpoint = type === "webdev" ? "/api/registrations/download-webdev" : "/api/registrations/download";
      const filename = type === "webdev" ? "web_development_interested_students.csv" : "student_registrations_directory.csv";
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to download spreadsheet");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Spreadsheet CSV download error:", err);
      alert("Download failed. Please check backend connection.");
    }
  };

  const handleExportToGoogleSheets = async (targetType: "all" | "webdev" = "all") => {
    setSheetsLoading(true);
    setSheetsError(null);
    try {
      const res = await fetch("/api/sheets/create-registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer google_workspace_sheet_token_${Date.now()}`
        },
        body: JSON.stringify({ targetType }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreatedSheetUrl(data.spreadsheetUrl);
      } else {
        setSheetsError(data.error || "Could not create Google Sheet spreadsheet.");
      }
    } catch (err: any) {
      console.error("Google Sheets API connection error:", err);
      setSheetsError("Connection error while exporting to Google Sheets.");
    } finally {
      setSheetsLoading(false);
    }
  };

  const [regFilter, setRegFilter] = useState<"all" | "webdev">("all");

  useEffect(() => {
    if (activeTab === "registrations") {
      fetchRegistrations();
    }
  }, [activeTab]);

  // Subject Form State
  const [subjName, setSubjName] = useState("");
  const [subjDesc, setSubjDesc] = useState("");
  const [subjIcon, setSubjIcon] = useState("cpu");
  const [subjLoading, setSubjLoading] = useState(false);
  const [subjMessage, setSubjMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Material Form State
  const [matTitle, setMatTitle] = useState("");
  const [matSubjectId, setMatSubjectId] = useState("");
  const [matSemester, setMatSemester] = useState(1);
  const [matCategory, setMatCategory] = useState<"pyqs" | "notes" | "short_notes">("pyqs");
  const [matTags, setMatTags] = useState("");
  const [matDriveLink, setMatDriveLink] = useState("");
  const [matLoading, setMatLoading] = useState(false);
  const [matMessage, setMatMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter lists inside admin view
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");

  // Deletion confirmation states
  const [confirmDeleteSubId, setConfirmDeleteSubId] = useState<string | null>(null);
  const [confirmDeleteMatId, setConfirmDeleteMatId] = useState<string | null>(null);

  // Submit new subject
  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim()) return;

    setSubjLoading(true);
    setSubjMessage(null);

    const success = await onAddSubject(subjName.trim(), subjDesc.trim(), subjIcon);
    setSubjLoading(false);

    if (success) {
      setSubjMessage({ type: "success", text: "Subject folder created successfully!" });
      setSubjName("");
      setSubjDesc("");
    } else {
      setSubjMessage({ type: "error", text: "Failed to create subject. ID may already exist." });
    }
  };

  // Submit new material
  const handleMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!matTitle.trim()) {
      alert("Please enter a title for the material.");
      return;
    }
    if (!matSubjectId) {
      alert("Please select a subject folder.");
      return;
    }
    if (!matDriveLink.trim()) {
      alert("Please enter a Google Drive link.");
      return;
    }
    if (!matDriveLink.trim().startsWith("http://") && !matDriveLink.trim().startsWith("https://")) {
      alert("Please enter a valid URL link (starting with http:// or https://).");
      return;
    }

    setMatLoading(true);
    setMatMessage(null);

    const success = await onAddMaterial({
      title: matTitle.trim(),
      subjectId: matSubjectId,
      semester: matSemester,
      category: matCategory,
      tags: matTags,
      driveLink: matDriveLink.trim(),
    });

    setMatLoading(false);

    if (success) {
      setMatMessage({ type: "success", text: `"${matTitle}" published successfully with Google Drive link!` });
      // Reset form
      setMatTitle("");
      setMatTags("");
      setMatDriveLink("");
    } else {
      setMatMessage({ type: "error", text: "Failed to publish material. Check server logs." });
    }
  };

  // Filter materials list
  const filteredMaterials = materials.filter((m) => {
    if (selectedSubjectFilter === "all") return true;
    return m.subjectId === selectedSubjectFilter;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-lg overflow-hidden max-w-4xl mx-auto mb-12">
      {/* Admin Panel Header */}
      <div className="bg-zinc-900 dark:bg-zinc-950 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-zinc-800 text-amber-400 rounded-xl border border-zinc-700">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight flex items-center gap-1.5">
              Secure Administrative Vault
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 border border-zinc-700 bg-zinc-800 px-2 py-0.5 rounded uppercase">
                Active
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono">Manage folders and publish academic Drive links</p>
          </div>
        </div>
        <button
          id="btn-close-admin-panel"
          onClick={onClose}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full p-1.5 transition-colors cursor-pointer"
          title="Exit Admin View"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab("upload");
            setMatMessage(null);
          }}
          className={`px-5 py-3.5 text-sm font-semibold font-display border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "upload"
              ? "border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          <span>Publish Link</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("subjects");
            setSubjMessage(null);
          }}
          className={`px-5 py-3.5 text-sm font-semibold font-display border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "subjects"
              ? "border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          }`}
        >

          <FolderGit2 className="w-4 h-4" />
          <span>Manage Subjects</span>
        </button>
        <button
          onClick={() => setActiveTab("materials")}
          className={`px-5 py-3.5 text-sm font-semibold font-display border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "materials"
              ? "border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Database Entries ({materials.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("registrations")}
          className={`px-5 py-3.5 text-sm font-semibold font-display border-b-2 flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "registrations"
              ? "border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-zinc-900"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Directory (Spreadsheet)</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* TAB 1: UPLOAD MATERIAL */}
        {activeTab === "upload" && (
          <form onSubmit={handleMaterialSubmit} className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
              <h3 className="font-bold font-display text-zinc-800 text-base flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-indigo-600" />
                Publish Study Resources
              </h3>
              <span className="text-xs font-mono text-zinc-400">Drive Link Publisher</span>
            </div>

            {matMessage && (
              <div
                className={`p-4 rounded-xl border text-sm flex items-start space-x-3 ${
                  matMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                    : "bg-red-50 text-red-800 border-red-100"
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{matMessage.text}</span>
              </div>
            )}

            {subjects.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-xl text-sm flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">No Subject Folders Available!</p>
                  <p className="mt-0.5">You must create at least one subject folder in the "Manage Subjects" tab before uploading materials.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* File Title */}
                  <div className="col-span-1 md:col-span-2">
                    <label htmlFor="mat-title-input" className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                      Resource Title *
                    </label>
                    <input
                      id="mat-title-input"
                      type="text"
                      required
                      placeholder="e.g., Object Oriented Programming Notes - Prof. Sen"
                      value={matTitle}
                      onChange={(e) => setMatTitle(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2.5 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>

                  {/* Subject Target */}
                  <div>
                    <label htmlFor="mat-subject-select" className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                      Subject Folder *
                    </label>
                    <select
                      id="mat-subject-select"
                      required
                      value={matSubjectId}
                      onChange={(e) => setMatSubjectId(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition-all cursor-pointer"
                    >
                      <option value="">-- Choose Subject Folder --</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.id.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester Selection */}
                  <div>
                    <label htmlFor="mat-semester-select" className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                      Target Semester *
                    </label>
                    <select
                      id="mat-semester-select"
                      required
                      value={matSemester}
                      onChange={(e) => setMatSemester(parseInt(e.target.value, 10))}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition-all cursor-pointer"
                    >
                      {Array.from({ length: 8 }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Semester {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="mat-category-select" className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                      Resource Category *
                    </label>
                    <select
                      id="mat-category-select"
                      required
                      value={matCategory}
                      onChange={(e) => setMatCategory(e.target.value as any)}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-indigo-500 focus:bg-white rounded-xl px-3 py-2.5 outline-none transition-all cursor-pointer"
                    >
                      <option value="pyqs">PYQs (Previous Year Papers)</option>
                      <option value="notes">Notes (Lecture Guides)</option>
                      <option value="short_notes">Short Notes / Cheat Sheets</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label htmlFor="mat-tags-input" className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                      Filter Tags (Comma-separated)
                    </label>
                    <input
                      id="mat-tags-input"
                      type="text"
                      placeholder="e.g., oop, java, classes, exam"
                      value={matTags}
                      onChange={(e) => setMatTags(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2.5 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                {/* Google Drive Link Input */}
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="mat-drive-link-input" className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                    Google Drive Link *
                  </label>
                  <div className="relative rounded-xl bg-zinc-50 border border-zinc-200 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 transition-all flex items-center">
                    <div className="pl-3 text-zinc-400">
                      <LinkIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="mat-drive-link-input"
                      type="url"
                      required
                      placeholder="e.g., https://drive.google.com/file/d/.../view?usp=sharing"
                      value={matDriveLink}
                      onChange={(e) => setMatDriveLink(e.target.value)}
                      className="w-full bg-transparent px-3 py-2.5 outline-none placeholder:text-zinc-400 text-sm"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1.5 font-mono">Ensure link sharing on Google Drive is set to "Anyone with the link can view"</p>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-2">
                  <button
                    id="btn-upload-material"
                    type="submit"
                    disabled={matLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center space-x-2 shadow-xs hover:shadow-md cursor-pointer"
                  >
                    {matLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Publishing Link...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4.5 h-4.5" />
                        <span>Publish Material</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* TAB 2: MANAGE SUBJECTS */}
        {activeTab === "subjects" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
              <h3 className="font-bold font-display text-zinc-800 text-base">Add New Subject Folders</h3>
              <span className="text-xs font-mono text-zinc-400">Database Schema Manager</span>
            </div>

            {subjMessage && (
              <div
                className={`p-4 rounded-xl border text-sm flex items-start space-x-3 ${
                  subjMessage.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                    : "bg-red-50 text-red-800 border-red-100"
                }`}
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{subjMessage.text}</span>
              </div>
            )}

            {/* Create form */}
            <form onSubmit={handleSubjectSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 border border-zinc-150 p-5 rounded-2xl">
              <div className="col-span-1 md:col-span-2">
                <h4 className="font-bold text-sm text-zinc-800 mb-1">Create a Custom Academic Folder</h4>
                <p className="text-xs text-zinc-500">Configure name, scope, and choose a custom profile picture icon avatar.</p>
              </div>

              <div>
                <label htmlFor="subj-name-input" className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-1">
                  Subject Name *
                </label>
                <input
                  id="subj-name-input"
                  type="text"
                  required
                  placeholder="e.g., Artificial Intelligence"
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  className="w-full bg-white border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2.5 outline-none transition-all placeholder:text-zinc-400 text-sm"
                />
              </div>

              <div>
                <label htmlFor="subj-desc-input" className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-1">
                  Brief Course Scope (Optional)
                </label>
                <input
                  id="subj-desc-input"
                  type="text"
                  placeholder="e.g., Deep Learning, NLP, Search, Neural Nets"
                  value={subjDesc}
                  onChange={(e) => setSubjDesc(e.target.value)}
                  className="w-full bg-white border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl px-4 py-2.5 outline-none transition-all placeholder:text-zinc-400 text-sm"
                />
              </div>

              {/* Custom Preset Profile Picture / Icon Selector */}
              <div className="col-span-1 md:col-span-2 pt-2 border-t border-zinc-200/70">
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-2">
                  Choose Custom Profile Picture Icon ({SUBJECT_AVATAR_PRESETS.length} Preset Options)
                </label>
                
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1.5 bg-white border border-zinc-200 rounded-2xl">
                  {SUBJECT_AVATAR_PRESETS.map((preset) => {
                    const IconComponent = preset.Icon;
                    const isSelected = subjIcon === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSubjIcon(preset.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs"
                            : "border-zinc-150 hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${preset.iconBg} mb-1.5 shadow-2xs`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-medium text-zinc-700 line-clamp-1">
                          {preset.label.split(" ")[0]}
                        </span>
                        {isSelected && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 flex justify-end mt-1">
                <button
                  id="btn-create-subject-folder"
                  type="submit"
                  disabled={subjLoading || !subjName.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white font-bold rounded-xl text-sm transition-all active:scale-95 flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>Create Subject Folder</span>
                </button>
              </div>
            </form>

            {/* List of current subjects */}
            <div>
              <h4 className="font-bold text-sm text-zinc-700 mb-3">Existing Subject Folders ({subjects.length})</h4>
              {subjects.length === 0 ? (
                <p className="text-zinc-400 text-sm italic">No folders created yet.</p>
              ) : (
                <div className="border border-zinc-150 rounded-2xl overflow-hidden divide-y divide-zinc-100">
                  {subjects.map((sub) => {
                    const count = materials.filter((m) => m.subjectId === sub.id).length;
                    const avatar = getSubjectAvatar(sub.icon, sub.id);
                    const IconComponent = avatar.Icon;

                    return (
                      <div key={sub.id} className="p-4 bg-white flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2.5 rounded-xl ${avatar.iconBg} shrink-0 shadow-2xs`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-950 text-sm flex items-center gap-2">
                              <span>{sub.name}</span>
                              <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full border border-zinc-200">
                                {avatar.label.split(" ")[0]} Avatar
                              </span>
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5 font-mono">ID: {sub.id} • Contains {count} files</p>
                            {sub.description && <p className="text-xs text-zinc-500 mt-1">{sub.description}</p>}
                          </div>
                        </div>

                        {confirmDeleteSubId === sub.id ? (
                          <div className="flex items-center space-x-1.5 bg-red-50 border border-red-150 p-1.5 rounded-xl shrink-0">
                            <span className="text-[10px] font-bold text-red-700">Purge folder?</span>
                            <button
                              id={`btn-confirm-del-subj-${sub.id}`}
                              onClick={() => {
                                onDeleteSubject(sub.id);
                                setConfirmDeleteSubId(null);
                              }}
                              className="text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              id={`btn-cancel-del-subj-${sub.id}`}
                              onClick={() => setConfirmDeleteSubId(null)}
                              className="text-[10px] font-bold bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-1.5 py-0.5 rounded cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`btn-del-subj-${sub.id}`}
                            onClick={() => setConfirmDeleteSubId(sub.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all cursor-pointer shrink-0"
                            title="Delete Subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE MATERIALS */}
        {activeTab === "materials" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-zinc-100">
              <div>
                <h3 className="font-bold font-display text-zinc-800 text-base">Database Registry</h3>
                <p className="text-xs text-zinc-400 font-mono">Manage individual file downloads and meta descriptions</p>
              </div>

              {/* Filter */}
              <div className="flex items-center space-x-2">
                <ListFilter className="w-4 h-4 text-zinc-400" />
                <select
                  id="admin-subject-filter"
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredMaterials.length === 0 ? (
              <div className="bg-zinc-50 border border-zinc-150 rounded-2xl p-12 text-center text-zinc-400 text-sm italic">
                No materials registered under this filter.
              </div>
            ) : (
              <div className="border border-zinc-150 rounded-2xl overflow-hidden divide-y divide-zinc-100 max-h-96 overflow-y-auto">
                {filteredMaterials.map((mat) => {
                  const sub = subjects.find((s) => s.id === mat.subjectId);
                  return (
                    <div key={mat.id} className="p-4 bg-white hover:bg-zinc-50/50 transition-colors flex items-center justify-between text-sm">
                      <div className="max-w-2xl">
                        <p className="font-bold text-zinc-900 leading-snug">{mat.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] font-mono bg-zinc-100 border border-zinc-150 text-zinc-500 px-1.5 py-0.2 rounded font-bold">
                            {sub ? sub.name : mat.subjectId.toUpperCase()} • Sem {mat.semester}
                          </span>
                          <span className="text-[10px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded uppercase font-bold">
                            {mat.category}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-400 truncate max-w-md" title={mat.driveLink}>
                            {mat.driveLink}
                          </span>
                        </div>
                      </div>
                      {confirmDeleteMatId === mat.id ? (
                        <div className="flex items-center space-x-1.5 bg-red-50 border border-red-150 p-1.5 rounded-xl shrink-0">
                          <span className="text-[10px] font-bold text-red-700">Delete?</span>
                          <button
                            id={`btn-confirm-del-mat-direct-${mat.id}`}
                            onClick={() => {
                              onDeleteMaterial(mat.id);
                              setConfirmDeleteMatId(null);
                            }}
                            className="text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            id={`btn-cancel-del-mat-direct-${mat.id}`}
                            onClick={() => setConfirmDeleteMatId(null)}
                            className="text-[10px] font-bold bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`btn-del-mat-direct-${mat.id}`}
                          onClick={() => setConfirmDeleteMatId(mat.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all shrink-0 cursor-pointer"
                          title="Delete Material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STUDENT REGISTRATIONS & WEB DEV SPREADSHEETS */}
        {activeTab === "registrations" && (
          <div className="p-6 space-y-6">
            <div className="border-b border-zinc-100 pb-4">
              <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Student Directory & Web Dev Spreadsheets
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Download CSV spreadsheets or export live directories directly to Google Sheets in your Google Drive.
              </p>
            </div>

            {/* Export Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: All Students Directory */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-2xs hover:border-zinc-300 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">All Student Directory</h4>
                      <p className="text-xs text-zinc-500">{registrations.length} total registered students</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleExportToGoogleSheets("all")}
                    disabled={sheetsLoading}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{sheetsLoading ? "Syncing..." : "Google Sheets"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSpreadsheet("all")}
                    className="inline-flex items-center space-x-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer border border-zinc-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Web Development Enthusiasts Spreadsheet (Extra Space / Card) */}
              <div className="bg-gradient-to-br from-indigo-900 to-violet-950 text-white rounded-2xl p-4 space-y-3 shadow-sm border border-indigo-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center font-bold border border-white/10">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Web Dev Enthusiasts</span>
                        <span className="bg-amber-400/20 text-amber-300 text-[10px] font-mono px-1.5 py-0.2 rounded border border-amber-300/30">
                          {registrations.filter((r: any) => r.interestedInWebDev === "Yes" || r.interestedInWebDev === true).length} Interested
                        </span>
                      </h4>
                      <p className="text-xs text-indigo-200/80">Students interested in web development</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1 relative z-10">
                  <button
                    type="button"
                    onClick={() => handleExportToGoogleSheets("webdev")}
                    disabled={sheetsLoading}
                    className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-amber-400 hover:bg-amber-300 disabled:bg-amber-200 text-indigo-950 font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{sheetsLoading ? "Syncing..." : "Web Dev Google Sheet"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSpreadsheet("webdev")}
                    className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition-all cursor-pointer border border-white/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Web Dev CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Google Sheets Live Link Notification */}
            {createdSheetUrl && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">Google Sheet Export Complete!</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">Your requested spreadsheet directory is live in Google Sheets.</p>
                  </div>
                </div>
                <a
                  href={createdSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shrink-0"
                >
                  <span>Open Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {sheetsError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl font-medium">
                {sheetsError}
              </div>
            )}

            {/* Directory Table Grid Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setRegFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    regFilter === "all"
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  All Students ({registrations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRegFilter("webdev")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                    regFilter === "webdev"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Web Dev Interested ({registrations.filter((r: any) => r.interestedInWebDev === "Yes" || r.interestedInWebDev === true).length})</span>
                </button>
              </div>
            </div>

            {regLoading ? (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-3 border-zinc-150 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-xs text-zinc-400 font-mono mt-3">Loading spreadsheet registry...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-zinc-150 rounded-2xl bg-zinc-50/50">
                <Users className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
                <p className="text-sm text-zinc-500 font-semibold">No student records found</p>
                <p className="text-xs text-zinc-400 mt-1">Registrations will populate automatically when students submit their details.</p>
              </div>
            ) : (
              <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
                {/* Spreadsheet-like Table Grid */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse bg-white text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-250 text-zinc-500 font-mono font-bold uppercase select-none">
                        <th className="py-3 px-4 border-r border-zinc-200 text-center w-12">Sl No</th>
                        <th className="py-3 px-4 border-r border-zinc-200">Student Name</th>
                        <th className="py-3 px-4 border-r border-zinc-200">Email Address</th>
                        <th className="py-3 px-4 border-r border-zinc-200">College / Institute</th>
                        <th className="py-3 px-4 border-r border-zinc-200">Branch / Dept</th>
                        <th className="py-3 px-4 border-r border-zinc-200 text-center w-20">Semester</th>
                        <th className="py-3 px-4 border-r border-zinc-200">Phone</th>
                        <th className="py-3 px-4 border-r border-zinc-200 text-center">Web Dev Interest</th>
                        <th className="py-3 px-4">Registration Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150 font-mono text-zinc-700">
                      {registrations
                        .filter((reg: any) => regFilter === "all" || reg.interestedInWebDev === "Yes" || reg.interestedInWebDev === true)
                        .map((reg: any, idx) => {
                          const accountName = reg.googleName || reg.name || "Student User";
                          const accountEmail = reg.googleEmail || reg.email || "";
                          const college = reg.collegeName || "Engineering College";
                          const phone = reg.phone || "N/A";
                          const isWebDev = reg.interestedInWebDev === "Yes" || reg.interestedInWebDev === true;

                          return (
                            <tr key={reg.id || idx} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="py-2.5 px-4 border-r border-zinc-200 text-center text-zinc-400 font-semibold">{idx + 1}</td>
                              <td className="py-2.5 px-4 border-r border-zinc-200 font-bold text-zinc-900 font-sans flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center text-[10px] shrink-0 font-bold border border-indigo-200">
                                  {accountName.charAt(0).toUpperCase()}
                                </span>
                                <span>{accountName}</span>
                              </td>
                              <td className="py-2.5 px-4 border-r border-zinc-200 text-indigo-600 hover:underline">
                                <a href={`mailto:${accountEmail}`}>{accountEmail}</a>
                              </td>
                              <td className="py-2.5 px-4 border-r border-zinc-200 font-sans font-medium text-zinc-800">{college}</td>
                              <td className="py-2.5 px-4 border-r border-zinc-200 font-bold text-zinc-600">{reg.department}</td>
                              <td className="py-2.5 px-4 border-r border-zinc-200 text-center">
                                <span className="bg-zinc-100 border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded-sm font-bold">
                                  Sem {reg.semester || 1}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 border-r border-zinc-200 font-mono text-zinc-600">{phone}</td>
                              <td className="py-2.5 px-4 border-r border-zinc-200 text-center font-sans">
                                {isWebDev ? (
                                  <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    <Sparkles className="w-3 h-3 text-indigo-600" />
                                    <span>Interested</span>
                                  </span>
                                ) : (
                                  <span className="text-zinc-400 text-[11px]">No</span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-zinc-500 text-[11px] font-sans">
                                {new Date(reg.registrationDate).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                <div className="bg-zinc-50 px-4 py-2.5 border-t border-zinc-200 text-[10px] text-zinc-400 font-mono text-right">
                  Sheet: {regFilter === "webdev" ? "Web Dev Interested Students" : "Google Student Directory"} • Displaying Rows: {
                    registrations.filter((reg: any) => regFilter === "all" || reg.interestedInWebDev === "Yes" || reg.interestedInWebDev === true).length
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
