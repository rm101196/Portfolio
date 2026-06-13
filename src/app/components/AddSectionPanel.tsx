import { X, Plus, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  BUILTIN_SECTION_META,
  CUSTOM_TEMPLATE_META,
  type SectionDef,
  type BuiltinType,
  type CustomTemplate,
} from "../hooks/useSectionOrder";

interface AddSectionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSections: SectionDef[];
  onAdd: (section: SectionDef) => void;
  onRemove: (id: string) => void;
}

export function AddSectionPanel({ isOpen, onClose, currentSections, onAdd, onRemove }: AddSectionPanelProps) {
  const currentIds = new Set(currentSections.map((s) => s.id));

  const handleAddBuiltin = (type: BuiltinType) => {
    if (currentIds.has(type)) return;
    onAdd({ id: type, type, label: BUILTIN_SECTION_META[type].label });
  };

  const handleToggleBuiltin = (type: BuiltinType) => {
    if (currentIds.has(type)) {
      onRemove(type);
    } else {
      handleAddBuiltin(type);
    }
  };

  const handleAddCustom = (template: CustomTemplate) => {
    const id = `custom_${template}_${Date.now()}`;
    onAdd({
      id,
      type: "custom",
      label: CUSTOM_TEMPLATE_META[template].label,
      customTemplate: template,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-neutral-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-700">
              <div>
                <h2 className="text-xl font-bold">Manage Sections</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Add, remove, or reorder sections</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Built-in sections */}
              <div className="px-6 pt-6 pb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
                  Built-in Sections
                </p>
                <div className="space-y-2">
                  {(Object.keys(BUILTIN_SECTION_META) as BuiltinType[]).map((type) => {
                    const meta = BUILTIN_SECTION_META[type];
                    const isOnPage = currentIds.has(type);
                    return (
                      <div
                        key={type}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isOnPage
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                            : "border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-neutral-800"
                        }`}
                        onClick={() => handleToggleBuiltin(type)}
                      >
                        <span className="text-2xl w-8 text-center flex-shrink-0">{meta.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{meta.label}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{meta.description}</p>
                        </div>
                        {isOnPage ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Plus className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 pb-2">
                <div className="border-t border-neutral-200 dark:border-neutral-700" />
              </div>

              {/* Custom sections */}
              <div className="px-6 pt-4 pb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1">
                  Add Custom Section
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  Choose a template — content is fully editable once added.
                </p>
                <div className="space-y-2">
                  {(Object.keys(CUSTOM_TEMPLATE_META) as CustomTemplate[]).map((template) => {
                    const meta = CUSTOM_TEMPLATE_META[template];
                    return (
                      <button
                        key={template}
                        onClick={() => handleAddCustom(template)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 bg-white dark:bg-neutral-800 transition-all text-left group"
                      >
                        <span className="text-2xl w-8 text-center flex-shrink-0">{meta.emoji}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{meta.label}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{meta.description}</p>
                        </div>
                        <Plus className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                Drag sections on the page to reorder them
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
