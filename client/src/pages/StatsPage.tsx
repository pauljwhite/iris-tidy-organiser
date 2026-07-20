import { useMemo } from 'react';
import { useAppData } from '../state/AppDataContext';
import { todayKey } from '../utils/date';
import type { ScheduledTask } from '../types';

function groupByDate(tasks: ScheduledTask[]): Map<string, ScheduledTask[]> {
  const map = new Map<string, ScheduledTask[]>();
  for (const t of tasks) {
    if (!map.has(t.date)) map.set(t.date, []);
    map.get(t.date)!.push(t);
  }
  return map;
}

function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d + deltaDays);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function computeStreak(byDate: Map<string, ScheduledTask[]>, today: string): number {
  if (byDate.size === 0) return 0;
  const minDate = Array.from(byDate.keys()).sort()[0];
  let streak = 0;
  let cursor = shiftDateKey(today, -1);
  while (cursor >= minDate) {
    const tasks = byDate.get(cursor);
    if (tasks && tasks.length > 0) {
      const allDone = tasks.every((t) => t.completed);
      if (!allDone) break;
    }
    streak++;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export default function StatsPage() {
  const { data, loading } = useAppData();
  const today = todayKey();

  const stats = useMemo(() => {
    if (!data) return null;
    const weekTasks = data.scheduledTasks.filter((t) => t.date >= data.weekStart);
    const weekDone = weekTasks.filter((t) => t.completed);
    const minutesTotal = weekTasks.reduce((s, t) => s + t.estimatedMinutes, 0);
    const minutesDone = weekDone.reduce((s, t) => s + t.estimatedMinutes, 0);
    const percent = weekTasks.length > 0 ? Math.round((weekDone.length / weekTasks.length) * 100) : 0;

    const byDate = groupByDate(data.scheduledTasks);
    const streak = computeStreak(byDate, today);

    const last7 = Array.from({ length: 7 }, (_, i) => shiftDateKey(today, i - 6)).map((dateKey) => {
      const tasks = byDate.get(dateKey) ?? [];
      const done = tasks.filter((t) => t.completed).length;
      return { dateKey, total: tasks.length, done };
    });

    return { weekTasks, weekDone, minutesTotal, minutesDone, percent, streak, last7 };
  }, [data, today]);

  if (loading || !data || !stats) {
    return <p className="text-slate-500">Loading stats…</p>;
  }

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold">This week's progress</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-3xl font-bold text-teal-600">{stats.percent}%</p>
          <p className="text-sm text-slate-500 mt-1">
            {stats.weekDone.length}/{stats.weekTasks.length} tasks done
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-3xl font-bold text-teal-600">
            {stats.minutesDone}
            <span className="text-lg text-slate-400">/{stats.minutesTotal}</span>
          </p>
          <p className="text-sm text-slate-500 mt-1">minutes done this week</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <p className="text-3xl font-bold text-amber-500">
          🔥 {stats.streak} <span className="text-lg text-slate-400 font-normal">day{stats.streak === 1 ? '' : 's'}</span>
        </p>
        <p className="text-sm text-slate-500 mt-1">
          Current streak of fully-completed cleaning days
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4">
        <p className="font-medium mb-3">Last 7 days</p>
        <div className="flex justify-between gap-1">
          {stats.last7.map(({ dateKey, total, done }) => {
            const complete = total > 0 && done === total;
            const partial = total > 0 && done > 0 && done < total;
            return (
              <div key={dateKey} className="flex-1 flex flex-col items-center gap-1">
                <div
                  title={`${done}/${total} done`}
                  className={`w-full h-10 rounded-md ${
                    complete
                      ? 'bg-teal-500'
                      : partial
                      ? 'bg-teal-200 dark:bg-teal-900'
                      : total > 0
                      ? 'bg-slate-200 dark:bg-slate-800'
                      : 'bg-transparent border border-dashed border-slate-200 dark:border-slate-800'
                  }`}
                />
                <span className="text-[10px] text-slate-400">
                  {dateKey.slice(8)}/{dateKey.slice(5, 7)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
