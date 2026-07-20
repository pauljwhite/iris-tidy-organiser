import { useState } from 'react';
import { saveGithubConfig, getFile, type GithubConfig } from '../api/github';

interface ConnectPageProps {
  onConnected: () => void;
}

export default function ConnectPage({ onConnected }: ConnectPageProps) {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('iris-tidy-organiser-data');
  const [path, setPath] = useState('data.json');
  const [token, setToken] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setChecking(true);
    const cfg: GithubConfig = { owner: owner.trim(), repo: repo.trim(), path: path.trim(), token: token.trim() };
    try {
      await getFile(cfg); // validates the token/repo/path can be reached (null is fine - file just doesn't exist yet)
      saveGithubConfig(cfg);
      onConnected();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect to GitHub.');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-4"
      >
        <div>
          <h1 className="text-lg font-semibold">🧹 Connect Iris Tidy Organiser</h1>
          <p className="text-sm text-slate-500 mt-1">
            Your schedule is stored as a file in a private GitHub repo. Enter its details and a
            personal access token below - this stays in your browser only.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1" htmlFor="owner">
            GitHub username
          </label>
          <input
            id="owner"
            required
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="pauljwhite"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-1.5"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1" htmlFor="repo">
            Data repo name
          </label>
          <input
            id="repo"
            required
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-1.5"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1" htmlFor="token">
            Personal access token
          </label>
          <input
            id="token"
            required
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="github_pat_..."
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-1.5"
          />
          <p className="text-xs text-slate-400 mt-1">
            Fine-grained token scoped to just this repo, with Contents: Read and write.
          </p>
        </div>

        <details className="text-xs text-slate-400">
          <summary className="cursor-pointer select-none">Advanced: file path</summary>
          <input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full mt-2 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-1.5 text-slate-700 dark:text-slate-200"
          />
        </details>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={checking}
          className="w-full py-2.5 rounded-md bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium transition-colors"
        >
          {checking ? 'Connecting…' : 'Connect'}
        </button>
      </form>
    </div>
  );
}
