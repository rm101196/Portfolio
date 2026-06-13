import { useState } from "react";
import { motion } from "motion/react";
import { Target, Code, Brain, Cloud, Wrench, HeartPulse, Plus, Trash2, X } from "lucide-react";
import { useEditableList } from "../hooks/useEditableList";

interface SkillsProps {
  isEditing: boolean;
}

interface SkillCategory {
  id: string;
  title: string;
  color: string;
  skills: string[];
}

const COLORS = ["blue", "purple", "pink", "green", "orange", "red", "teal", "cyan"];

const ICONS = [Target, Code, Brain, Cloud, Wrench, HeartPulse, Target, Code];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue:   { bg: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-600" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600" },
  pink:   { bg: "bg-pink-100 dark:bg-pink-900/30",   text: "text-pink-600" },
  green:  { bg: "bg-green-100 dark:bg-green-900/30",  text: "text-green-600" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-500" },
  red:    { bg: "bg-red-100 dark:bg-red-900/30",     text: "text-red-600" },
  teal:   { bg: "bg-teal-100 dark:bg-teal-900/30",   text: "text-teal-600" },
  cyan:   { bg: "bg-cyan-100 dark:bg-cyan-900/30",   text: "text-cyan-600" },
};

const DEFAULT_CATEGORIES: SkillCategory[] = [
  { id: "skill_product",   title: "Product",   color: "blue",   skills: ["Strategy & Roadmaps", "Backlog & Prioritization", "0→1 Products"] },
  { id: "skill_technical", title: "Technical", color: "purple", skills: ["System Architecture", "Distributed Systems", "API Integrations"] },
  { id: "skill_ai",        title: "AI & Data", color: "pink",   skills: ["AI-DLC (Kiro, AWS Q)", "Conversational AI", "Predictive Analytics"] },
  { id: "skill_cloud",     title: "Cloud",     color: "green",  skills: ["AWS, Azure", "Data Pipelines", "Cloud Migration"] },
  { id: "skill_tools",     title: "Tools",     color: "orange", skills: ["JIRA, Bitbucket", "Figma", "SQL"] },
  { id: "skill_domain",    title: "Domain",    color: "red",    skills: ["Healthcare Systems", "CRRT, Dialysis", "ISO Compliance (13485, 14971, 62304)"] },
];

function SkillCard({
  category,
  index,
  isEditing,
  onUpdate,
  onRemove,
}: {
  category: SkillCategory;
  index: number;
  isEditing: boolean;
  onUpdate: (patch: Partial<SkillCategory>) => void;
  onRemove: () => void;
}) {
  const [newSkill, setNewSkill] = useState("");
  const colors = colorMap[category.color] || colorMap.blue;
  const Icon = ICONS[index % ICONS.length];

  const addSkill = () => {
    const t = newSkill.trim();
    if (!t) return;
    onUpdate({ skills: [...category.skills, t] });
    setNewSkill("");
  };

  const removeSkill = (i: number) =>
    onUpdate({ skills: category.skills.filter((_, idx) => idx !== i) });

  const updateSkill = (i: number, v: string) => {
    const s = [...category.skills];
    s[i] = v;
    onUpdate({ skills: s });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      viewport={{ once: true }}
      className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow relative"
    >
      {isEditing && (
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-lg transition-colors"
          aria-label="Remove category"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${colors.text}`} />
      </div>

      {isEditing ? (
        <input
          type="text"
          value={category.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Category title"
          className="w-full px-2 py-1 mb-4 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 font-bold focus:outline-none text-neutral-900 dark:text-neutral-100"
        />
      ) : (
        <h3 className="text-xl font-bold mb-4">{category.title}</h3>
      )}

      <ul className="space-y-2 mb-3">
        {category.skills.map((skill, i) => (
          <li key={i} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
            <span className={`w-1.5 h-1.5 ${colors.bg} rounded-full flex-shrink-0`} />
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateSkill(i, e.target.value)}
                  className="flex-1 px-2 py-0.5 text-sm border border-blue-400 rounded bg-white dark:bg-neutral-700 focus:outline-none focus:border-blue-500"
                />
                <button onClick={() => removeSkill(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <span>{skill}</span>
            )}
          </li>
        ))}
      </ul>

      {isEditing && (
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            placeholder="Add skill…"
            className="flex-1 px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addSkill}
            className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export function Skills({ isEditing }: SkillsProps) {
  const { items: categories, addItem, removeItem, updateItem } = useEditableList<SkillCategory>(
    "skill_categories",
    DEFAULT_CATEGORIES
  );

  const handleAdd = () => {
    addItem({
      id: `skill_${Date.now()}`,
      title: "",
      color: COLORS[categories.length % COLORS.length],
      skills: [],
    });
  };

  return (
    <section className="py-20 px-6 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Skills & Expertise</h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            A comprehensive toolkit for building world-class products
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <SkillCard
              key={category.id}
              category={category}
              index={index}
              isEditing={isEditing}
              onUpdate={(patch) => updateItem(category.id, patch)}
              onRemove={() => removeItem(category.id)}
            />
          ))}
        </div>

        {isEditing && (
          <motion.button
            onClick={handleAdd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full mt-6 py-4 border-2 border-dashed border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Skill Category
          </motion.button>
        )}
      </div>
    </section>
  );
}
