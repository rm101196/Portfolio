import { useState, useEffect, useRef } from "react";
import { Reorder, useDragControls } from "motion/react";
import { GripVertical, Trash2, LayoutTemplate, Type, Paperclip, Save } from "lucide-react";
import { ThemeProvider } from "./components/ThemeProvider";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Stats } from "./components/Stats";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { Contact } from "./components/Contact";
import { CustomSection } from "./components/CustomSection";
import { ScrollToTop } from "./components/ScrollToTop";
import { LoadingScreen } from "./components/LoadingScreen";
import { AddSectionPanel } from "./components/AddSectionPanel";
import { TypographyPanel } from "./components/TypographyPanel";
import { GlobalStyleProvider } from "./components/GlobalStyleProvider";
import { MediaStrip } from "./components/MediaStrip";
import { MediaPreviewModal } from "./components/MediaPreviewModal";
import { useSectionOrder, type SectionDef } from "./hooks/useSectionOrder";
import { useTypographySettings, DEFAULTS as TYPO_DEFAULTS } from "./hooks/useTypographySettings";
import { useSectionMedia, type MediaItem } from "./hooks/useSectionMedia";
import { usePortfolioDataRoot, PortfolioDataProvider } from "./hooks/usePortfolioData";

// ── section renderer ──────────────────────────────────────────────────────────
function renderSection(section: SectionDef, isEditing: boolean) {
  switch (section.type) {
    case "hero":     return <Hero isEditing={isEditing} />;
    case "about":    return <About isEditing={isEditing} />;
    case "stats":    return <Stats isEditing={isEditing} />;
    case "projects": return <Projects isEditing={isEditing} />;
    case "skills":   return <Skills isEditing={isEditing} />;
    case "contact":  return <Contact isEditing={isEditing} />;
    case "custom":
      return (
        <CustomSection
          sectionId={section.id}
          template={section.customTemplate!}
          label={section.label}
          isEditing={isEditing}
        />
      );
    default: return null;
  }
}

