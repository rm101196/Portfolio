import { useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight, Download, Mail, Upload, Trash2, FileText, FileCheck } from "lucide-react";
import { EditableContent } from "./EditableContent";
import { useResume } from "../hooks/useResume";

interface HeroProps {
  isEditing: boolean;
}

export function Hero({ isEditing }: HeroProps) {
  const { resume, upload, remove, download } = useResume();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    upload(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <EditableContent
            field="hero_greeting"
            defaultValue="Hi, I'm Rishabh Mishra"
            isEditing={isEditing}
            className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            as="h1"
          />

          <EditableContent
            field="hero_title"
            defaultValue="Product Manager/ PDO | AI, Healthcare & Platform Systems"
            isEditing={isEditing}
            className="text-2xl md:text-3xl text-neutral-600 dark:text-neutral-400 mb-6"
            as="h2"
          />

          <EditableContent
            field="hero_description"
            defaultValue="I build scalable, data-driven products that solve critical healthcare challenges across global markets."
            isEditing={isEditing}
            multiline
            className="text-lg md:text-xl text-neutral-700 dark:text-neutral-300 mb-8 max-w-3xl"
            as="p"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-4 mb-8"
          >
            {[
              { field: "hero_point_1", defaultValue: "0→1 Product Development & Platform Strategy", color: "bg-blue-600" },
              { field: "hero_point_2", defaultValue: "AI-Driven Systems & Predictive Analytics",    color: "bg-purple-600" },
              { field: "hero_point_3", defaultValue: "Distributed Architecture & Integrations",     color: "bg-pink-600" },
            ].map(({ field, defaultValue, color }) => (
              <div key={field} className="flex items-start gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${color} mt-2.5 flex-shrink-0`} />
                <EditableContent
                  field={field}
                  defaultValue={defaultValue}
                  isEditing={isEditing}
                  className="text-lg text-neutral-700 dark:text-neutral-300"
                  as="p"
                />
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-12"
          >
            <EditableContent
              field="hero_impact"
              defaultValue="Delivered $10M+ Business Impact | Improved System Efficiency by 30%+ | Scaled Products Across US, EU & APAC"
              isEditing={isEditing}
              className="text-xl font-semibold text-blue-600 dark:text-blue-400"
              as="p"
            />
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={scrollToProjects}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
            >
              View Projects
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Download Resume — functional when uploaded */}
            <button
              onClick={resume ? download : undefined}
              disabled={!resume && !isEditing}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all ${
                resume
                  ? "bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 hover:scale-105 cursor-pointer"
                  : "bg-neutral-100 dark:bg-neutral-800/50 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
              }`}
              title={resume ? `Download ${resume.filename}` : "No resume uploaded yet"}
            >
              {resume ? <FileCheck className="w-5 h-5 text-green-600" /> : <Download className="w-5 h-5" />}
              Download Resume
            </button>

            <button
              onClick={scrollToContact}
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Contact Me
            </button>
          </motion.div>

          {/* Resume management — edit mode only */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-5 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-xl bg-blue-50/50 dark:bg-blue-950/10"
            >
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Resume Management
              </p>

              {resume ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm flex-1 min-w-0">
                    <FileCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate">{resume.filename}</span>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Replace
                  </button>
                  <button
                    onClick={remove}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-800/50 text-sm rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No resume uploaded — visitors will see a disabled Download button.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Resume
                  </button>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-3">
                Accepted formats: PDF, DOCX · Max ~4 MB (stored in browser)
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
