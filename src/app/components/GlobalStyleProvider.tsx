import { useEffect } from "react";
import { FONT_OPTIONS, type TypographySettings } from "../hooks/useTypographySettings";

interface Props {
  settings: TypographySettings;
}

const SIZE_MAP = { sm: "0.9", md: "1", lg: "1.15" };

export function GlobalStyleProvider({ settings }: Props) {
  const { fontFamily, headingColor, bodyColor, accentColor, headingAlign, bodyAlign, fontSize } = settings;
  const scale = SIZE_MAP[fontSize] || "1";

  // Load Google Font if needed
  useEffect(() => {
    const font = FONT_OPTIONS.find((f) => f.value === fontFamily);
    if (!font?.url) return;
    const id = `gfont-${fontFamily.replace(/\s+/g, "-")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = font.url;
    document.head.appendChild(link);
  }, [fontFamily]);

  // Inject scoped CSS
  useEffect(() => {
    const id = "portfolio-global-styles";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }

    const hColor = headingColor ? `color: ${headingColor} !important;` : "";
    const bColor = bodyColor    ? `color: ${bodyColor} !important;`    : "";
    const aColor = accentColor  ? `color: ${accentColor} !important;`  : "";
    const aBg    = accentColor  ? `background-color: ${accentColor} !important;` : "";
    const aBorder = accentColor ? `border-color: ${accentColor} !important;`     : "";

    el.textContent = `
      #portfolio-root, #portfolio-root * {
        font-family: '${fontFamily}', system-ui, sans-serif !important;
      }
      #portfolio-root h1,
      #portfolio-root h2,
      #portfolio-root h3,
      #portfolio-root h4,
      #portfolio-root h5 {
        ${hColor}
        text-align: ${headingAlign} !important;
        font-size: calc(1em * ${scale});
      }
      #portfolio-root p,
      #portfolio-root li,
      #portfolio-root blockquote {
        ${bColor}
        text-align: ${bodyAlign} !important;
        font-size: calc(1em * ${scale});
      }
      ${accentColor ? `
      #portfolio-root .text-blue-600,
      #portfolio-root .text-blue-400,
      #portfolio-root .text-blue-500 {
        ${aColor}
      }
      #portfolio-root .bg-blue-600,
      #portfolio-root .bg-blue-500 {
        ${aBg}
      }
      #portfolio-root .border-blue-600,
      #portfolio-root .ring-blue-600 {
        ${aBorder}
      }
      #portfolio-root .from-blue-600 { --tw-gradient-from: ${accentColor} !important; }
      #portfolio-root .to-purple-600 { --tw-gradient-to: ${accentColor} !important; }
      ` : ""}
    `;
  }, [fontFamily, headingColor, bodyColor, accentColor, headingAlign, bodyAlign, fontSize, scale]);

  return null;
}
