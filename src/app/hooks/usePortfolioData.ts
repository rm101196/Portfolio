import { useState, useEffect, useCallback, createContext, useContext } from "react";

/**
 * Centralized portfolio data store backed by Supabase.
 *
 * All portfolio content is stored as a flat key-value JSON object in Supabase.
 * During editing, changes are buffered in React state (memory).
 * Clicking "Save" writes the entire state to Supabase in one PATCH call.
 * On page load, the state is hydrated from Supabase.
 */

const SUPABASE_URL = "https://bcuzqoouzieswfpgeklo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdXpxb291emllc3dmcGdla2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MTU3MjEsImV4cCI6MjA5Njk5MTcyMX0.mqw13CRiIpyRm3SSWMbbG2Ql3GGiGQR5m0sG85SpslE";
const TABLE = "portfolio_content";
const ROW_ID = "main";

export type PortfolioStore = Record<string, string>;

export interface PortfolioDataContext {
  /** All portfolio data as flat key-value pairs */
  store: PortfolioStore;
  /** Get a value by key */
  get: (key: string) => string | null;
  /** Set a value (buffered in memory until save) */
  set: (key: string, value: string) => void;
  /** Remove a key */
  remove: (key: string) => void;
  /** Save all buffered data to Supabase */
  save: () => Promise<boolean>;
  /** Whether data is currently being loaded from Supabase */
  isLoading: boolean;
  /** Whether data is currently being saved to Supabase */
  isSaving: boolean;
  /** Whether there are unsaved changes */
  isDirty: boolean;
  /** Last error message */
  error: string | null;
  /** Last save timestamp */
  lastSaved: string | null;
}

async function supabaseFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...((options.headers as Record<string, string>) || {}),
    },
  });
}

/**
 * Core hook that manages the entire portfolio data lifecycle.
 * Use this once at the app root and pass down via context.
 */
export function usePortfolioDataRoot(): PortfolioDataContext {
  const [store, setStore] = useState<PortfolioStore>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Load data from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await supabaseFetch(`${TABLE}?id=eq.${ROW_ID}&select=data`);
        if (!res.ok) throw new Error(`Load failed: ${res.status}`);
        const rows = await res.json();
        if (!cancelled && rows.length > 0 && rows[0].data) {
          setStore(rows[0].data);
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const get = useCallback((key: string): string | null => {
    return store[key] ?? null;
  }, [store]);

  const set = useCallback((key: string, value: string) => {
    setStore((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  const remove = useCallback((key: string) => {
    setStore((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setIsDirty(true);
  }, []);

  const save = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await supabaseFetch(`${TABLE}?id=eq.${ROW_ID}`, {
        method: "PATCH",
        body: JSON.stringify({ data: store, updated_at: new Date().toISOString() }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Save failed: ${res.status} — ${errText}`);
      }
      const timestamp = new Date().toLocaleString();
      setLastSaved(timestamp);
      setIsDirty(false);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [store]);

  return { store, get, set, remove, save, isLoading, isSaving, isDirty, error, lastSaved };
}

// ── React Context ─────────────────────────────────────────────────────────────

const PortfolioCtx = createContext<PortfolioDataContext | null>(null);

export const PortfolioDataProvider = PortfolioCtx.Provider;

/**
 * Use this hook in any component to access the centralized portfolio data.
 */
export function usePortfolioData(): PortfolioDataContext {
  const ctx = useContext(PortfolioCtx);
  if (!ctx) throw new Error("usePortfolioData must be used within PortfolioDataProvider");
  return ctx;
}
