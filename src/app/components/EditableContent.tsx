import { useState, useEffect, useRef } from "react";
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, ChevronDown, Palette } from "lucide-react";

// ── Per-field style overrides stored in localStorage ──────────────────────────

interface FieldStyle {
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  color?: string;    // hex or ""
  fontSize?: string; // pixel value key, e.g. "12", "14", "16", "18", "20", "24", "30"
}

/** Font size options using pixel values (applied via inline style, not Tailwind class) */
const FONT_SIZE_OPTIONS = [
  { label: "XS", value: "12" },
  { label: "SM", value: "14" },
  { label: "Base", value: "16" },
  { label: "LG", value: "18" },
  { label: "XL", value: "20" },
  { label: "2XL", value: "24" },
  { label: "3XL", value: "30" },
  { label: "4XL", value: "36" },
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
    <div className="flex items-center gap-0.5 flex-wrap mb-1.5">
      {/* Bold */}
      <button
        onClick={() => onUpdate({ bold: !style.bold })}
        className={`p-1.5 rounded transition-colors ${
          style.bold ? "bg-blue-600 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
        }`}
        title="Bold"
        type="button"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      {/* Italic */}
      <button
        onClick={() => onUpdate({ italic: !style.italic })}
        className={`p-1.5 rounded transition-colors ${
          style.italic ? "bg-blue-600 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
        }`}
        title="Italic"
        type="button"
      >
        <Italic className="w-3.5 h-3.5" />
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
            className={`p-1.5 rounded transition-colors ${
              style.align === align ? "bg-blue-600 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
            }`}
            title={`Align ${align}`}
            type="button"
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
        className="relative p-1.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
        title="Text color"
        type="button"
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
          className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 px-1"
          title="Reset color"
          type="button"
        >
          ×
        </button>
      )}

      {/* Divider */}
      <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1" />

      {/* Font size dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowSizeMenu(!showSizeMenu)}
          className="flex items-center gap-0.5 px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors text-xs font-medium"
          title="Font size"
          type="button"
        >
          {FONT_SIZE_OPTIONS.find((o) => o.value === style.fontSize)?.label || "Size"}
          <ChevronDown className="w-3 h-3" />
        </button>
        {showSizeMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSizeMenu(false)} />
            <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden min-w-[80px]">
              {FONT_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onUpdate({ fontSize: opt.value }); setShowSizeMenu(false); }}
                  type="button"
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                    style.fontSize === opt.value ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-semibold" : ""
                  }`}
                >
                  {opt.label}
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
   * Build inline style from per-field overrides.
   * Uses inline CSS (not Tailwind classes) so styles work at runtime
   * without needing build-time class scanning.
   */
  const buildInlineStyle = (): React.CSSProperties => {
    const s: React.CSSProperties = {};
    if (fieldStyle.bold) s.fontWeight = "bold";
    if (fieldStyle.italic) s.fontStyle = "italic";
    if (fieldStyle.align) s.textAlign = fieldStyle.align;
    if (fieldStyle.color) s.color = fieldStyle.color;
    if (fieldStyle.fontSize) s.fontSize = `${fieldStyle.fontSize}px`;
    return s;
  };

  const inlineStyle = buildInlineStyle();

  if (!isEditing) {
    const Tag = as;
    return (
      <Tag className={className} style={inlineStyle}>
        {value}
      </Tag>
    );
  }

  // Edit mode: show inline toolbar + input/textarea
  return (
    <div className="w-full">
      <InlineStyleToolbar style={fieldStyle} onUpdate={updateFieldStyle} />
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={inlineStyle}
          className={`${className} w-full p-2 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 resize-none`}
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={inlineStyle}
          className={`${className} w-full p-2 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800`}
        />
      )}
    </div>
  );
}
