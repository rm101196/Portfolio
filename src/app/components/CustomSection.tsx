import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, ExternalLink, Paperclip, Eye, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { CustomTemplate } from "../hooks/useSectionOrder";

interface CustomSectionProps {
  sectionId: string;
  template: CustomTemplate;
  label: string;
  isEditing: boolean;
}

// ── data shapes ──────────────────────────────────────────────────────────────

interface TextData {
  title: string;
  paragraphs: string[];
}

interface HighlightsData {
  title: string;
  subtitle: string;
  items: string[];
}

interface TimelineEntry {
  id: string;
  period: string;
  role: string;
  company: string;
  description: string;
}

interface TimelineData {
  title: string;
  entries: TimelineEntry[];
}

interface QuoteEntry {
  id: string;
  quote: string;
  author: string;
  role: string;
  /** Per-entry file attachment stored as base64 data URL */
  attachment?: {
    filename: string;
    mimeType: string;
    dataUrl: string;
    type: "image" | "pdf";
  } | null;
}

interface QuoteData {
  title: string;
  entries: QuoteEntry[];
}

interface CtaData {
  headline: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

type SectionData = TextData | HighlightsData | TimelineData | QuoteData | CtaData;

const DEFAULTS: Record<CustomTemplate, SectionData> = {
  text: { title: "Section Title", paragraphs: ["Write your content here."] } as TextData,
  highlights: { title: "Key Highlights", subtitle: "What sets me apart", items: ["First highlight", "Second highlight", "Third highlight"] } as HighlightsData,
  timeline: { title: "Experience", entries: [{ id: "e1", period: "2022 – Present", role: "Senior Product Manager", company: "Company Name", description: "Describe your responsibilities and achievements here." }] } as TimelineData,
  quote: { title: "Testimonials for Leaders and peers", entries: [{ id: "q1", quote: "Write your testimonial or featured quote here.", author: "Author Name", role: "Title, Company", attachment: null }] } as QuoteData,
  cta: { headline: "Let's Work Together", description: "Open to new opportunities and collaborations.", buttonText: "Get In Touch", buttonUrl: "mailto:rishabh.mishra.ba@gmail.com" } as CtaData,
};

// ── helpers ───────────────────────────────────────────────────────────────────

function useCustomData<T extends SectionData>(sectionId: string, template: CustomTemplate): [T, (d: T) => void] {
  const key = `portfolio_custom_${sectionId}`;
  const [data, setData] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : (DEFAULTS[template] as T);
    } catch {
      return DEFAULTS[template] as T;
    }
  });

  const save = (newData: T) => {
    setData(newData);
    localStorage.setItem(key, JSON.stringify(newData));
  };

  return [data, save];
}

// ── input helpers ─────────────────────────────────────────────────────────────

function EditInput({ value, onChange, placeholder, className = "" }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 focus:outline-none text-neutral-900 dark:text-neutral-100 ${className}`}
    />
  );
}

function EditTextarea({ value, onChange, placeholder, rows = 3, className = "" }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; className?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 focus:outline-none resize-none text-neutral-900 dark:text-neutral-100 ${className}`}
    />
  );
}

// ── template: Text ─────────────────────────────────────────────────────────────

