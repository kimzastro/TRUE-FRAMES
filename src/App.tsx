import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, FolderGit2, ShieldAlert, Sparkles, AlertTriangle, KeyRound, Download, X, Smartphone, Chrome, Share2, Monitor, ArrowUpFromLine, RefreshCw } from "lucide-react";
import { Subject, Material, ViewState, ThemeMode } from "./types";
import { formatBytes, formatDate } from "./utils";
import Header from "./components/Header";
import Breadcrumb from "./components/Breadcrumb";
import SubjectGrid from "./components/SubjectGrid";
import SemesterGrid from "./components/SemesterGrid";
import CategoryGrid from "./components/CategoryGrid";
import MaterialList from "./components/MaterialList";
import AdminPanel from "./components/AdminPanel";
import IntroAnimation from "./components/IntroAnimation";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // Passcode autofocus ref
  const passcodeRef = useRef<HTMLInputElement>(null);

  // Intro splash screen state
  const [showIntro, setShowIntro] = useState(true);

  // Theme Mode State: "light" | "dark" | "system"
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme-mode") as ThemeMode | null;
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
    return "system";
  });

  // Apply Theme Mode changes to html tag
  useEffect(() => {
    localStorage.setItem("theme-mode", themeMode);

    const applyTheme = () => {
      let isDark = false;
      if (themeMode === "dark") {
        isDark = true;
      } else if (themeMode === "light") {
        isDark = false;
      } else {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeMode === "system") {
        applyTheme();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [themeMode]);

  // Database States
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // App routing/view state
  const [viewState, setViewState] = useState<ViewState>({ type: "home" });

  // Admin states
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Global search (home view)
  const [globalSearch, setGlobalSearch] = useState("");

  // Load admin token & initial academic data
  useEffect(() => {
    const savedToken = sessionStorage.getItem("admin-token");
    if (savedToken === "admin-session-token-2327") {
      setIsAdmin(true);
    }

    fetchData();
  }, []);

  // Automatically focus administrative passcode input when modal opens
  useEffect(() => {
    if (isLoginModalOpen) {
      const timer = setTimeout(() => {
        if (passcodeRef.current) {
          passcodeRef.current.focus();
          passcodeRef.current.select();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoginModalOpen]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let subsData: Subject[] = [];
      let matsData: Material[] = [];

      try {
        const [subsRes, matsRes] = await Promise.all([
          fetch("/api/subjects"),
          fetch("/api/materials"),
        ]);

        if (subsRes.ok) subsData = await subsRes.json();
        if (matsRes.ok) matsData = await matsRes.json();
      } catch (e) {
        console.warn("Server fetch issue, using local storage fallback:", e);
      }

      // Read custom saved items from local storage
      const localSubsRaw = localStorage.getItem("enginotes_custom_subjects");
      const localSubs: Subject[] = localSubsRaw ? JSON.parse(localSubsRaw) : [];

      const localMatsRaw = localStorage.getItem("enginotes_custom_materials");
      const localMats: Material[] = localMatsRaw ? JSON.parse(localMatsRaw) : [];

      // Merge subjects
      const mergedSubsMap = new Map<string, Subject>();
      subsData.forEach((s) => mergedSubsMap.set(s.id, s));
      localSubs.forEach((ls) => {
        if (!mergedSubsMap.has(ls.id)) {
          mergedSubsMap.set(ls.id, ls);
        }
      });
      const finalSubjects = Array.from(mergedSubsMap.values());

      // Merge materials
      const mergedMatsMap = new Map<string, Material>();
      // Put local materials first so user uploads stay on top
      localMats.forEach((lm) => mergedMatsMap.set(lm.id, lm));
      matsData.forEach((m) => mergedMatsMap.set(m.id, m));
      const finalMaterials = Array.from(mergedMatsMap.values());

      // Sync back to local storage
      localStorage.setItem("enginotes_custom_subjects", JSON.stringify(finalSubjects));
      localStorage.setItem("enginotes_custom_materials", JSON.stringify(finalMaterials));

      setSubjects(finalSubjects);
      setMaterials(finalMaterials);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unable to sync files. Please verify backend state.");
    } finally {
      setLoading(false);
    }
  };

  // Admin login trigger
  const handleAdminTrigger = () => {
    if (isAdmin) {
      setIsAdminPanelOpen(true);
    } else {
      setIsLoginModalOpen(true);
      setLoginError(null);
      setAdminPassword("");
    }
  };

  // Submit admin login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAdmin(true);
        sessionStorage.setItem("admin-token", data.token);
        setIsLoginModalOpen(false);
        setIsAdminPanelOpen(true);
      } else {
        setLoginError(data.error || "Incorrect credentials");
      }
    } catch (err) {
      setLoginError("Could not connect to authentication portal.");
    }
  };

  // Admin logout
  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("admin-token");
    setIsAdminPanelOpen(false);
  };

  // Download trigger (opens direct Google Drive link)
  const handleDownloadMaterial = async (id: string) => {
    const mat = materials.find((m) => m.id === id);
    if (mat && mat.driveLink) {
      window.open(mat.driveLink, "_blank", "noopener,noreferrer");
    }
  };

  // Admin add subject
  const handleAddSubject = async (name: string, description: string, icon?: string): Promise<boolean> => {
    try {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const newSub: Subject = { id, name, description, icon: icon || "cpu" };

      fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "admin-session-token-2327",
        },
        body: JSON.stringify({ name, description, icon }),
      }).catch((e) => console.warn(e));

      // Save to local storage
      const localSubsRaw = localStorage.getItem("enginotes_custom_subjects");
      const localSubs: Subject[] = localSubsRaw ? JSON.parse(localSubsRaw) : [];
      if (!localSubs.some((s) => s.id === id)) {
        localStorage.setItem("enginotes_custom_subjects", JSON.stringify([newSub, ...localSubs]));
      }

      await fetchData(); // refresh DB state
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Admin delete subject
  const handleDeleteSubject = async (id: string): Promise<boolean> => {
    try {
      fetch(`/api/subjects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "admin-session-token-2327",
        },
      }).catch((e) => console.warn(e));

      // Remove from local storage
      const localSubsRaw = localStorage.getItem("enginotes_custom_subjects");
      if (localSubsRaw) {
        const localSubs: Subject[] = JSON.parse(localSubsRaw);
        localStorage.setItem("enginotes_custom_subjects", JSON.stringify(localSubs.filter((s) => s.id !== id)));
      }

      await fetchData(); // refresh DB state
      // If we are currently looking at this subject, go back home
      setViewState((current) => {
        if (current.type !== "home" && current.subjectId === id) {
          return { type: "home" };
        }
        return current;
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Admin add material
  const handleAddMaterial = async (matData: {
    title: string;
    subjectId: string;
    semester: number;
    category: "pyqs" | "notes" | "short_notes";
    tags: string;
    driveLink: string;
  }): Promise<boolean> => {
    try {
      let createdMat: Material | null = null;

      try {
        const response = await fetch("/api/materials", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "admin-session-token-2327",
          },
          body: JSON.stringify(matData),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.material) {
            createdMat = data.material;
          }
        }
      } catch (e) {
        console.warn("POST /api/materials server request error:", e);
      }

      if (!createdMat) {
        let parsedTags: string[] = [];
        if (typeof matData.tags === "string") {
          parsedTags = matData.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
        }
        createdMat = {
          id: `mat_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          title: matData.title,
          subjectId: matData.subjectId,
          semester: matData.semester,
          category: matData.category,
          tags: parsedTags,
          driveLink: matData.driveLink,
          uploadDate: new Date().toISOString(),
        };
      }

      // Save to local storage as fallback/guaranteed persistence across refresh
      const localMatsRaw = localStorage.getItem("enginotes_custom_materials");
      const localMats: Material[] = localMatsRaw ? JSON.parse(localMatsRaw) : [];
      const updatedLocal = [createdMat, ...localMats.filter((m) => m.id !== createdMat!.id)];
      localStorage.setItem("enginotes_custom_materials", JSON.stringify(updatedLocal));

      await fetchData(); // Refresh materials
      return true;
    } catch (err) {
      console.error("Error adding material:", err);
      return false;
    }
  };

  // Admin delete material
  const handleDeleteMaterial = async (id: string): Promise<boolean> => {
    try {
      fetch(`/api/materials/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "admin-session-token-2327",
        },
      }).catch((e) => console.warn(e));

      // Remove from local storage
      const localMatsRaw = localStorage.getItem("enginotes_custom_materials");
      if (localMatsRaw) {
        const localMats: Material[] = JSON.parse(localMatsRaw);
        localStorage.setItem("enginotes_custom_materials", JSON.stringify(localMats.filter((m) => m.id !== id)));
      }

      await fetchData(); // Refresh materials list
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Global search logic (across all fields)
  const globalFilteredMaterials = useMemo(() => {
    if (!globalSearch.trim()) return [];
    const query = globalSearch.toLowerCase().trim();
    return materials.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        m.subjectId.toLowerCase().includes(query)
    );
  }, [materials, globalSearch]);

  const activeSubject = useMemo(() => {
    if (viewState.type === "home") return null;
    return subjects.find((s) => s.id === viewState.subjectId) || null;
  }, [subjects, viewState]);

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-indigo-100 transition-colors duration-200">
      {/* Intro Circle Expanding Animation */}
      {showIntro && (
        <IntroAnimation onComplete={() => setShowIntro(false)} />
      )}

      {/* Header */}
      <Header
        onAdminTrigger={handleAdminTrigger}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        themeMode={themeMode}
        onThemeChange={setThemeMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error/Offline state handler */}
        {error && (
          <div className="bg-red-50 border border-red-150 text-red-900 px-6 py-4 rounded-2xl mb-6 flex items-start space-x-3.5 shadow-2xs">
            <AlertTriangle className="w-6 h-6 shrink-0 text-red-500" />
            <div>
              <p className="font-bold">Sync Error</p>
              <p className="text-sm mt-0.5">{error}</p>
              <button
                onClick={fetchData}
                className="mt-3 text-xs bg-white hover:bg-zinc-50 border border-red-200 text-red-700 font-semibold px-3 py-1.5 rounded-lg transition-all"
              >
                Retry Database Connection
              </button>
            </div>
          </div>
        )}

        {/* Global Admin Panel Layout */}
        {isAdmin && isAdminPanelOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <AdminPanel
              subjects={subjects}
              materials={materials}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
              onAddMaterial={handleAddMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onClose={() => setIsAdminPanelOpen(false)}
            />
          </motion.div>
        )}

        {/* Loading placeholder */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-mono text-xs mt-4">Syncing file index from academic database...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Breadcrumbs for navigation */}
            <Breadcrumb
              viewState={viewState}
              subjects={subjects}
              onNavigate={setViewState}
            />

            {/* Render proper view in the hierarchic tree */}
            <AnimatePresence mode="wait">
              <motion.div
                key={viewState.type + (activeSubject?.id || "") + ("semester" in viewState ? viewState.semester : "") + ("category" in viewState ? viewState.category : "")}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
              >
                {/* VIEW 1: HOME */}
                {viewState.type === "home" && (
                  <div className="space-y-8">
                    {/* Global Document Search Bar */}
                    <div id="global-search-container" className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-5 shadow-xs transition-colors">
                      <label htmlFor="global-search-input" className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                        Global Vault Search (Across all subject files)
                      </label>
                      <div className="relative">
                        <input
                          id="global-search-input"
                          type="text"
                          placeholder="Search for exam codes, topics, lecture titles, or specific #tags globally..."
                          value={globalSearch}
                          onChange={(e) => setGlobalSearch(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100/50 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 rounded-xl py-3.5 pl-11 pr-10 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                        />
                        <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 absolute left-4 top-4" />
                        {globalSearch && (
                          <button
                            onClick={() => setGlobalSearch("")}
                            className="absolute right-3.5 top-3.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-full p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Display global results if searching */}
                      {globalSearch.trim() && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-xs font-bold font-mono text-zinc-500 dark:text-zinc-400 uppercase">
                              Search matched {globalFilteredMaterials.length} materials
                            </span>
                            <button
                              onClick={() => setGlobalSearch("")}
                              className="text-xs font-mono text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              Clear Search
                            </button>
                          </div>

                          {globalFilteredMaterials.length === 0 ? (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 italic mt-3 text-center py-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">No files match your query.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                              {globalFilteredMaterials.map((mat) => {
                                const sub = subjects.find((s) => s.id === mat.subjectId);
                                return (
                                  <div
                                    key={mat.id}
                                    className="border border-zinc-150 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-800 bg-white dark:bg-zinc-900 p-3.5 rounded-xl flex flex-col justify-between hover:shadow-2xs transition-all group"
                                  >
                                    <div>
                                      <div className="flex justify-between items-start gap-1 mb-1">
                                        <span className="text-[9px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 px-1 py-0.2 rounded uppercase">
                                          {sub ? sub.name : mat.subjectId.toUpperCase()} • Sem {mat.semester}
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 shrink-0">
                                          {formatBytes(mat.fileSize)}
                                        </span>
                                      </div>
                                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-900 dark:group-hover:text-indigo-300 text-xs md:text-sm line-clamp-1 transition-colors">
                                        {mat.title}
                                      </h4>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-zinc-50 dark:border-zinc-800/80 flex justify-between items-center text-[10px] font-mono">
                                      <span className="text-zinc-400 dark:text-zinc-400 capitalize bg-indigo-50/50 dark:bg-indigo-950/50 px-1.5 py-0.5 border border-indigo-100/50 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-sm">
                                        {mat.category === "short_notes" ? "Short Notes" : mat.category.toUpperCase()}
                                      </span>
                                      <button
                                        id={`btn-global-dl-${mat.id}`}
                                        onClick={() => handleDownloadMaterial(mat.id)}
                                        className="inline-flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold cursor-pointer"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>


                    {/* Subjects Catalog */}
                    <SubjectGrid
                      subjects={subjects}
                      materials={materials}
                      onNavigate={setViewState}
                      isAdmin={isAdmin}
                      onDeleteSubject={handleDeleteSubject}
                    />
                  </div>
                )}

                {/* VIEW 2: SUBJECT */}
                {viewState.type === "subject" && activeSubject && (
                  <SemesterGrid
                    subject={activeSubject}
                    materials={materials}
                    onNavigate={setViewState}
                    onDownload={handleDownloadMaterial}
                  />
                )}

                {/* VIEW 3: SEMESTER */}
                {viewState.type === "semester" && activeSubject && (
                  <CategoryGrid
                    subject={activeSubject}
                    semester={viewState.semester}
                    materials={materials}
                    onNavigate={setViewState}
                  />
                )}

                {/* VIEW 4: CATEGORY / MATERIALS */}
                {viewState.type === "category" && activeSubject && (
                  <MaterialList
                    subject={activeSubject}
                    semester={viewState.semester}
                    category={viewState.category}
                    materials={materials}
                    onNavigate={setViewState}
                    onDownload={handleDownloadMaterial}
                    isAdmin={isAdmin}
                    onDeleteMaterial={handleDeleteMaterial}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Website Footer */}
      <footer className="border-t border-zinc-200 bg-white py-8 mt-12 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-zinc-800 font-display">ENGINOTES ACADEMIC PORTAL</span>
          </div>
          <p>© {new Date().getFullYear()} EngiNotes. All Rights Reserved. Designed for Engineering Students.</p>
        </div>
      </footer>

      {/* Admin Passcode Entry Modal */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 max-w-sm w-full"
            >
              <div className="text-center">
                <div className="mx-auto w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-zinc-900">Admin Authentication</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Only the site administrator can access file upload controls and database managers.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="admin-passcode-input" className="block text-xs font-bold font-mono uppercase tracking-wider text-zinc-500 mb-1.5 text-center">
                    Enter Administrative Passcode
                  </label>
                  <input
                    id="admin-passcode-input"
                    ref={passcodeRef}
                    autoFocus
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value.replace(/\D/g, ""))}
                    className="w-32 mx-auto text-center block text-2xl tracking-widest font-mono bg-zinc-50 border border-zinc-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 rounded-xl py-2 outline-none transition-all"
                  />
                </div>

                {loginError && (
                  <p className="text-xs text-red-600 text-center font-semibold font-mono bg-red-50 border border-red-100 py-1.5 px-3 rounded-lg">
                    {loginError}
                  </p>
                )}

                <div className="flex space-x-3 pt-2">
                  <button
                    id="btn-cancel-login"
                    type="button"
                    onClick={() => setIsLoginModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-confirm-login"
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-2xs cursor-pointer"
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-150 py-8 mt-12 text-center text-xs text-zinc-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p>© 2026 ENGINOTES Portal. Open access academic resource hub.</p>
          <div className="flex items-center justify-center space-x-2">
            <button
              id="btn-replay-intro"
              onClick={() => setShowIntro(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-600 rounded-full text-[11px] font-sans font-semibold transition-all cursor-pointer shadow-2xs hover:text-indigo-600 hover:border-indigo-200"
            >
              <RefreshCw className="w-3 h-3 text-indigo-500" />
              <span>Replay Intro Animation</span>
            </button>
          </div>
          <p className="text-[10px] text-zinc-300">Compiled & served with containerised Vite + Express technology</p>
        </div>
      </footer>
    </div>
  );
}
