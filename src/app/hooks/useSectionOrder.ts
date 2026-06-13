import { useState, useCallback } from "react";

export type BuiltinType = "hero" | "about" | "stats" | "projects" | "skills" | "contact";
export type CustomTemplate = "text" | "highlights" | "timeline" | "quote" | "cta";
export type SectionType = BuiltinType | "custom";

export interface SectionDef {
  id: string;
  type: SectionType;
  label: string;
  customTemplate?: CustomTemplate;
}

export const BUILTIN_SECTION_META: Record<BuiltinType, { label: string; description: string; emoji: string }> = {
  hero:     { label: "Hero",     description: "Name, title and introduction",         emoji: "🏠" },
  about:    { label: "About",    description: "About me and key strengths",            emoji: "👤" },
  stats:    { label: "Stats",    description: "Key metrics and achievements",          emoji: "📊" },
  projects: { label: "Projects", description: "Featured projects and case studies",    emoji: "🚀" },
  skills:   { label: "Skills",   description: "Skills and expertise categories",       emoji: "🛠️" },
  contact:  { label: "Contact",  description: "Contact info and social links",         emoji: "✉️" },
};

export const CUSTOM_TEMPLATE_META: Record<CustomTemplate, { label: string; description: string; emoji: string }> = {
  text:       { label: "Free Text",      description: "Title with paragraphs of content",          emoji: "📝" },
  highlights: { label: "Key Highlights", description: "Title with editable bullet points",          emoji: "⭐" },
  timeline:   { label: "Timeline",       description: "Chronological entries (experience/history)", emoji: "📅" },
  quote:      { label: "Testimonial",    description: "Featured quote or recommendation",           emoji: "💬" },
  cta:        { label: "Call to Action", description: "Headline, description and a button",         emoji: "🎯" },
};

const DEFAULT_SECTIONS: SectionDef[] = [
  { id: "hero",     type: "hero",     label: "Hero" },
  { id: "about",    type: "about",    label: "About" },
  { id: "stats",    type: "stats",    label: "Stats" },
  { id: "projects", type: "projects", label: "Projects" },
  { id: "skills",   type: "skills",   label: "Skills" },
  { id: "contact",  type: "contact",  label: "Contact" },
];

export function useSectionOrder() {
  const [sections, setSections] = useState<SectionDef[]>(() => {
    try {
      const stored = localStorage.getItem("portfolio_section_order");
      return stored ? JSON.parse(stored) : DEFAULT_SECTIONS;
    } catch {
      return DEFAULT_SECTIONS;
    }
  });

  const save = useCallback((newSections: SectionDef[]) => {
    setSections(newSections);
    localStorage.setItem("portfolio_section_order", JSON.stringify(newSections));
  }, []);

  const addSection = useCallback((section: SectionDef) => {
    setSections((prev) => {
      const next = [...prev, section];
      localStorage.setItem("portfolio_section_order", JSON.stringify(next));
      return next;
    });
  }, []);

  const removeSection = useCallback((id: string) => {
    setSections((prev) => {
      const next = prev.filter((s) => s.id !== id);
      localStorage.setItem("portfolio_section_order", JSON.stringify(next));
      return next;
    });
  }, []);

  return { sections, save, addSection, removeSection };
}