function TextTemplate({ sectionId, isEditing }: { sectionId: string; isEditing: boolean }) {
  const [data, save] = useCustomData<TextData>(sectionId, "text");

  const addParagraph = () => save({ ...data, paragraphs: [...data.paragraphs, ""] });
  const removeParagraph = (i: number) => save({ ...data, paragraphs: data.paragraphs.filter((_, idx) => idx !== i) });
  const updateParagraph = (i: number, v: string) => {
    const ps = [...data.paragraphs];
    ps[i] = v;
    save({ ...data, paragraphs: ps });
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {isEditing ? (
          <EditInput value={data.title} onChange={(v) => save({ ...data, title: v })} placeholder="Section title" className="text-4xl font-bold mb-8" />
        ) : (
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">{data.title}</h2>
        )}
        <div className="space-y-6">
          {data.paragraphs.map((p, i) => (
            <div key={i} className="relative">
              {isEditing ? (
                <div className="flex gap-2">
                  <EditTextarea value={p} onChange={(v) => updateParagraph(i, v)} placeholder="Paragraph content…" rows={3} className="flex-1 text-lg" />
                  <button onClick={() => removeParagraph(i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded self-start mt-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-lg text-neutral-700 dark:text-neutral-300">{p}</p>
              )}
            </div>
          ))}
          {isEditing && (
            <button onClick={addParagraph} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm">
              <Plus className="w-4 h-4" /> Add paragraph
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ── template: Highlights ───────────────────────────────────────────────────────

function HighlightsTemplate({ sectionId, isEditing }: { sectionId: string; isEditing: boolean }) {
  const [data, save] = useCustomData<HighlightsData>(sectionId, "highlights");
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    const t = newItem.trim();
    if (!t) return;
    save({ ...data, items: [...data.items, t] });
    setNewItem("");
  };
  const removeItem = (i: number) => save({ ...data, items: data.items.filter((_, idx) => idx !== i) });
  const updateItem = (i: number, v: string) => {
    const items = [...data.items];
    items[i] = v;
    save({ ...data, items });
  };

  return (
    <section className="py-20 px-6 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-center mb-12">
          {isEditing ? (
            <>
              <EditInput value={data.title} onChange={(v) => save({ ...data, title: v })} placeholder="Section title" className="text-4xl font-bold mb-4 text-center" />
              <EditInput value={data.subtitle} onChange={(v) => save({ ...data, subtitle: v })} placeholder="Subtitle" className="text-xl text-neutral-600 dark:text-neutral-400" />
            </>
          ) : (
            <>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">{data.title}</h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400">{data.subtitle}</p>
            </>
          )}
        </motion.div>
        <div className="grid md:grid-cols-2 gap-4">
          {data.items.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} viewport={{ once: true }}
              className="flex items-start gap-3 p-4 bg-white dark:bg-neutral-800 rounded-xl shadow">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
              {isEditing ? (
                <div className="flex-1 flex gap-2">
                  <EditInput value={item} onChange={(v) => updateItem(i, v)} placeholder="Highlight item" className="flex-1 text-base" />
                  <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <p className="text-neutral-700 dark:text-neutral-300">{item}</p>
              )}
            </motion.div>
          ))}
        </div>
        {isEditing && (
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
              placeholder="New highlight item…"
              className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-800 focus:outline-none focus:border-blue-500"
            />
            <button onClick={addItem} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ── template: Timeline ─────────────────────────────────────────────────────────

function TimelineTemplate({ sectionId, isEditing }: { sectionId: string; isEditing: boolean }) {
  const [data, save] = useCustomData<TimelineData>(sectionId, "timeline");

  const addEntry = () => save({
    ...data,
    entries: [...data.entries, { id: `e_${Date.now()}`, period: "", role: "", company: "", description: "" }],
  });
  const removeEntry = (id: string) => save({ ...data, entries: data.entries.filter((e) => e.id !== id) });
  const updateEntry = (id: string, patch: Partial<TimelineEntry>) =>
    save({ ...data, entries: data.entries.map((e) => e.id === id ? { ...e, ...patch } : e) });

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          {isEditing ? (
            <EditInput value={data.title} onChange={(v) => save({ ...data, title: v })} placeholder="Section title" className="text-4xl font-bold text-center" />
          ) : (
            <h2 className="text-4xl md:text-5xl font-bold">{data.title}</h2>
          )}
        </div>
        <div className="relative">
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
          <div className="space-y-10">
            {data.entries.map((entry, i) => (
              <motion.div key={entry.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="relative pl-12 md:pl-20">
                <div className="absolute left-2.5 md:left-6 top-2 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-neutral-950" />
                {isEditing ? (
                  <div className="p-5 bg-white dark:bg-neutral-800 rounded-xl shadow space-y-3 relative">
                    <button onClick={() => removeEntry(entry.id)} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <EditInput value={entry.period} onChange={(v) => updateEntry(entry.id, { period: v })} placeholder="Period (e.g. 2022 – Present)" className="text-sm text-blue-600" />
                    <EditInput value={entry.role} onChange={(v) => updateEntry(entry.id, { role: v })} placeholder="Role / Title" className="font-bold text-lg" />
                    <EditInput value={entry.company} onChange={(v) => updateEntry(entry.id, { company: v })} placeholder="Company / Organisation" className="text-neutral-500" />
                    <EditTextarea value={entry.description} onChange={(v) => updateEntry(entry.id, { description: v })} placeholder="Describe responsibilities and achievements…" rows={3} />
                  </div>
                ) : (
                  <div className="p-5 bg-white dark:bg-neutral-800 rounded-xl shadow">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">{entry.period}</p>
                    <h3 className="text-xl font-bold mb-0.5">{entry.role}</h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-3">{entry.company}</p>
                    <p className="text-neutral-700 dark:text-neutral-300">{entry.description}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        {isEditing && (
          <button onClick={addEntry} className="mt-8 w-full py-3 border-2 border-dashed border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Plus className="w-5 h-5" /> Add Entry
          </button>
        )}
      </div>
    </section>
  );
}

// ── template: Quote (multi-entry with per-item attachments) ────────────────────

function QuoteTemplate({ sectionId, isEditing }: { sectionId: string; isEditing: boolean }) {
  const [data, save] = useCustomData<QuoteData>(sectionId, "quote");
  const [previewItem, setPreviewItem] = useState<QuoteEntry["attachment"] | null>(null);

  // Migrate legacy single-quote data to multi-entry format
  useEffect(() => {
    const raw = data as any;
    if (raw.quote && !raw.entries) {
      const migrated: QuoteData = {
        title: "Testimonials",
        entries: [{ id: "q_migrated", quote: raw.quote, author: raw.author || "", role: raw.role || "", attachment: null }],
      };
      save(migrated);
    }
  }, []);

  const addEntry = () =>
    save({
      ...data,
      entries: [...data.entries, { id: `q_${Date.now()}`, quote: "", author: "", role: "", attachment: null }],
    });

  const removeEntry = (id: string) =>
    save({ ...data, entries: data.entries.filter((e) => e.id !== id) });

  const updateEntry = (id: string, patch: Partial<QuoteEntry>) =>
    save({ ...data, entries: data.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) });

  /** Handle file upload for a specific testimonial entry */
  const handleFileUpload = (entryId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const attachment: QuoteEntry["attachment"] = {
        filename: file.name,
        mimeType: file.type,
        dataUrl: reader.result as string,
        type: file.type === "application/pdf" ? "pdf" : "image",
      };
      updateEntry(entryId, { attachment });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = (entryId: string) => updateEntry(entryId, { attachment: null });

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-4xl mx-auto">
        {/* Section title */}
        <div className="text-center mb-12">
          <div className="text-7xl text-blue-600/30 dark:text-blue-400/30 font-serif leading-none mb-4">"</div>
          {isEditing ? (
            <EditInput
              value={data.title || ""}
              onChange={(v) => save({ ...data, title: v })}
              placeholder="Section title (e.g. Testimonials)"
              className="text-3xl font-bold text-center"
            />
          ) : (
            <h2 className="text-3xl md:text-4xl font-bold">{data.title}</h2>
          )}
        </div>

        {/* Testimonial entries */}
        <div className="space-y-8">
          {data.entries.map((entry, i) => (
            <QuoteEntryCard
              key={entry.id}
              entry={entry}
              index={i}
              isEditing={isEditing}
              onUpdate={(patch) => updateEntry(entry.id, patch)}
              onRemove={() => removeEntry(entry.id)}
              onFileUpload={(file) => handleFileUpload(entry.id, file)}
              onRemoveAttachment={() => removeAttachment(entry.id)}
              onPreviewAttachment={() => setPreviewItem(entry.attachment)}
            />
          ))}
        </div>

        {/* Add new testimonial — edit mode only */}
        {isEditing && (
          <button
            onClick={addEntry}
            className="mt-8 w-full py-3 border-2 border-dashed border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Testimonial
          </button>
        )}
      </div>

      {/* Full-screen attachment preview modal */}
      <AttachmentPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
    </section>
  );
}

/** Individual testimonial card with inline file attachment support */
function QuoteEntryCard({
  entry,
  index,
  isEditing,
  onUpdate,
  onRemove,
  onFileUpload,
  onRemoveAttachment,
  onPreviewAttachment,
}: {
  entry: QuoteEntry;
  index: number;
  isEditing: boolean;
  onUpdate: (patch: Partial<QuoteEntry>) => void;
  onRemove: () => void;
  onFileUpload: (file: File) => void;
  onRemoveAttachment: () => void;
  onPreviewAttachment: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileUpload(file);
    e.target.value = "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-lg"
    >
      {/* Remove button — edit mode */}
      {isEditing && (
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
          aria-label="Remove testimonial"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Quote content */}
      {isEditing ? (
        <div className="space-y-3">
          <EditTextarea
            value={entry.quote}
            onChange={(v) => onUpdate({ quote: v })}
            placeholder="Write the testimonial or quote…"
            rows={3}
            className="text-xl italic"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <EditInput value={entry.author} onChange={(v) => onUpdate({ author: v })} placeholder="Author name" className="font-bold" />
            <EditInput value={entry.role} onChange={(v) => onUpdate({ role: v })} placeholder="Role, Company" className="text-neutral-500" />
          </div>
        </div>
      ) : (
        <>
          <blockquote className="text-xl md:text-2xl italic text-neutral-800 dark:text-neutral-200 mb-6 leading-relaxed">
            "{entry.quote}"
          </blockquote>
          <div>
            <p className="font-bold text-lg">{entry.author}</p>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">{entry.role}</p>
          </div>
        </>
      )}

      {/* Per-entry file attachment area */}
      <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-700">
        {entry.attachment ? (
          /* Attachment thumbnail with preview/remove */
          <div className="flex items-center gap-4">
            <div
              className="relative group w-24 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 cursor-pointer flex items-center justify-center"
              onClick={onPreviewAttachment}
            >
              {entry.attachment.type === "image" ? (
                <img src={entry.attachment.dataUrl} alt={entry.attachment.filename} className="w-full h-full object-cover" />
              ) : (
                <FileText className="w-6 h-6 text-red-500" />
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-700 dark:text-neutral-300 truncate">{entry.attachment.filename}</p>
              <p className="text-xs text-neutral-400">{entry.attachment.type === "pdf" ? "PDF Document" : "Image"}</p>
            </div>
            {isEditing && (
              <button
                onClick={onRemoveAttachment}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                aria-label="Remove attachment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : isEditing ? (
          /* Upload button — shown only in edit mode when no attachment exists */
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Paperclip className="w-4 h-4" />
            Attach file (image or PDF)
          </button>
        ) : null}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </motion.div>
  );
}

/** Lightweight modal for previewing per-entry attachments */
function AttachmentPreviewModal({
  item,
  onClose,
}: {
  item: QuoteEntry["attachment"] | null;
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-4xl w-full max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          {item.type === "image" ? (
            <img src={item.dataUrl} alt={item.filename} className="w-full h-full max-h-[85vh] object-contain" />
          ) : (
            <iframe src={item.dataUrl} title={item.filename} className="w-full h-[85vh]" />
          )}

          {/* Filename footer */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-black/60 text-white text-sm text-center">
            {item.filename}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── template: CTA ──────────────────────────────────────────────────────────────

function CtaTemplate({ sectionId, isEditing }: { sectionId: string; isEditing: boolean }) {
  const [data, save] = useCustomData<CtaData>(sectionId, "cta");

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="p-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl text-white shadow-2xl">
          {isEditing ? (
            <div className="space-y-4">
              <EditInput value={data.headline} onChange={(v) => save({ ...data, headline: v })} placeholder="Headline" className="text-3xl font-bold text-center bg-white/10 border-white/40 text-white placeholder:text-white/60" />
              <EditTextarea value={data.description} onChange={(v) => save({ ...data, description: v })} placeholder="Description" rows={2} className="text-lg text-center bg-white/10 border-white/40 text-white placeholder:text-white/60" />
              <div className="flex gap-3 pt-2">
                <EditInput value={data.buttonText} onChange={(v) => save({ ...data, buttonText: v })} placeholder="Button text" className="flex-1 bg-white/10 border-white/40 text-white placeholder:text-white/60" />
                <EditInput value={data.buttonUrl} onChange={(v) => save({ ...data, buttonUrl: v })} placeholder="Button URL or mailto:" className="flex-1 bg-white/10 border-white/40 text-white placeholder:text-white/60" />
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{data.headline}</h2>
              <p className="text-lg text-white/80 mb-8">{data.description}</p>
              {data.buttonText && (
                <a
                  href={data.buttonUrl || "#"}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
                  target={data.buttonUrl?.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  {data.buttonText}
                  {data.buttonUrl?.startsWith("http") && <ExternalLink className="w-4 h-4" />}
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ── main export ───────────────────────────────────────────────────────────────

export function CustomSection({ sectionId, template, label, isEditing }: CustomSectionProps) {
  return (
    <div id={sectionId}>
      {(() => {
        switch (template) {
          case "text":       return <TextTemplate sectionId={sectionId} isEditing={isEditing} />;
          case "highlights": return <HighlightsTemplate sectionId={sectionId} isEditing={isEditing} />;
          case "timeline":   return <TimelineTemplate sectionId={sectionId} isEditing={isEditing} />;
          case "quote":      return <QuoteTemplate sectionId={sectionId} isEditing={isEditing} />;
          case "cta":        return <CtaTemplate sectionId={sectionId} isEditing={isEditing} />;
          default:           return null;
        }
      })()}
    </div>
  );
}
