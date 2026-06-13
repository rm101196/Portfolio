import { useState, useCallback } from "react";

export function useEditableList<T extends { id: string }>(
  storageKey: string,
  defaults: T[]
) {
  const [items, setItems] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(`portfolio_list_${storageKey}`);
      return stored ? JSON.parse(stored) : defaults;
    } catch {
      return defaults;
    }
  });

  const saveItems = useCallback((newItems: T[]) => {
    setItems(newItems);
    localStorage.setItem(`portfolio_list_${storageKey}`, JSON.stringify(newItems));
  }, [storageKey]);

  const addItem = useCallback((item: T) => {
    setItems((prev) => {
      const next = [...prev, item];
      localStorage.setItem(`portfolio_list_${storageKey}`, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      localStorage.setItem(`portfolio_list_${storageKey}`, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  const updateItem = useCallback((id: string, patch: Partial<T>) => {
    setItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, ...patch } : i));
      localStorage.setItem(`portfolio_list_${storageKey}`, JSON.stringify(next));
      return next;
    });
  }, [storageKey]);

  return { items, saveItems, addItem, removeItem, updateItem };
}
