import { useState, useEffect, useRef } from "react";
import { Reorder, useDragControls } from "motion/react";
import { GripVertical, Trash2, LayoutTemplate, Type, Paperclip, Cloud } from "lucide-react";
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
import { useCloudStorage } from "./hooks/useCloudStorage";

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
  const [cloudMsg, setCloudMsg] = useState("");

  const { sections, save: saveSections, addSection, removeSection } = useSectionOrder();
  const { settings: typo, update: updateTypo, save: saveTypo } = useTypographySettings();
  const cloud = useCloudStorage();

  useEffect(() => {
    const authStatus = localStorage.getItem("portfolio_authenticated");
    if (authStatus === "true") setIsAuthenticated(true);
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  /** Load cloud content on first page load (non-blocking) */
  useEffect(() => {
    // Only load from cloud once per page session
    const alreadyLoaded = sessionStorage.getItem("portfolio_cloud_loaded");
    if (alreadyLoaded) return;
    sessionStorage.setItem("portfolio_cloud_loaded", "1");

    cloud.loadFromCloud().then((loaded) => {
      if (loaded) {
        // Data was fetched and applied to localStorage — reload so React hooks pick it up
        window.location.reload();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (_email: string, _password: string) => {
    setIsAuthenticated(true);
    localStorage.setItem("portfolio_authenticated", "true");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsEditing(false);
    localStorage.removeItem("portfolio_authenticated");
  };

  /** Handle "Save to Cloud" click — no token needed with Supabase */
  const handleCloudSave = async () => {
    const ok = await cloud.saveToCloud();
    if (ok) {
      setCloudMsg("✓ Saved to cloud!");
      setTimeout(() => setCloudMsg(""), 3000);
    }
  };

  return (
    <ThemeProvider>
      {isLoading && <LoadingScreen />}
      <GlobalStyleProvider settings={typo} />

      <div id="portfolio-root" className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
        <Header
          isEditing={isEditing}
          isAuthenticated={isAuthenticated}
          onToggleEdit={() => setIsEditing((v) => !v)}
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
              onClick={handleCloudSave}
              disabled={cloud.isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-full shadow-xl transition-colors text-sm"
            >
              <Cloud className="w-4 h-4" />
              {cloud.isSaving ? "Saving…" : "Save to Cloud"}
            </button>
            {cloudMsg && (
              <div className="px-3 py-2 bg-green-700 text-white text-xs rounded-full shadow-xl">
                {cloudMsg}
              </div>
            )}
            {cloud.error && (
              <div className="px-3 py-2 bg-red-600 text-white text-xs rounded-full shadow-xl max-w-[200px] truncate">
                {cloud.error}
              </div>
            )}
          </div>
        )}

        {/* Cloud status messages */}

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
  );
}
