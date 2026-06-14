import { useState, useCallback } from "react";

/**
 * Supabase-based cloud storage for portfolio content.
 *
 * All editable text, section order, typography settings, and styles are stored
 * in a single JSONB row in the `portfolio_content` table. Media files (images,
 * PDFs) remain in browser localStorage due to size constraints.
 *
 * READ: Public (anon key, RLS policy allows SELECT).
 * WRITE: Uses the same anon key (RLS policy allows INSERT/UPDATE).
 */

const SUPABASE_URL = "https://bcuzqoouzieswfpgeklo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdXpxb291emllc3dmcGdla2xvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MTU3MjEsImV4cCI6MjA5Njk5MTcyMX0.mqw13CRiIpyRm3SSWMbbG2Ql3GGiGQR5m0sG85SpslE";
const TABLE = "portfolio_content";
const ROW_ID = "main";

export interface CloudStorageState {
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: string | null;
  error: string | null;
}

/**
 * Collect all portfolio-related data from localStorage.
 * Skips binary blobs (profile photos, media attachments, resumes) that
 * exceed the size threshold — those stay browser-local.
 */
function gatherContent(): Record<string, string> {
  const data: Record<string, string> = {};

  // Keys that hold binary data or internals — always skip
  const SKIP_KEYS = new Set([
    "portfolio_profile_photo",
    "portfolio_resume",
    "portfolio_github_token",
    "portfolio_last_cloud_save",
    "portfolio_authenticated",
  ]);

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("portfolio_")) continue;
    if (SKIP_KEYS.has(key)) continue;
    // Skip media attachment keys (contain large base64 data URLs)
    if (key.startsWith("portfolio_media_")) continue;

    const value = localStorage.getItem(key) || "";
    data[key] = value;
  }
  return data;
}

/**
 * Restore cloud content into localStorage.
 */
function restoreContent(data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("portfolio_")) {
      localStorage.setItem(key, value);
    }
  }
}

/**
 * Make a Supabase REST API request.
 */
async function supabaseRequest(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      ...((options.headers as Record<string, string>) || {}),
    },
  });
}

export function useCloudStorage() {
  const [state, setState] = useState<CloudStorageState>({
    isSaving: false,
    isLoading: false,
    lastSaved: localStorage.getItem("portfolio_last_cloud_save"),
    error: null,
  });

  /**
   * Load content from Supabase (public read).
   * Returns true if content was found and applied.
   */
  const loadFromCloud = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await supabaseRequest(`${TABLE}?id=eq.${ROW_ID}&select=data`);
      if (!res.ok) throw new Error(`Load failed: ${res.status}`);

      const rows = await res.json();
      if (!rows.length || !rows[0].data || Object.keys(rows[0].data).length === 0) {
        setState((s) => ({ ...s, isLoading: false }));
        return false;
      }

      restoreContent(rows[0].data);
      setState((s) => ({ ...s, isLoading: false }));
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, isLoading: false, error: err.message }));
      return false;
    }
  }, []);

  /**
   * Save all portfolio content to Supabase (upsert).
   * No token prompt needed — uses the anon key with RLS.
   */
  const saveToCloud = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, isSaving: true, error: null }));
    try {
      const content = gatherContent();

      // Upsert: update existing row or insert if missing
      const res = await supabaseRequest(`${TABLE}?id=eq.${ROW_ID}`, {
        method: "PATCH",
        body: JSON.stringify({ data: content, updated_at: new Date().toISOString() }),
      });

      if (!res.ok) {
        // Try INSERT if PATCH fails (row doesn't exist)
        const insertRes = await supabaseRequest(TABLE, {
          method: "POST",
          body: JSON.stringify({ id: ROW_ID, data: content, updated_at: new Date().toISOString() }),
        });
        if (!insertRes.ok) {
          const errText = await insertRes.text();
          throw new Error(`Save failed: ${insertRes.status} — ${errText}`);
        }
      }

      const timestamp = new Date().toLocaleString();
      localStorage.setItem("portfolio_last_cloud_save", timestamp);
      setState({ isSaving: false, isLoading: false, lastSaved: timestamp, error: null });
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, isSaving: false, error: err.message }));
      return false;
    }
  }, []);

  return {
    ...state,
    loadFromCloud,
    saveToCloud,
  };
}
