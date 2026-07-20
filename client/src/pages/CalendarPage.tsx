import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../state/AppDataContext';
import DayColumn from '../components/DayColumn';
import { todayKey } from '../utils/date';

export default function CalendarPage() {
  const { data, loading, error, toggleComplete, moveTask } = useAppData();
  const today = todayKey();

  const handleDropTask = useCallback(
    (taskId: string, dateKey: string) => {
      const task = data?.scheduledTasks.find((t) => t.id === taskId);
      if (task && task.date !== dateKey) moveTask(taskId, dateKey);
    },
    [data, moveTask]
  );

  const byDate = useMemo(() => {
    if (!data) return new Map<string, typeof data.scheduledTasks>();
    const map = new Map<string, typeof data.scheduledTasks>();
    for (const task of data.scheduledTasks) {
      if (!map.has(task.date)) map.set(task.date, []);
      map.get(task.date)!.push(task);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.roomId.localeCompare(b.roomId));
    }
    return map;
  }, [data]);

  if (loading) return <p className="text-slate-500">Loading your schedule…</p>;
  if (error) return <p className="text-red-500">Couldn't load your schedule: {error}</p>;
  if (!data) return null;

  const dates = Array.from(byDate.keys()).sort();
  const weekMinutes = data.scheduledTasks.reduce((s, t) => s + t.estimatedMinutes, 0);
  const weekDone = data.scheduledTasks.filter((t) => t.completed).length;

  if (dates.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-3">No schedule generated yet.</p>
        <Link to="/settings" className="text-teal-600 font-medium hover:underline">
          Go to Settings to set your cleaning days
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xl font-semibold">This week</h2>
        <p className="text-sm text-slate-500">
          {weekDone}/{data.scheduledTasks.length} tasks done · {weekMinutes} min total
        </p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {dates.map((dateKey) => (
          <DayColumn
            key={dateKey}
            dateKey={dateKey}
            tasks={byDate.get(dateKey) ?? []}
            rooms={data.rooms}
            isToday={dateKey === today}
            onToggle={toggleComplete}
            onDropTask={handleDropTask}
          />
        ))}
      </div>
    </div>
  );
}
