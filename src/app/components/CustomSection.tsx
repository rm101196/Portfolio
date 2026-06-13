import { useState, useEffect } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
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

interface QuoteData {
  quote: string;
  author: string;
  role: string;
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
  quote: { quote: "Write your testimonial or featured quote here.", author: "Author Name", role: "Title, Company" } as QuoteData,
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

// ── template: Quote ────────────────────────────────────────────────────────────

function QuoteTemplate({ sectionId, isEditing }: { sectionId: string; isEditing: boolean }) {
  const [data, save] = useCustomData<QuoteData>(sectionId, "quote");

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-3xl mx-auto text-center">
        <div className="text-7xl text-blue-600/30 dark:text-blue-400/30 font-serif leading-none mb-6">"</div>
        {isEditing ? (
          <>
            <EditTextarea value={data.quote} onChange={(v) => save({ ...data, quote: v })} placeholder="Write your quote or testimonial…" rows={4} className="text-2xl text-center font-medium italic mb-8" />
            <EditInput value={data.author} onChange={(v) => save({ ...data, author: v })} placeholder="Author name" className="font-bold text-lg text-center" />
            <EditInput value={data.role} onChange={(v) => save({ ...data, role: v })} placeholder="Role, Company" className="text-neutral-500 text-center mt-2" />
          </>
        ) : (
          <>
            <blockquote className="text-2xl md:text-3xl font-medium italic text-neutral-800 dark:text-neutral-200 mb-8">
              {data.quote}
            </blockquote>
            <p className="font-bold text-lg">{data.author}</p>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{data.role}</p>
          </>
        )}
      </div>
    </section>
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
  switch (template) {
    case "text":       return <TextTemplate sectionId={sectionId} isEditing={isEditing} />;
    case "highlights": return <HighlightsTemplate sectionId={sectionId} isEditing={isEditing} />;
    case "timeline":   return <TimelineTemplate sectionId={sectionId} isEditing={isEditing} />;
    case "quote":      return <QuoteTemplate sectionId={sectionId} isEditing={isEditing} />;
    case "cta":        return <CtaTemplate sectionId={sectionId} isEditing={isEditing} />;
    default:           return null;
  }
}
