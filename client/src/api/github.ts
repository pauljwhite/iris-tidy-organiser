import type { AppData } from '../types';

export interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
  path: string;
}

const CONFIG_KEY = 'iris-tidy-organiser:github-config';

export function getGithubConfig(): GithubConfig | null {
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GithubConfig;
  } catch {
    return null;
  }
}

export function saveGithubConfig(cfg: GithubConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  currentSha = null;
}

export function clearGithubConfig(): void {
  localStorage.removeItem(CONFIG_KEY);
  currentSha = null;
}

// UTF-8 safe base64 helpers (raw atob/btoa only handle Latin1).
function b64EncodeUnicode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function b64DecodeUnicode(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

class GithubApiError extends Error {}

function apiUrl(cfg: GithubConfig): string {
  return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}`;
}

function headers(cfg: GithubConfig): HeadersInit {
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

// Cached sha of the last-known file content, so writes don't need an extra
// round-trip fetch first. Single-user, effectively-single-tab tool, so no
// real conflict resolution is needed here.
let currentSha: string | null = null;

export async function getFile(cfg: GithubConfig): Promise<AppData | null> {
  const res = await fetch(apiUrl(cfg), { headers: headers(cfg) });
  if (res.status === 404) {
    currentSha = null;
    return null;
  }
  if (res.status === 401) {
    throw new GithubApiError('GitHub rejected the token - check it is valid and not expired.');
  }
  if (!res.ok) {
    throw new GithubApiError(`GitHub API error (${res.status}) while reading ${cfg.path}`);
  }
  const json = await res.json();
  currentSha = json.sha;
  return JSON.parse(b64DecodeUnicode(json.content)) as AppData;
}

export async function putFile(
  cfg: GithubConfig,
  data: AppData,
  message = 'Update Iris Tidy Organiser data'
): Promise<void> {
  const body: Record<string, unknown> = {
    message,
    content: b64EncodeUnicode(JSON.stringify(data, null, 2)),
  };
  if (currentSha) body.sha = currentSha;

  const res = await fetch(apiUrl(cfg), {
    method: 'PUT',
    headers: headers(cfg),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new GithubApiError(`GitHub API error (${res.status}) while saving ${cfg.path}`);
  }
  const json = await res.json();
  currentSha = json.content.sha;
}
