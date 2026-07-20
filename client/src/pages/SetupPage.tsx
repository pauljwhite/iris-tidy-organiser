import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../state/AppDataContext';
import RoomEditor from '../components/RoomEditor';
import type { TaskTemplate } from '../types';

let nextTempId = 1;

export default function SetupPage() {
  const { data, loading, saveTemplates } = useAppData();
  const [templates, setTemplates] = useState<TaskTemplate[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setTemplates(data.taskTemplates);
  }, [data]);

  if (loading || !templates || !data) {
    return <p className="text-slate-500">Loading rooms &amp; tasks…</p>;
  }

  function updateTask(id: string, patch: Partial<TaskTemplate>) {
    setTemplates((prev) => prev!.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function deleteTask(id: string) {
    setTemplates((prev) => prev!.filter((t) => t.id !== id));
  }

  function addTask(roomId: string) {
    const id = `custom-${Date.now()}-${nextTempId++}`;
    setTemplates((prev) => [
      ...prev!,
      { id, roomId, name: 'New task', estimatedMinutes: 10, frequency: 'weekly', robot: null },
    ]);
  }

  async function handleSave() {
    if (!templates) return;
    setSaving(true);
    setSaved(false);
    await saveTemplates(templates);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h2 className="text-xl font-semibold mb-1">Rooms &amp; tasks</h2>
        <p className="text-sm text-slate-500">
          Edit tasks, time estimates, frequency and which robot vacuum covers a room. After
          saving, head to{' '}
          <Link to="/settings" className="text-teal-600 hover:underline font-medium">
            Settings
          </Link>{' '}
          and hit "Regenerate schedule" to see changes reflected this week.
        </p>
      </div>

      {data.rooms.map((room) => (
        <RoomEditor
          key={room.id}
          room={room}
          tasks={templates.filter((t) => t.roomId === room.id)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onAdd={addTask}
        />
      ))}

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur px-4 py-3">
        <div className="max-w-5xl mx-auto flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-md bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-medium transition-colors"
          >
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
