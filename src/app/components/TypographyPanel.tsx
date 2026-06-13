import { X, RotateCcw, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  FONT_OPTIONS,
  DEFAULTS,
  type TypographySettings,
  type TextAlign,
  type FontSize,
} from "../hooks/useTypographySettings";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: TypographySettings;
  onUpdate: (patch: Partial<TypographySettings>) => void;
  onReset: () => void;
}

function AlignButtons({ value, onChange }: { value: TextAlign; onChange: (v: TextAlign) => void }) {
  const options: { val: TextAlign; Icon: typeof AlignLeft }[] = [
    { val: "left", Icon: AlignLeft },
    { val: "center", Icon: AlignCenter },
    { val: "right", Icon: AlignRight },
  ];
  return (
    <div className="flex gap-1">
      {options.map(({ val, Icon }) => (
        <button
          key={val}
          onClick={() => onChange(val)}
          className={`p-2 rounded-lg transition-colors ${
            value === val
              ? "bg-blue-600 text-white"
              : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
          }`}
          title={val.charAt(0).toUpperCase() + val.slice(1)}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

function ColorRow({
  label,
  value,
  defaultLabel,
  onChange,
  onClear,
}: {
  label: string;
  value: string;
  defaultLabel: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          {value || defaultLabel}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {value && (
          <button
            onClick={onClear}
            className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline"
          >
            Reset
          </button>
        )}
        <div className="relative w-9 h-9">
          <div
            className="w-9 h-9 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 overflow-hidden cursor-pointer"
            style={{ backgroundColor: value || "#6b7280" }}
          />
          <input
            type="color"
            value={value || "#6b7280"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}

function SizeButton({ label, value, current, onClick }: { label: string; value: FontSize; current: FontSize; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${
        current === value
          ? "bg-blue-600 text-white"
          : "bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600"
      }`}
    >
      {label}
    </button>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
      <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
    </div>
  );
}

export function TypographyPanel({ isOpen, onClose, settings, onUpdate, onReset }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div key="tp-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-40" />
          <motion.div
            key="tp-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-neutral-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <h2 className="text-xl font-bold">Text & Style</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Font, color, size & alignment</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onReset} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors" title="Reset to defaults">
                  <RotateCcw className="w-4 h-4 text-neutral-500" />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* Font Family */}
              <div>
                <Divider label="Font" />
                <div className="mt-3">
                  <label className="text-sm font-medium block mb-2">Font Family</label>
                  <select
                    value={settings.fontFamily}
                    onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                    className="w-full px-3 py-2.5 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:outline-none focus:border-blue-500 text-sm"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1.5" style={{ fontFamily: settings.fontFamily }}>
                    The quick brown fox jumps over the lazy dog — 1234567890
                  </p>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <Divider label="Size" />
                <div className="mt-3">
                  <label className="text-sm font-medium block mb-2">Text Size</label>
                  <div className="flex gap-2">
                    <SizeButton label="Small"  value="sm" current={settings.fontSize} onClick={() => onUpdate({ fontSize: "sm" })} />
                    <SizeButton label="Medium" value="md" current={settings.fontSize} onClick={() => onUpdate({ fontSize: "md" })} />
                    <SizeButton label="Large"  value="lg" current={settings.fontSize} onClick={() => onUpdate({ fontSize: "lg" })} />
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div>
                <Divider label="Colors" />
                <div className="mt-3 space-y-4">
                  <ColorRow
                    label="Heading Color"
                    value={settings.headingColor}
                    defaultLabel="Tailwind default (dark/light aware)"
                    onChange={(v) => onUpdate({ headingColor: v })}
                    onClear={() => onUpdate({ headingColor: "" })}
                  />
                  <ColorRow
                    label="Body Text Color"
                    value={settings.bodyColor}
                    defaultLabel="Tailwind default (dark/light aware)"
                    onChange={(v) => onUpdate({ bodyColor: v })}
                    onClear={() => onUpdate({ bodyColor: "" })}
                  />
                  <ColorRow
                    label="Accent Color"
                    value={settings.accentColor}
                    defaultLabel="Blue #2563eb"
                    onChange={(v) => onUpdate({ accentColor: v })}
                    onClear={() => onUpdate({ accentColor: "" })}
                  />
                </div>
              </div>

              {/* Alignment */}
              <div>
                <Divider label="Alignment" />
                <div className="mt-3 space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Heading Alignment</label>
                    <AlignButtons value={settings.headingAlign} onChange={(v) => onUpdate({ headingAlign: v })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Body Text Alignment</label>
                    <AlignButtons value={settings.bodyAlign} onChange={(v) => onUpdate({ bodyAlign: v })} />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                Changes apply live across the entire site
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
