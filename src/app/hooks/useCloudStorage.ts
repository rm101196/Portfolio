import { useState, useCallback } from "react";

/**
 * Cloud storage hook that persists portfolio content to a JSON file
 * in the GitHub repo via the GitHub API.
 *
 * READ: Fetches from the deployed GitHub Pages URL (no auth needed).
 * WRITE: Uses GitHub API with a Personal Access Token to commit changes.
 *
 * Storage format: A single JSON object with all portfolio data keys.
 */

const REPO_OWNER = "rm101196";
const REPO_NAME = "Portfolio";
const FILE_PATH = "data/content.json";
const BRANCH = "main";

/** GitHub Pages URL for reading (no auth required) */
const READ_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${FILE_PATH}`;

/** GitHub API URL for writing */
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

const TOKEN_KEY = "portfolio_github_token";

export interface CloudStorageState {
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: string | null;
  error: string | null;
}

/**
 * Collect all portfolio-related localStorage keys into a single object.
 */
function gatherAllContent(): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("portfolio_")) {
      data[key] = localStorage.getItem(key) || "";
    }
  }
  return data;
}

/**
 * Restore content from cloud JSON into localStorage.
 */
function restoreContent(data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("portfolio_")) {
      localStorage.setItem(key, value);
    }
  }
}

export function useCloudStorage() {
  const [state, setState] = useState<CloudStorageState>({
    isSaving: false,
    isLoading: false,
    lastSaved: localStorage.getItem("portfolio_last_cloud_save"),
    error: null,
  });

  /** Get stored GitHub token */
  const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

  /** Save token */
  const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);

  /** Check if token is configured */
  const hasToken = (): boolean => !!getToken();

  /**
   * Load content from GitHub Pages (public, no auth needed).
   * Returns true if content was loaded and applied.
   */
  const loadFromCloud = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const res = await fetch(READ_URL, { cache: "no-store" });
      if (!res.ok) {
        // File doesn't exist yet — that's fine, first-time use
        if (res.status === 404) {
          setState((s) => ({ ...s, isLoading: false }));
          return false;
        }
        throw new Error(`Failed to load: ${res.status}`);
      }
      const data = await res.json();
      restoreContent(data);
      setState((s) => ({ ...s, isLoading: false }));
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, isLoading: false, error: err.message }));
      return false;
    }
  }, []);

  /**
   * Save all portfolio content to GitHub repo via API.
   * Requires a valid Personal Access Token.
   */
  const saveToCloud = useCallback(async (): Promise<boolean> => {
    const token = getToken();
    if (!token) {
      setState((s) => ({ ...s, error: "No GitHub token configured" }));
      return false;
    }

    setState((s) => ({ ...s, isSaving: true, error: null }));

    try {
      const content = gatherAllContent();
      const jsonStr = JSON.stringify(content, null, 2);
      const base64Content = btoa(unescape(encodeURIComponent(jsonStr)));

      // Get current file SHA (needed for updates)
      let sha: string | undefined;
      try {
        const getRes = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        if (getRes.ok) {
          const fileData = await getRes.json();
          sha = fileData.sha;
        }
      } catch {
        // File doesn't exist yet — will create
      }

      // Commit the file
      const body: Record<string, string> = {
        message: `Update portfolio content — ${new Date().toISOString()}`,
        content: base64Content,
        branch: BRANCH,
      };
      if (sha) body.sha = sha;

      const putRes = await fetch(API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!putRes.ok) {
        const errData = await putRes.json().catch(() => ({}));
        throw new Error(errData.message || `GitHub API error: ${putRes.status}`);
      }

      const timestamp = new Date().toLocaleString();
      localStorage.setItem("portfolio_last_cloud_save", timestamp);
      setState((s) => ({ ...s, isSaving: false, lastSaved: timestamp }));
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, isSaving: false, error: err.message }));
      return false;
    }
  }, []);

  return {
    ...state,
    hasToken,
    setToken,
    getToken,
    loadFromCloud,
    saveToCloud,
  };
}
