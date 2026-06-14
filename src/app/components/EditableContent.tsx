import { useState, useEffect, useRef, useId } from "react";
import { Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight, ChevronDown, Palette } from "lucide-react";

// ── Per-field style overrides stored in localStorage ──────────────────────────

interface FieldStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  color?: string;    // hex color or ""
  fontSize?: string; // pt value as string, e.g. "12", "18", "24"
}

/**
 * Font size options in points (pt) — matching Microsoft Word's standard sizes.
 * 1pt = 1.333px, so these render at familiar Word-like proportions.
 */
const FONT_SIZE_OPTIONS = [
  "8", "9", "10", "11", "12", "14", "16", "18",
  "20", "22", "24", "26", "28", "36", "48", "72",
];

function useFieldStyle(field: string): [FieldStyle, (patch: Partial<FieldStyle>) => void] {
  const key = `portfolio_style_${field}`;
  const [style, setStyle] = useState<FieldStyle>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const update = (patch: Partial<FieldStyle>) => {
    const next = { ...style, ...patch };
    setStyle(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  return [style, update];
}

// ── Inline style toolbar ──────────────────────────────────────────────────────

function InlineStyleToolbar({
  style,
  onUpdate,
}: {
  style: FieldStyle;
  onUpdate: (patch: Partial<FieldStyle>) => void;
}) {
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const colorRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-0.5 flex-wrap mb-1.5 py-1">
      {/* Bold */}
      <button
        onClick={() => onUpdate({ bold: !style.bold })}
        type="button"
        className={`p-1.5 rounded transition-colors ${
          style.bold ? "bg-blue-600 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
        }`}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* Italic */}
      <button
        onClick={() => onUpdate({ italic: !style.italic })}
        type="button"
        className={`p-1.5 rounded transition-colors ${
          style.italic ? "bg-blue-600 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
        }`}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      {/* Underline */}
      <button
        onClick={() => onUpdate({ underline: !style.underline })}
        type="button"
        className={`p-1.5 rounded transition-colors ${
          style.underline ? "bg-blue-600 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
        }`}
        title="Underline"
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1" />

      {/* Alignment */}
      {(["left", "center", "right"] as const).map((align) => {
        const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight;
        return (
          <button
            key={align}
            onClick={() => onUpdate({ align })}
            type="button"
            className={`p-1.5 rounded transition-colors ${
              style.align === align ? "bg-blue-600 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
            }`}
            title={`Align ${align}`}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}

      {/* Divider */}
      <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1" />

      {/* Color picker */}
      <button
        onClick={() => colorRef.current?.click()}
        type="button"
        className="relative p-1.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
        title="Text color"
      >
        <Palette className="w-3.5 h-3.5" />
        {style.color && (
          <div className="absolute bottom-0 left-1 right-1 h-1 rounded-full" style={{ backgroundColor: style.color }} />
        )}
      </button>
      <input
        ref={colorRef}
        type="color"
        value={style.color || "#000000"}
        onChange={(e) => onUpdate({ color: e.target.value })}
        className="hidden"
      />
      {style.color && (
        <button
          onClick={() => onUpdate({ color: "" })}
          type="button"
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 px-1"
          title="Reset color"
        >
          ×
        </button>
      )}

      {/* Divider */}
      <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1" />

      {/* Font size dropdown — pt values like Word */}
      <div className="relative">
        <button
          onClick={() => setShowSizeMenu(!showSizeMenu)}
          type="button"
          className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-xs font-medium min-w-[52px] justify-between"
          title="Font size (pt)"
        >
          <span>{style.fontSize ? `${style.fontSize}pt` : "Size"}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {showSizeMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSizeMenu(false)} />
            <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-xl overflow-hidden min-w-[72px] max-h-60 overflow-y-auto">
              {FONT_SIZE_OPTIONS.map((pt) => (
                <button
                  key={pt}
                  onClick={() => { onUpdate({ fontSize: pt }); setShowSizeMenu(false); }}
                  type="button"
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                    style.fontSize === pt ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-semibold" : ""
                  }`}
                >
                  {pt} pt
                </button>
              ))}
              {style.fontSize && (
                <button
                  onClick={() => { onUpdate({ fontSize: "" }); setShowSizeMenu(false); }}
                  type="button"
                  className="w-full text-left px-3 py-1.5 text-xs text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-t border-neutral-100 dark:border-neutral-700"
                >
                  Reset
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main EditableContent component ────────────────────────────────────────────

interface EditableContentProps {
  field: string;
  defaultValue: string;
  isEditing: boolean;
  multiline?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function EditableContent({
  field,
  defaultValue,
  isEditing,
  multiline = false,
  className = "",
  as = "p",
}: EditableContentProps) {
  const [value, setValue] = useState(defaultValue);
  const [fieldStyle, updateFieldStyle] = useFieldStyle(field);
  const scopeId = useId().replace(/:/g, "_");

  useEffect(() => {
    const stored = localStorage.getItem(`portfolio_${field}`);
    if (stored) {
      setValue(stored);
    }
  }, [field]);

  useEffect(() => {
    if (value !== defaultValue) {
      localStorage.setItem(`portfolio_${field}`, value);
    }
  }, [value, field, defaultValue]);

  /**
   * Generate a <style> block with !important overrides.
   * This is the only reliable way to override Tailwind's CSS-layer-based
   * color/size classes from a runtime value stored in localStorage.
   */
  const hasOverrides = fieldStyle.bold || fieldStyle.italic || fieldStyle.underline ||
    fieldStyle.align || fieldStyle.color || fieldStyle.fontSize;

  const cssRules = hasOverrides ? buildCssRules(scopeId, fieldStyle) : "";

  if (!isEditing) {
    const Tag = as;
    return (
      <>
        {cssRules && <style dangerouslySetInnerHTML={{ __html: cssRules }} />}
        <Tag className={`${className} editable-${scopeId}`}>
          {value}
        </Tag>
      </>
    );
  }

  // Edit mode: toolbar + input
  return (
    <div className="w-full">
      {cssRules && <style dangerouslySetInnerHTML={{ __html: cssRules }} />}
      <InlineStyleToolbar style={fieldStyle} onUpdate={updateFieldStyle} />
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${className} editable-${scopeId} w-full p-2 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 resize-none`}
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${className} editable-${scopeId} w-full p-2 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800`}
        />
      )}
    </div>
  );
}

/**
 * Build scoped CSS rules with !important to guarantee overrides
 * over Tailwind utility classes (which use CSS layers).
 */
function buildCssRules(scopeId: string, style: FieldStyle): string {
  const selector = `.editable-${scopeId}`;
  const rules: string[] = [];

  if (style.bold) rules.push("font-weight: bold !important");
  if (style.italic) rules.push("font-style: italic !important");
  if (style.underline) rules.push("text-decoration: underline !important");
  if (style.align) rules.push(`text-align: ${style.align} !important`);
  if (style.color) rules.push(`color: ${style.color} !important`);
  if (style.fontSize) rules.push(`font-size: ${style.fontSize}pt !important`);

  if (rules.length === 0) return "";
  return `${selector} { ${rules.join("; ")} }`;
}
