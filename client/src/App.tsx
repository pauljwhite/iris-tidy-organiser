import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AppDataProvider } from './state/AppDataContext';
import { getGithubConfig } from './api/github';
import ConnectPage from './pages/ConnectPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import SetupPage from './pages/SetupPage';
import StatsPage from './pages/StatsPage';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? 'bg-teal-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`;

function App() {
  const [connected, setConnected] = useState(() => !!getGithubConfig());

  if (!connected) {
    return <ConnectPage onConnected={() => setConnected(true)} />;
  }

  return (
    <AppDataProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
          <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-lg font-semibold">🧹 Iris Tidy Organiser</h1>
              <nav className="flex flex-wrap gap-1">
                <NavLink to="/" end className={navLinkClass}>
                  Calendar
                </NavLink>
                <NavLink to="/settings" className={navLinkClass}>
                  Settings
                </NavLink>
                <NavLink to="/rooms" className={navLinkClass}>
                  Rooms &amp; Tasks
                </NavLink>
                <NavLink to="/stats" className={navLinkClass}>
                  Stats
                </NavLink>
              </nav>
            </div>
          </header>
          <main className="max-w-5xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<CalendarPage />} />
              <Route path="/settings" element={<SettingsPage onDisconnected={() => setConnected(false)} />} />
              <Route path="/rooms" element={<SetupPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppDataProvider>
  );
}

export default App;
