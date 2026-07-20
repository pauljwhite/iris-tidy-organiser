import { useEffect, useState } from 'react';
import { useAppData } from '../state/AppDataContext';
import DaySlider from '../components/DaySlider';
import { clearGithubConfig } from '../api/github';
import type { ScheduleSettings } from '../types';

const WEEKDAYS = [
  { i: 1, label: 'Mon' },
  { i: 2, label: 'Tue' },
  { i: 3, label: 'Wed' },
  { i: 4, label: 'Thu' },
  { i: 5, label: 'Fri' },
  { i: 6, label: 'Sat' },
  { i: 0, label: 'Sun' },
];

interface SettingsPageProps {
  onDisconnected: () => void;
}

export default function SettingsPage({ onDisconnected }: SettingsPageProps) {
  const { data, loading, updateSettings } = useAppData();
  const [local, setLocal] = useState<ScheduleSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setLocal(data.settings);
  }, [data]);

  if (loading || !local) {
    return <p className="text-slate-500">Loading settings…</p>;
  }

  const eligibleCount = 7 - local.excludedWeekdays.length;

  function toggleWeekday(day: number) {
    setLocal((prev) => {
      if (!prev) return prev;
      const isExcluded = prev.excludedWeekdays.includes(day);
      const excludedWeekdays = isExcluded
        ? prev.excludedWeekdays.filter((d) => d !== day)
        : [...prev.excludedWeekdays, day];
      const cap = Math.max(1, 7 - excludedWeekdays.length);
      return {
        ...prev,
        excludedWeekdays,
        activeDaysPerWeek: Math.min(prev.activeDaysPerWeek, cap),
      };
    });
  }

  async function handleRegenerate() {
    if (!local) return;
    setSaving(true);
    setSaved(false);
    await updateSettings(local);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-1">Schedule settings</h2>
        <p className="text-sm text-slate-500">
          Spread the week's cleaning across however many days suit you. Fewer days means
          bigger chunks per day; more days means lighter, quicker tasks.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <DaySlider
          value={local.activeDaysPerWeek}
          max={Math.max(1, eligibleCount)}
          onChange={(v) => setLocal((prev) => (prev ? { ...prev, activeDaysPerWeek: v } : prev))}
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <p className="font-medium mb-3">Days always off</p>
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map(({ i, label }) => {
            const active = local.excludedWeekdays.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggleWeekday(i)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  active
                    ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900'
                    : 'border-slate-300 text-slate-600 hover:border-teal-500 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2">Tap a day to always exclude it (e.g. your busiest work days).</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <label htmlFor="max-min" className="font-medium block mb-2">
          Max minutes per day <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          id="max-min"
          type="number"
          min={5}
          step={5}
          placeholder="No cap"
          value={local.maxMinutesPerDay ?? ''}
          onChange={(e) =>
            setLocal((prev) =>
              prev
                ? {
                    ...prev,
                    maxMinutesPerDay: e.target.value ? Number(e.target.value) : undefined,
                  }
                : prev
            )
          }
          className="w-32 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-1.5"
        />
      </div>

      <button
        type="button"
        onClick={handleRegenerate}
        disabled={saving}
        className="w-full py-2.5 rounded-md bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium transition-colors"
      >
        {saving ? 'Regenerating…' : saved ? 'Schedule updated ✓' : 'Regenerate schedule'}
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <p className="font-medium mb-1">GitHub connection</p>
        <p className="text-sm text-slate-500 mb-3">
          Disconnect to switch accounts, repos, or rotate your access token.
        </p>
        <button
          type="button"
          onClick={() => {
            clearGithubConfig();
            onDisconnected();
          }}
          className="text-sm text-red-500 hover:text-red-600 font-medium"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
