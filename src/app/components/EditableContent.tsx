import { useState, useEffect } from "react";

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

  if (!isEditing) {
    const Tag = as;
    return <Tag className={className}>{value}</Tag>;
  }

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`${className} w-full p-2 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800 resize-none`}
        rows={3}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={`${className} w-full p-2 border-2 border-blue-500 rounded bg-white dark:bg-neutral-800`}
    />
  );
}
