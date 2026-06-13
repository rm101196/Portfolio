import { useState, useCallback } from "react";

export type TextAlign = "left" | "center" | "right";
export type FontSize = "sm" | "md" | "lg";

export interface TypographySettings {
  fontFamily: string;
  headingColor: string;   // hex or "" for default
  bodyColor: string;      // hex or ""
  accentColor: string;    // hex or ""
  headingAlign: TextAlign;
  bodyAlign: TextAlign;
  fontSize: FontSize;
}

export const FONT_OPTIONS: { label: string; value: string; url?: string }[] = [
  { label: "Inter (Default)",     value: "Inter" },
  { label: "Roboto",              value: "Roboto",           url: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap" },
  { label: "Montserrat",         value: "Montserrat",       url: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" },
  { label: "Playfair Display",   value: "Playfair Display", url: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap" },
  { label: "Poppins",            value: "Poppins",          url: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" },
  { label: "Lato",               value: "Lato",             url: "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" },
  { label: "Raleway",            value: "Raleway",          url: "https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&display=swap" },
  { label: "Source Sans 3",      value: "Source Sans 3",    url: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap" },
];

export const DEFAULTS: TypographySettings = {
  fontFamily: "Inter",
  headingColor: "",
  bodyColor: "",
  accentColor: "",
  headingAlign: "left",
  bodyAlign: "left",
  fontSize: "md",
};

const KEY = "portfolio_typography";

export function useTypographySettings() {
  const [settings, setSettings] = useState<TypographySettings>(() => {
    try {
      const stored = localStorage.getItem(KEY);
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  const save = useCallback((next: TypographySettings) => {
    setSettings(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const update = useCallback(
    (patch: Partial<TypographySettings>) => save({ ...settings, ...patch }),
    [settings, save]
  );

  return { settings, update, save };
}
