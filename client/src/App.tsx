import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { TodayPage } from "./pages/TodayPage";
import { CalendarPage } from "./pages/CalendarPage";
import { EntriesPage } from "./pages/EntriesPage";

export function App() {
  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">📓 Micro Journal</h1>
        <nav className="nav">
          <NavLink to="/" end>
            Today
          </NavLink>
          <NavLink to="/calendar">Calendar</NavLink>
          <NavLink to="/entries">Entries</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/entries" element={<EntriesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
