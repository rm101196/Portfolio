import { useState, useCallback } from "react";

/**
 * Cloud storage hook that persists portfolio content to a JSON file
 * in the GitHub repo via the GitHub API.
 *
 * READ: Fetches from raw.githubusercontent.com (no auth needed, public repo).
 * WRITE: Uses GitHub API with a Personal Access Token to commit changes.
 *
 * All portfolio data is stored in a single `data/content.json` file.
 */

const REPO_OWNER = "rm101196";
const REPO_NAME = "Portfolio";
const FILE_PATH = "data/content.json";
const BRANCH = "main";

/** Public raw URL for reading content (no auth required) */
const READ_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${FILE_PATH}`;

/** GitHub API endpoint for writing content */
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

const TOKEN_KEY = "portfolio_github_token";

/**
 * Convert a Uint8Array to base64 without stack overflow.
 * Uses chunked processing for large payloads (images/PDFs stored as data URLs).
 */
function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    for (let j = 0; j < chunk.length; j++) {
      binary += String.fromCharCode(chunk[j]);
    }
  }
  return btoa(binary);
}

export interface CloudStorageState {
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: string | null;
  error: string | null;
}

/**
 * Collect all portfolio-related data from localStorage into a single object.
 * Excludes large binary data (images/PDFs stored as data URLs) to stay under
 * GitHub's 1MB file size limit. Media attachments remain browser-local.
 */
function gatherAllContent(): Record<string, string> {
  const data: Record<string, string> = {};
  const MAX_VALUE_SIZE = 50_000; // ~50KB per key max (skip large base64 blobs)

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith("portfolio_")) continue;
    if (key === TOKEN_KEY) continue;

    const value = localStorage.getItem(key) || "";

    // Skip keys that hold large binary data (profile photos, media, resumes)
    if (value.length > MAX_VALUE_SIZE) continue;

    data[key] = value;
  }
  return data;
}

/**
 * Restore content from cloud JSON into localStorage.
 */
function restoreContent(data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("portfolio_") && key !== TOKEN_KEY) {
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

  const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
  const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
  const hasToken = (): boolean => !!getToken();

  /**
   * Load content from the public raw GitHub URL (no auth needed).
   * Returns true if content was found and applied to localStorage.
   */
  const loadFromCloud = useCallback(async (): Promise<boolean> => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      // Add cache-busting query to avoid stale CDN cache
      const res = await fetch(`${READ_URL}?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 404) {
          // File doesn't exist yet — first-time use
          setState((s) => ({ ...s, isLoading: false }));
          return false;
        }
        throw new Error(`Failed to load cloud data: ${res.status}`);
      }
      const text = await res.text();
      // Skip if file is empty or just "{}"
      if (!text || text.trim() === "{}") {
        setState((s) => ({ ...s, isLoading: false }));
        return false;
      }
      const data = JSON.parse(text);
      if (Object.keys(data).length === 0) {
        setState((s) => ({ ...s, isLoading: false }));
        return false;
      }
      restoreContent(data);
      setState((s) => ({ ...s, isLoading: false }));
      return true;
    } catch (err: any) {
      setState((s) => ({ ...s, isLoading: false, error: err.message }));
      return false;
    }
  }, []);

  /**
   * Save all portfolio content to GitHub via the Contents API.
   * Handles both create (new file) and update (existing file with SHA).
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
      // Convert to base64 safely (handles large payloads without stack overflow)
      const base64Content = arrayBufferToBase64(new TextEncoder().encode(jsonStr));

      // Fetch current file SHA (required for updates, skip for new files)
      let sha: string | undefined;
      const getRes = await fetch(`${API_URL}?ref=${BRANCH}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      } else if (getRes.status !== 404) {
        // 404 means file doesn't exist yet (will create), any other error is a problem
        const errBody = await getRes.text();
        throw new Error(`Failed to check file status: ${getRes.status} — ${errBody}`);
      }

      // PUT the file content (creates or updates)
      const putBody: Record<string, string> = {
        message: `Update portfolio content — ${new Date().toISOString()}`,
        content: base64Content,
        branch: BRANCH,
      };
      if (sha) putBody.sha = sha;

      const putRes = await fetch(API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(putBody),
      });

      if (!putRes.ok) {
        const errData = await putRes.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errData.message || `GitHub API error: ${putRes.status}`);
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
    hasToken,
    setToken,
    getToken,
    loadFromCloud,
    saveToCloud,
  };
}
