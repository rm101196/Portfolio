import { useState, useCallback } from "react";

export interface NavItem {
  id: string;
  label: string;
  targetId: string; // section element ID to scroll to; "" = scroll to top
  isExternal?: boolean;
  href?: string;
}

const DEFAULT_NAV: NavItem[] = [
  { id: "nav_home",     label: "Home",     targetId: "" },
  { id: "nav_projects", label: "Projects", targetId: "projects" },
  { id: "nav_contact",  label: "Contact",  targetId: "contact" },
];

const KEY = "portfolio_nav_config";

export function useNavConfig() {
  const [items, setItems] = useState<NavItem[]>(() => {
    try {
      const stored = localStorage.getItem(KEY);
      return stored ? JSON.parse(stored) : DEFAULT_NAV;
    } catch {
      return DEFAULT_NAV;
    }
  });

  const save = useCallback((next: NavItem[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const addItem = () =>
    save([...items, { id: `nav_${Date.now()}`, label: "New Link", targetId: "" }]);

  const removeItem = (id: string) => save(items.filter((i) => i.id !== id));

  const updateItem = (id: string, patch: Partial<NavItem>) =>
    save(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return { items, save, addItem, removeItem, updateItem };
}
