import { useState } from 'react';
import { useAppData } from '../state/AppDataContext';

export default function RefreshButton() {
  const { reload } = useAppData();
  const [spinning, setSpinning] = useState(false);

  async function handleClick() {
    setSpinning(true);
    try {
      await reload();
    } finally {
      setTimeout(() => setSpinning(false), 400);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Refresh"
      title="Refresh"
      className="p-2 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-5 h-5 ${spinning ? 'animate-spin' : ''}`}
      >
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 4v5h-5" />
      </svg>
    </button>
  );
}
