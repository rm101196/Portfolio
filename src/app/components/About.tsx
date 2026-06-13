import { motion } from "motion/react";
import { Target, Zap, Globe, Plus, Trash2 } from "lucide-react";
import { EditableContent } from "./EditableContent";
import { useEditableList } from "../hooks/useEditableList";

interface AboutProps {
  isEditing: boolean;
}

interface StrengthCard {
  id: string;
  title: string;
  description: string;
  color: string;
}

const COLORS = ["blue", "purple", "pink", "green", "orange", "teal"];

const ICON_MAP: Record<string, React.ElementType> = {
  blue:   Target,
  purple: Zap,
  pink:   Globe,
  green:  Target,
  orange: Zap,
  teal:   Globe,
};

const COLOR_STYLE_MAP: Record<string, { bg: string; icon: string }> = {
  blue:   { bg: "bg-blue-100 dark:bg-blue-900/30",   icon: "text-blue-600" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", icon: "text-purple-600" },
  pink:   { bg: "bg-pink-100 dark:bg-pink-900/30",   icon: "text-pink-600" },
  green:  { bg: "bg-green-100 dark:bg-green-900/30",  icon: "text-green-600" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", icon: "text-orange-500" },
  teal:   { bg: "bg-teal-100 dark:bg-teal-900/30",   icon: "text-teal-600" },
};

const DEFAULT_CARDS: StrengthCard[] = [
  { id: "card_strategy", title: "Product Strategy", description: "Expertise in defining vision, strategy, and roadmaps for complex healthcare products", color: "blue" },
  { id: "card_ai",       title: "AI & Automation", description: "Building intelligent platforms with predictive analytics and workflow automation",    color: "purple" },
  { id: "card_global",   title: "Global Markets",  description: "Experience delivering products across US, EU, and APAC in regulated environments",  color: "pink" },
];

export function About({ isEditing }: AboutProps) {
  const { items: cards, addItem, removeItem, updateItem } = useEditableList<StrengthCard>(
    "strength_cards",
    DEFAULT_CARDS
  );

  const handleAdd = () => {
    addItem({
      id: `card_${Date.now()}`,
      title: "",
      description: "",
      color: COLORS[cards.length % COLORS.length],
    });
  };

  return (
    <section className="py-20 px-6 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">About Me</h2>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: editable paragraphs */}
            <div className="space-y-6">
              <EditableContent
                field="about_paragraph_1"
                defaultValue="I am a Product Manager/ PDO with a strong foundation in systems engineering, specializing in AI-driven healthcare platforms and large-scale enterprise systems."
                isEditing={isEditing}
                multiline
                className="text-lg text-neutral-700 dark:text-neutral-300"
                as="p"
              />
              <EditableContent
                field="about_paragraph_2"
                defaultValue="Over the last 6+ years, I've led end-to-end product development across global markets (US, EU, APAC), working closely with engineering, clinical, and business teams to deliver solutions that drive measurable outcomes."
                isEditing={isEditing}
                multiline
                className="text-lg text-neutral-700 dark:text-neutral-300"
                as="p"
              />
              <EditableContent
                field="about_paragraph_3"
                defaultValue="My work sits at the intersection of product strategy, architecture, and execution — where I focus on solving complex, high-impact problems such as improving patient outcomes, reducing operational inefficiencies, and enabling scalable AI adoption."
                isEditing={isEditing}
                multiline
                className="text-lg text-neutral-700 dark:text-neutral-300"
                as="p"
              />
              <EditableContent
                field="about_paragraph_4"
                defaultValue="Currently, I am focused on shaping AI-enabled healthcare platforms that bring predictive intelligence and automation into clinical workflows."
                isEditing={isEditing}
                multiline
                className="text-lg text-neutral-700 dark:text-neutral-300 font-medium"
                as="p"
              />
            </div>

            {/* Right: strength cards — fully dynamic */}
            <div className="space-y-6">
              {cards.map((card, index) => {
                const color = card.color || COLORS[index % COLORS.length];
                const styles = COLOR_STYLE_MAP[color] || COLOR_STYLE_MAP.blue;
                const Icon = ICON_MAP[color] || Target;

                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-lg relative"
                  >
                    {isEditing && (
                      <button
                        onClick={() => removeItem(card.id)}
                        className="absolute top-3 right-3 p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-lg transition-colors"
                        aria-label="Remove card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className={`w-12 h-12 ${styles.bg} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${styles.icon}`} />
                    </div>

                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => updateItem(card.id, { title: e.target.value })}
                          placeholder="Card title"
                          className="w-full px-2 py-1 mb-2 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 font-bold text-lg focus:outline-none text-neutral-900 dark:text-neutral-100"
                        />
                        <textarea
                          value={card.description}
                          onChange={(e) => updateItem(card.id, { description: e.target.value })}
                          placeholder="Card description"
                          rows={2}
                          className="w-full px-2 py-1 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm resize-none focus:outline-none"
                        />
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                        <p className="text-neutral-600 dark:text-neutral-400">{card.description}</p>
                      </>
                    )}
                  </motion.div>
                );
              })}

              {isEditing && (
                <motion.button
                  onClick={handleAdd}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full py-4 border-2 border-dashed border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Strength Card
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
