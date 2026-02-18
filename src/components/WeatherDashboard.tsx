import React, { useState } from 'react';
import { getCurrentWeather, getHistoricalWeather, getMarineWeather } from '../api/weatherstack';

type TabKey = 'current' | 'historical' | 'marine';

interface ApiState {
  loading: boolean;
  error: string | null;
  data: any | null;
}

const initialApiState: ApiState = {
  loading: false,
  error: null,
  data: null
};

export const WeatherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('current');
  const [location, setLocation] = useState('New York');
  const [units, setUnits] = useState<'m' | 's' | 'f'>('m');
  const [historicalDate, setHistoricalDate] = useState<string>('');
  const [marineCoords, setMarineCoords] = useState<string>('40.7128,-74.0060');
  const [state, setState] = useState<ApiState>(initialApiState);

  const handleFetch = async () => {
    setState({ ...initialApiState, loading: true });

    try {
      let data: any;

      if (activeTab === 'current') {
        data = await getCurrentWeather({ query: location, units });
      } else if (activeTab === 'historical') {
        if (!historicalDate) {
          throw new Error('Please select a historical date.');
        }
        data = await getHistoricalWeather({ query: location, date: historicalDate, units });
      } else {
        if (!marineCoords.includes(',')) {
          throw new Error('Please enter coordinates as "lat,lon".');
        }
        data = await getMarineWeather({ query: marineCoords, units });
      }

      setState({ loading: false, error: null, data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState({ loading: false, error: message, data: null });
    }
  };

  const renderSummary = () => {
    if (!state.data) return null;

    if (activeTab === 'current') {
      const d = state.data;
      return (
        <div className="card-grid">
          <div className="metric-card glass-sub">
            <h3>{d.location?.name}</h3>
            <p className="metric-main">
              {d.current?.temperature}
              <span className="metric-unit">°{units === 'f' ? 'F' : 'C'}</span>
            </p>
            <p className="metric-sub">{d.current?.weather_descriptions?.[0]}</p>
          </div>
          <div className="metric-card glass-sub">
            <h4>Details</h4>
            <p>Feels like: {d.current?.feelslike}°</p>
            <p>Humidity: {d.current?.humidity}%</p>
            <p>Wind: {d.current?.wind_speed} {units === 's' ? 'm/s' : 'km/h'}</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'historical') {
      const d = state.data;
      const dateKey = Object.keys(d.historical || {})[0];
      const day = dateKey ? d.historical[dateKey] : null;
      if (!day) return <p>No historical data found.</p>;
      return (
        <div className="card-grid">
          <div className="metric-card glass-sub">
            <h3>{d.location?.name}</h3>
            <p className="metric-main">
              {day.avgtemp}
              <span className="metric-unit">°{units === 'f' ? 'F' : 'C'}</span>
            </p>
            <p className="metric-sub">Average temperature on {dateKey}</p>
          </div>
          <div className="metric-card glass-sub">
            <h4>Details</h4>
            <p>Max: {day.maxtemp}°</p>
            <p>Min: {day.mintemp}°</p>
            <p>Precip: {day.totalprecip} mm</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'marine') {
      const d = state.data;
      const current = d.current || d.marine?.[0];
      if (!current) return <p>No marine data found.</p>;
      return (
        <div className="card-grid">
          <div className="metric-card glass-sub">
            <h3>Sea Surface</h3>
            <p className="metric-main">
              {current.sst || current.temperature}
              <span className="metric-unit">°{units === 'f' ? 'F' : 'C'}</span>
            </p>
            <p className="metric-sub">Sea surface temperature</p>
          </div>
          <div className="metric-card glass-sub">
            <h4>Details</h4>
            <p>Wave height: {current.wave_height ?? '—'}</p>
            <p>Wind speed: {current.wind_speed ?? '—'}</p>
            <p>Visibility: {current.visibility ?? '—'}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <section className="dashboard glass">
      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'current' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Current
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'historical' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('historical')}
        >
          Historical
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'marine' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('marine')}
        >
          Marine
        </button>
      </div>

      <div className="filters">
        {activeTab !== 'marine' && (
          <div className="field">
            <label>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, ZIP, or coordinates"
            />
          </div>
        )}

        {activeTab === 'historical' && (
          <div className="field">
            <label>Historical date</label>
            <input
              type="date"
              value={historicalDate}
              onChange={(e) => setHistoricalDate(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'marine' && (
          <div className="field">
            <label>Coordinates (lat,lon)</label>
            <input
              type="text"
              value={marineCoords}
              onChange={(e) => setMarineCoords(e.target.value)}
              placeholder="e.g. 40.7128,-74.0060"
            />
          </div>
        )}

        <div className="field">
          <label>Units</label>
          <select value={units} onChange={(e) => setUnits(e.target.value as 'm' | 's' | 'f')}>
            <option value="m">Metric (°C, km/h)</option>
            <option value="s">Scientific (K, m/s)</option>
            <option value="f">Imperial (°F, mph)</option>
          </select>
        </div>

        <button type="button" className="primary-button" onClick={handleFetch} disabled={state.loading}>
          {state.loading ? 'Loading…' : 'Fetch weather'}
        </button>
      </div>

      <div className="results">
        {state.error && <div className="alert alert-error">{state.error}</div>}
        {!state.error && !state.data && !state.loading && (
          <p className="hint">Fill in filters and click &quot;Fetch weather&quot; to see data.</p>
        )}
        {renderSummary()}
        {state.data && (
          <details className="raw-json">
            <summary>Raw API response</summary>
            <pre>{JSON.stringify(state.data, null, 2)}</pre>
          </details>
        )}
      </div>
    </section>
  );
};

