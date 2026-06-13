import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Activity, MessageSquare, Cloud, TrendingUp, Users, Zap, Plus, Trash2, X } from "lucide-react";
import { useEditableList } from "../hooks/useEditableList";

interface ProjectsProps {
  isEditing: boolean;
}

interface Project {
  id: string;
  color: string;
  title: string;
  problem: string;
  role: string;
  solution: string;
  execution: string;
  impact: string;
}

const COLORS = ["blue", "purple", "pink", "green", "orange", "teal", "cyan", "rose"];

const gradientMap: Record<string, string> = {
  blue: "from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20",
  purple: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
  pink: "from-pink-50 to-orange-50 dark:from-pink-950/20 dark:to-orange-950/20",
  green: "from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20",
  orange: "from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20",
  teal: "from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20",
  cyan: "from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20",
  rose: "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20",
};

const iconBgMap: Record<string, string> = {
  blue: "bg-blue-600",
  purple: "bg-purple-600",
  pink: "bg-pink-600",
  green: "bg-green-600",
  orange: "bg-orange-500",
  teal: "bg-teal-600",
  cyan: "bg-cyan-600",
  rose: "bg-rose-600",
};

const cardAccentMap: Record<string, string> = {
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
  pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-600",
  green: "bg-green-100 dark:bg-green-900/30 text-green-600",
  orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-500",
  teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
};

const ProjectIcons = [Brain, Activity, MessageSquare, Cloud, TrendingUp, Users, Zap, Brain];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "proj_default_1",
    color: "blue",
    title: "Building an Enterprise AI Development Lifecycle Platform",
    problem: "AI initiatives in healthcare lacked standardization across teams, a scalable development lifecycle, and integration with existing systems — resulting in slow adoption and fragmented implementations.",
    role: "Product Lead for the AI-DLC initiative. Led 20+ engineers, architects, and stakeholders. Owned the product vision, roadmap, and execution end-to-end.",
    solution: "Designed an AI Development Lifecycle platform leveraging the Kiro framework, AWS Q, and cloud-native architecture. Defined AI workflows, platform capabilities, and delivered 3 platform product backlogs.",
    execution: "Delivered 3 platform product backlogs. Led architecture and integration design. Conducted cross-functional discovery across global teams.",
    impact: "Enabled scalable AI adoption across enterprise teams, accelerated AI development cycles significantly, and established the foundation for a future AI product ecosystem.",
  },
  {
    id: "proj_default_2",
    color: "purple",
    title: "Reducing Therapy Gaps with Predictive Analytics in CRRT",
    problem: "CRRT therapy faced frequent therapy interruptions, lack of real-time insights, and poor device interoperability — directly impacting patient outcomes and clinic efficiency.",
    role: "Product Manager leading the full initiative. Worked directly with VP Engineering, clinical teams (nurses, clinics), and commercial leadership.",
    solution: "Designed a predictive analytics platform integrating multiple medical devices, enabling real-time monitoring and delivering predictive alerts to clinicians.",
    execution: "Defined product vision and roadmap. Designed system architecture and integrations. Led cross-functional discovery and piloted the product across 4 countries (US, EU, APAC).",
    impact: "Reduced clinical inefficiencies by 25–30%. Improved therapy continuity and patient outcomes. Enabled data-driven clinical decision-making and established the roadmap for global scaling.",
  },
  {
    id: "proj_default_3",
    color: "pink",
    title: "Driving $8M+ Cost Savings Through AI Automation",
    problem: "High operational costs, low patient engagement, and heavy reliance on manual workflows were creating significant inefficiencies.",
    role: "Product Manager owning roadmap and delivery end-to-end.",
    solution: "Built an AI-powered patient engagement platform using AWS Lex. Integrated with IVR and contact center systems. Designed conversational flows and automated key workflows across enterprise systems.",
    execution: "Designed conversational flows, automated key workflows, and integrated across enterprise systems.",
    impact: "Delivered $8M+ annual cost savings. Reduced manual effort significantly. Improved patient engagement and response efficiency.",
  },
  {
    id: "proj_default_4",
    color: "green",
    title: "Modernizing Legacy Systems with Cloud-Based IVR Platform",
    problem: "Legacy IVR infrastructure (Genesys/Avaya) was limiting scalability, reliability, and integration capabilities across the enterprise.",
    role: "Product Manager driving cloud migration strategy and execution across 9+ programs.",
    solution: "Migrated legacy Genesys/Avaya systems to cloud-native infrastructure, enabling modern integrations and improved operational performance.",
    execution: "Delivered 9+ major programs. Coordinated migration across cross-functional teams. Ensured zero-downtime transitions.",
    impact: "Improved scalability and reliability across all teams. Enabled modern cloud integrations and set foundation for future platform capabilities.",
  },
];

function InlineField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-semibold mb-1 text-neutral-500 dark:text-neutral-400">{label}</p>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={`Enter ${label.replace(/[^a-zA-Z ]/g, "").trim().toLowerCase()}…`}
          className="w-full px-3 py-2 text-sm border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none focus:outline-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.replace(/[^a-zA-Z ]/g, "").trim().toLowerCase()}…`}
          className="w-full px-3 py-2 text-sm border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
        />
      )}
    </div>
  );
}

