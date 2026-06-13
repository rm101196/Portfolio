import { motion } from "motion/react";
import { TrendingUp, Users, Globe, Award, Plus, Trash2 } from "lucide-react";
import { useEditableList } from "../hooks/useEditableList";

interface StatsProps {
  isEditing: boolean;
}

interface StatItem {
  id: string;
  value: string;
  label: string;
  color: string;
}

const COLORS = ["blue", "purple", "pink", "green", "orange", "teal"];

const ICONS = [TrendingUp, Users, Globe, Award, TrendingUp, Users];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue:   { bg: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-600" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600" },
  pink:   { bg: "bg-pink-100 dark:bg-pink-900/30",   text: "text-pink-600" },
  green:  { bg: "bg-green-100 dark:bg-green-900/30",  text: "text-green-600" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-500" },
  teal:   { bg: "bg-teal-100 dark:bg-teal-900/30",   text: "text-teal-600" },
};

const DEFAULT_STATS: StatItem[] = [
  { id: "stat_impact",     value: "$10M+", label: "Business Impact",                color: "blue" },
  { id: "stat_teams",      value: "20+",   label: "Cross-functional Teams Led",     color: "purple" },
  { id: "stat_markets",    value: "4",     label: "Global Markets (US, EU, APAC)", color: "pink" },
  { id: "stat_experience", value: "6+",    label: "Years Experience",               color: "green" },
];

export function Stats({ isEditing }: StatsProps) {
  const { items: stats, addItem, removeItem, updateItem } = useEditableList<StatItem>(
    "stat_items",
    DEFAULT_STATS
  );

  const handleAdd = () => {
    addItem({
      id: `stat_${Date.now()}`,
      value: "",
      label: "",
      color: COLORS[stats.length % COLORS.length],
    });
  };

  return (
    <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const color = stat.color || COLORS[index % COLORS.length];
            const colors = colorMap[color] || colorMap.blue;
            const Icon = ICONS[index % ICONS.length];

            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                {isEditing && (
                  <button
                    onClick={() => removeItem(stat.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 rounded-full transition-colors z-10"
                    aria-label="Remove stat"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}

                <div className={`w-16 h-16 ${colors.bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>

                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => updateItem(stat.id, { value: e.target.value })}
                      placeholder="e.g. $10M+"
                      className="w-full text-center px-2 py-1 mb-1 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 text-3xl font-bold focus:outline-none text-neutral-900 dark:text-neutral-100"
                    />
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => updateItem(stat.id, { label: e.target.value })}
                      placeholder="Label"
                      className="w-full text-center px-2 py-1 text-sm border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 focus:outline-none"
                    />
                  </>
                ) : (
                  <>
                    <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                    <div className="text-sm md:text-base text-neutral-600 dark:text-neutral-400">{stat.label}</div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {isEditing && (
          <motion.button
            onClick={handleAdd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full mt-8 py-3 border-2 border-dashed border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Stat
          </motion.button>
        )}
      </div>
    </section>
  );
}
