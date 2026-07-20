import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AppData, ScheduleSettings, TaskTemplate } from '../types';
import * as api from '../api/client';

interface AppDataContextValue {
  data: AppData | null;
  loading: boolean;
  error: string | null;
  toggleComplete: (scheduledTaskId: string) => Promise<void>;
  moveTask: (scheduledTaskId: string, newDate: string) => Promise<void>;
  updateSettings: (settings: ScheduleSettings) => Promise<void>;
  saveTemplates: (templates: TaskTemplate[]) => Promise<void>;
  reload: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const fresh = await api.fetchData();
      setData(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  // Phones/tablets keep the page's JS alive in the background instead of
  // reloading it, so switching back to the app (or the browser tab) needs an
  // explicit refetch to pick up changes made elsewhere - otherwise it just
  // keeps showing whatever was last loaded into memory.
  useEffect(() => {
    function onFocusRegain() {
      if (document.visibilityState === 'visible') reload();
    }
    document.addEventListener('visibilitychange', onFocusRegain);
    window.addEventListener('focus', onFocusRegain);
    return () => {
      document.removeEventListener('visibilitychange', onFocusRegain);
      window.removeEventListener('focus', onFocusRegain);
    };
  }, [reload]);

  const toggleComplete = useCallback(
    async (scheduledTaskId: string) => {
      if (!data) return;
      const updated: AppData = {
        ...data,
        scheduledTasks: data.scheduledTasks.map((t) =>
          t.id === scheduledTaskId
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed ? new Date().toISOString() : undefined,
              }
            : t
        ),
      };
      setData(updated);
      await api.saveData(updated);
    },
    [data]
  );

  const moveTask = useCallback(
    async (scheduledTaskId: string, newDate: string) => {
      if (!data) return;
      const updated: AppData = {
        ...data,
        scheduledTasks: data.scheduledTasks.map((t) =>
          t.id === scheduledTaskId ? { ...t, date: newDate, pinned: true } : t
        ),
      };
      setData(updated);
      await api.saveData(updated);
    },
    [data]
  );

  const updateSettings = useCallback(async (settings: ScheduleSettings) => {
    const fresh = await api.regenerate(settings);
    setData(fresh);
  }, []);

  const saveTemplates = useCallback(
    async (templates: TaskTemplate[]) => {
      if (!data) return;
      const updated: AppData = { ...data, taskTemplates: templates };
      setData(updated);
      await api.saveData(updated);
    },
    [data]
  );

  return (
    <AppDataContext.Provider
      value={{ data, loading, error, toggleComplete, moveTask, updateSettings, saveTemplates, reload }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