// ── per-section wrapper with drag + media ─────────────────────────────────────
function SectionWrapper({
  section,
  isEditing,
  onRemove,
  children,
}: {
  section: SectionDef;
  isEditing: boolean;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const controls = useDragControls();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const { items: mediaItems, addMedia, removeMedia } = useSectionMedia(section.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addMedia(file);
    e.target.value = "";
  };

  const inner = (
    <div className="relative">
      {/* Edit mode control bar */}
      {isEditing && (
        <div className="flex items-center justify-between px-4 md:px-8 py-2 bg-blue-600 text-white sticky top-16 z-30">
          {/* Drag handle */}
          <div
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing select-none"
            onPointerDown={(e) => controls.start(e)}
          >
            <GripVertical className="w-5 h-5 opacity-70" />
            <span className="text-sm font-semibold">{section.label}</span>
            <span className="hidden sm:inline text-xs opacity-60 ml-1">— drag to reorder</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Attach media */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
              title="Attach image or PDF"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Attach</span>
            </button>

            {/* Remove section */}
            <button
              onClick={onRemove}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-red-500 rounded-lg text-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Section content */}
      {children}

      {/* Media strip (edit + view mode) */}
      <MediaStrip
        items={mediaItems}
        isEditing={isEditing}
        onRemove={removeMedia}
        onPreview={setPreviewItem}
      />

      {/* Full-screen preview modal */}
      <MediaPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );

  // In edit mode wrap in Reorder.Item for drag support
  if (isEditing) {
    return (
      <Reorder.Item value={section} as="div" id={section.id} dragListener={false} dragControls={controls}>
        {inner}
      </Reorder.Item>
    );
  }

  return <div id={section.id}>{inner}</div>;
}

// ── app ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionPanelOpen, setSectionPanelOpen] = useState(false);
  const [typoPanelOpen, setTypoPanelOpen] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const portfolioData = usePortfolioDataRoot();
  const { sections, save: saveSections, addSection, removeSection } = useSectionOrder();
  const { settings: typo, update: updateTypo, save: saveTypo } = useTypographySettings();

  useEffect(() => {
    const authStatus = localStorage.getItem("portfolio_authenticated");
    if (authStatus === "true") setIsAuthenticated(true);
  }, []);

  // Hydrate localStorage from Supabase data, then reload once to re-initialize hooks
  useEffect(() => {
    if (!portfolioData.isLoading && Object.keys(portfolioData.store).length > 0) {
      // Check if we've already hydrated this session
      const hydrated = sessionStorage.getItem("portfolio_hydrated");
      if (hydrated) {
        setIsLoading(false);
        return;
      }

      // Clear ALL stale portfolio data from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("portfolio_") && key !== "portfolio_authenticated") {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));

      // Hydrate localStorage with fresh Supabase data
      for (const [key, value] of Object.entries(portfolioData.store)) {
        localStorage.setItem(key, value);
      }

      // Mark as hydrated and reload so hooks re-initialize with fresh data
      sessionStorage.setItem("portfolio_hydrated", "1");
      window.location.reload();
    } else if (!portfolioData.isLoading) {
      // No cloud data — show page with defaults
      setIsLoading(false);
    }
  }, [portfolioData.isLoading, portfolioData.store]);

  const handleLogin = (_email: string, _password: string) => {
    setIsAuthenticated(true);
    localStorage.setItem("portfolio_authenticated", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsEditing(false);
    localStorage.removeItem("portfolio_authenticated");
  };

  /** Unified save: gather localStorage data and push to Supabase */
  const handleSave = async () => {
    // Sync current localStorage into the Supabase store
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("portfolio_")) continue;
      // Skip binary/auth keys
      if (key === "portfolio_authenticated" || key === "portfolio_profile_photo" ||
          key === "portfolio_resume" || key.startsWith("portfolio_media_") ||
          key === "portfolio_github_token" || key === "portfolio_last_cloud_save") continue;
      portfolioData.set(key, localStorage.getItem(key) || "");
    }
    const ok = await portfolioData.save();
    if (ok) {
      setSaveMsg("✓ Saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    }
  };

  return (
    <PortfolioDataProvider value={portfolioData}>
    <ThemeProvider>
      {isLoading && <LoadingScreen />}
      <GlobalStyleProvider settings={typo} />

      <div id="portfolio-root" className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
        <Header
          isEditing={isEditing}
          isAuthenticated={isAuthenticated}
          onToggleEdit={() => {
            if (isEditing) {
              // Exiting edit mode — auto-save to Supabase
              handleSave();
            }
            setIsEditing((v) => !v);
          }}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />

        {/* Sections — drag-reorderable in edit mode */}
        {isEditing ? (
          <Reorder.Group axis="y" values={sections} onReorder={saveSections} as="main" className="pt-16 pb-24">
            {sections.map((section) => (
              <SectionWrapper
                key={section.id}
                section={section}
                isEditing={isEditing}
                onRemove={() => removeSection(section.id)}
              >
                {renderSection(section, isEditing)}
              </SectionWrapper>
            ))}
          </Reorder.Group>
        ) : (
          <main className="pt-16">
            {sections.map((section) => (
              <SectionWrapper
                key={section.id}
                section={section}
                isEditing={isEditing}
                onRemove={() => removeSection(section.id)}
              >
                {renderSection(section, isEditing)}
              </SectionWrapper>
            ))}
          </main>
        )}

        {/* Edit mode floating toolbar */}
        {isEditing && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-40 flex-wrap justify-center px-4">
            <button
              onClick={() => setSectionPanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl transition-colors text-sm"
            >
              <LayoutTemplate className="w-4 h-4" />
              Manage Sections
            </button>
            <button
              onClick={() => setTypoPanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-xl transition-colors text-sm"
            >
              <Type className="w-4 h-4" />
              Text & Style
            </button>
            <button
              onClick={handleSave}
              disabled={portfolioData.isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-full shadow-xl transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              {portfolioData.isSaving ? "Saving…" : "Save"}
            </button>
            {saveMsg && (
              <div className="px-3 py-2 bg-green-700 text-white text-xs rounded-full shadow-xl">
                {saveMsg}
              </div>
            )}
            {portfolioData.error && (
              <div className="px-3 py-2 bg-red-600 text-white text-xs rounded-full shadow-xl max-w-[200px] truncate">
                {portfolioData.error}
              </div>
            )}
          </div>
        )}

        <AddSectionPanel
          isOpen={sectionPanelOpen}
          onClose={() => setSectionPanelOpen(false)}
          currentSections={sections}
          onAdd={addSection}
          onRemove={removeSection}
        />

        <TypographyPanel
          isOpen={typoPanelOpen}
          onClose={() => setTypoPanelOpen(false)}
          settings={typo}
          onUpdate={updateTypo}
          onReset={() => saveTypo(TYPO_DEFAULTS)}
        />

        <ScrollToTop />
      </div>
    </ThemeProvider>
    </PortfolioDataProvider>
  );
}
