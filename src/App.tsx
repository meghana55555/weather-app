import React from 'react';
import { WeatherDashboard } from './components/WeatherDashboard';

export const App: React.FC = () => {
  return (
    <div className="app-root">
      <div className="bg-gradient" />
      <div className="bg-gradient bg-gradient-2" />
      <main className="app-shell">
        <header className="app-header glass">
          <div>
            <h1>Glassmorphic Weather</h1>
            <p>Real-time, historical &amp; marine data via Weatherstack</p>
          </div>
          <span className="badge">Weatherstack API</span>
        </header>
        <WeatherDashboard />
        <footer className="app-footer">
          <span>
            Data by <a href="https://weatherstack.com" target="_blank" rel="noreferrer">Weatherstack</a>
          </span>
        </footer>
      </main>
    </div>
  );
};

