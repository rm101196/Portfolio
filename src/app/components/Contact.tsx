import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Mail, Linkedin, Github, Twitter, Pencil } from "lucide-react";
import { EditableContent } from "./EditableContent";

interface ContactProps {
  isEditing: boolean;
}

function useStoredValue(key: string, defaultValue: string) {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(`portfolio_${key}`) || defaultValue;
  });
  useEffect(() => {
    const stored = localStorage.getItem(`portfolio_${key}`);
    if (stored) setValue(stored);
  }, [key]);
  const save = (v: string) => {
    setValue(v);
    localStorage.setItem(`portfolio_${key}`, v);
  };
  return [value, save] as const;
}

interface SocialRowProps {
  icon: React.ElementType;
  field: string;
  defaultUrl: string;
  label: string;
  hoverClass: string;
  isEditing: boolean;
}

function SocialRow({ icon: Icon, field, defaultUrl, label, hoverClass, isEditing }: SocialRowProps) {
  const [url, setUrl] = useStoredValue(field, defaultUrl);

  return (
    <div className="flex flex-col items-center gap-2">
      {isEditing ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-full max-w-xs">
          <Icon className="w-5 h-5 flex-shrink-0 text-neutral-500" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={`${label} URL`}
            className="flex-1 text-sm bg-transparent border-b-2 border-blue-500 focus:outline-none text-neutral-800 dark:text-neutral-200 min-w-0"
          />
          <Pencil className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-3 bg-neutral-200 dark:bg-neutral-800 ${hoverClass} rounded-lg transition-all hover:scale-110`}
          aria-label={label}
        >
          <Icon className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}

export function Contact({ isEditing }: ContactProps) {
  const [email, setEmail] = useStoredValue("contact_email", "rishabh.mishra.ba@gmail.com");

  return (
    <section id="contact" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Let's Connect</h2>

          <EditableContent
            field="contact_tagline"
            defaultValue="Let's build impactful products together. Open to Product Manager/ PDO / Technical Product roles in Healthcare | AI Platforms | Enterprise Systems."
            isEditing={isEditing}
            multiline
            className="text-xl text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl mx-auto"
            as="p"
          />

          <div className="flex flex-col items-center gap-6 mb-12">
            {/* Email */}
            {isEditing ? (
              <div className="flex items-center gap-3 px-6 py-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-full max-w-sm">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 bg-transparent border-b-2 border-blue-500 focus:outline-none text-sm text-neutral-800 dark:text-neutral-200"
                />
                <Pencil className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              </div>
            ) : (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                {email}
              </a>
            )}

            {/* Social links */}
            <div className="flex flex-wrap justify-center gap-4">
              <SocialRow icon={Linkedin} field="contact_linkedin" defaultUrl="https://www.linkedin.com/in/mishra-rishabh-rm/" label="LinkedIn" hoverClass="hover:bg-blue-600 hover:text-white" isEditing={isEditing} />
              <SocialRow icon={Github}   field="contact_github"   defaultUrl="https://github.com"   label="GitHub"   hoverClass="hover:bg-neutral-900 hover:text-white" isEditing={isEditing} />
              <SocialRow icon={Twitter}  field="contact_twitter"  defaultUrl="https://twitter.com"  label="Twitter"  hoverClass="hover:bg-sky-400 hover:text-white"     isEditing={isEditing} />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            className="pt-12 border-t border-neutral-200 dark:border-neutral-800"
          >
            <EditableContent
              field="contact_footer"
              defaultValue="© 2026 Rishabh Mishra. All rights reserved."
              isEditing={isEditing}
              className="text-neutral-600 dark:text-neutral-400"
              as="p"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