export function Projects({ isEditing }: ProjectsProps) {
  const { items: projects, addItem, removeItem, updateItem } = useEditableList<Project>(
    "all_projects",
    DEFAULT_PROJECTS
  );
  /** ID of the project whose detail popup is open (view mode only) */
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const handleAdd = () => {
    addItem({
      id: `proj_${Date.now()}`,
      color: COLORS[projects.length % COLORS.length],
      title: "",
      problem: "",
      role: "",
      solution: "",
      execution: "",
      impact: "",
    });
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  return (
    <section id="projects" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Projects</h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Transforming healthcare with AI-driven solutions
          </p>
        </motion.div>

        {/* Project cards grid — clickable in view mode to open detail popup */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {projects.map((project, index) => {
            const Icon = ProjectIcons[index % ProjectIcons.length];
            const accent = cardAccentMap[project.color] || cardAccentMap.blue;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07, duration: 0.5 }}
                viewport={{ once: true }}
                onClick={!isEditing ? () => setActiveProjectId(project.id) : undefined}
                className={`p-5 bg-white dark:bg-neutral-800 rounded-xl shadow-lg hover:shadow-xl transition-all ${
                  !isEditing ? "cursor-pointer hover:scale-[1.03]" : ""
                }`}
              >
                <div className={`w-11 h-11 ${accent} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm leading-tight line-clamp-2">
                  {project.title || "Untitled Project"}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Full project detail cards — only shown inline in EDIT mode */}
        {isEditing &&
          projects.map((project, index) => {
            const color = project.color || COLORS[index % COLORS.length];
            const gradient = gradientMap[color] || gradientMap.blue;
            const iconBg = iconBgMap[color] || iconBgMap.blue;
            const Icon = ProjectIcons[index % ProjectIcons.length];

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`mb-10 p-8 bg-gradient-to-br ${gradient} rounded-2xl relative`}
              >
                <button
                  onClick={() => removeItem(project.id)}
                  className="absolute top-4 right-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-lg transition-colors"
                  aria-label="Remove project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateItem(project.id, { title: e.target.value })}
                    placeholder="Project Title"
                    className="text-xl md:text-2xl font-bold w-full px-3 py-2 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <InlineField label="🚨 Problem" value={project.problem} onChange={(v) => updateItem(project.id, { problem: v })} multiline />
                  <InlineField label="🎯 My Role" value={project.role} onChange={(v) => updateItem(project.id, { role: v })} multiline />
                  <InlineField label="⚙️ Solution" value={project.solution} onChange={(v) => updateItem(project.id, { solution: v })} multiline />
                  <InlineField label="🧪 Execution" value={project.execution} onChange={(v) => updateItem(project.id, { execution: v })} multiline />
                  <div className="md:col-span-2">
                    <InlineField label="📈 Impact" value={project.impact} onChange={(v) => updateItem(project.id, { impact: v })} multiline />
                  </div>
                </div>
              </motion.div>
            );
          })}

        {isEditing && (
          <motion.button
            onClick={handleAdd}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full py-5 border-2 border-dashed border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Project
          </motion.button>
        )}
      </div>

      {/* Project detail popup modal — view mode only */}
      <AnimatePresence>
        {activeProject && !isEditing && (
          <ProjectDetailModal
            project={activeProject}
            index={projects.indexOf(activeProject)}
            onClose={() => setActiveProjectId(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

/** Full-screen modal showing project details when a card is clicked in view mode */
function ProjectDetailModal({
  project,
  index,
  onClose,
}: {
  project: Project;
  index: number;
  onClose: () => void;
}) {
  const color = project.color || COLORS[index % COLORS.length];
  const gradient = gradientMap[color] || gradientMap.blue;
  const iconBg = iconBgMap[color] || iconBgMap.blue;
  const Icon = ProjectIcons[index % ProjectIcons.length];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br ${gradient} rounded-2xl shadow-2xl p-8`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10"
          aria-label="Close project details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold">{project.title}</h3>
        </div>

        {/* Details grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {project.problem && (
            <div>
              <h4 className="text-xl font-bold mb-3 text-red-600 dark:text-red-400">🚨 Problem</h4>
              <p className="text-neutral-700 dark:text-neutral-300">{project.problem}</p>
            </div>
          )}
          {project.role && (
            <div>
              <h4 className="text-xl font-bold mb-3 text-blue-600 dark:text-blue-400">🎯 My Role</h4>
              <p className="text-neutral-700 dark:text-neutral-300">{project.role}</p>
            </div>
          )}
          {project.solution && (
            <div>
              <h4 className="text-xl font-bold mb-3 text-purple-600 dark:text-purple-400">⚙️ Solution</h4>
              <p className="text-neutral-700 dark:text-neutral-300">{project.solution}</p>
            </div>
          )}
          {project.execution && (
            <div>
              <h4 className="text-xl font-bold mb-3 text-orange-600 dark:text-orange-400">🧪 Execution</h4>
              <p className="text-neutral-700 dark:text-neutral-300">{project.execution}</p>
            </div>
          )}
          {project.impact && (
            <div className="md:col-span-2">
              <h4 className="text-xl font-bold mb-3 text-green-600 dark:text-green-400">📈 Impact</h4>
              <p className="text-neutral-700 dark:text-neutral-300 font-semibold">{project.impact}</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
