import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { storage, hasSupabase } from './lib/supabase.js';
import { generateInitialPlan } from './data/plan.js';
import Dashboard from './components/Dashboard.jsx';
import WeekView from './components/WeekView.jsx';
import PlanEditor from './components/PlanEditor.jsx';
import Changelog from './components/Changelog.jsx';

export default function App() {
  const [tab, setTab] = useState('today');
  const [weeks, setWeeks] = useState([]);
  const [completions, setCompletions] = useState({});
  const [changelog, setChangelog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const allPlans = await storage.getAllPlans();

      let planWeeks;
      if (allPlans.length > 0) {
        planWeeks = allPlans;
      } else {
        // First run: generate initial plan and save
        planWeeks = generateInitialPlan();
        for (const week of planWeeks) {
          await storage.savePlan(week.id, week);
        }
        await storage.addChangelog('Plan Created', 'Initial 5-week Hyrox training plan generated', null);
      }
      setWeeks(planWeeks);

      // Load completions for all dates in the plan
      const completionsMap = {};
      for (const week of planWeeks) {
        for (const date of Object.keys(week.days)) {
          const dayCompletions = await storage.getCompletions(date);
          if (Object.keys(dayCompletions).length > 0) {
            completionsMap[date] = dayCompletions;
          }
        }
      }
      setCompletions(completionsMap);

      const logs = await storage.getChangelog();
      setChangelog(logs);
    } catch (err) {
      console.error('Error loading data:', err);
    }
    setLoading(false);
  }

  const handleToggle = useCallback(async (exerciseId, date, completed) => {
    setCompletions(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [exerciseId]: completed,
      },
    }));

    await storage.toggleCompletion(exerciseId, date, completed);
    const action = completed ? 'Exercise Completed' : 'Exercise Uncompleted';
    await storage.addChangelog(action, `${exerciseId} on ${date}`, null);
    const logs = await storage.getChangelog();
    setChangelog(logs);
  }, []);

  const handleSavePlan = useCallback(async (weekIdx, updatedWeek) => {
    await storage.savePlan(updatedWeek.id, updatedWeek);

    const details = [];
    if (updatedWeek.gymPlanNotes) details.push(`Gym plan: ${updatedWeek.gymPlanNotes.substring(0, 100)}`);
    if (updatedWeek.physioNotes) details.push(`Physio: ${updatedWeek.physioNotes.substring(0, 100)}`);
    details.push(`${Object.keys(updatedWeek.days).length} days updated`);

    await storage.addChangelog('Weekly Plan Updated', details.join('\n'), updatedWeek.id);

    setWeeks(prev => {
      const next = [...prev];
      next[weekIdx] = updatedWeek;
      return next;
    });

    const logs = await storage.getChangelog();
    setChangelog(logs);
  }, []);

  if (loading) {
    return (
      <div className="app">
        <div className="app-header"><h1>Hyrox Prep</h1></div>
        <div className="empty-state"><p>Loading training plan...</p></div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>Hyrox Prep</h1>
        <span className={`storage-badge ${hasSupabase ? '' : 'local'}`}>
          {hasSupabase ? 'Cloud' : 'Local'}
        </span>
      </div>

      {tab === 'today' && (
        <Dashboard weeks={weeks} completions={completions} onToggle={handleToggle} />
      )}
      {tab === 'week' && (
        <WeekView weeks={weeks} completions={completions} onToggle={handleToggle} />
      )}
      {tab === 'plan' && (
        <PlanEditor weeks={weeks} onSavePlan={handleSavePlan} />
      )}
      {tab === 'log' && (
        <Changelog logs={changelog} />
      )}

      <nav className="bottom-nav">
        <button className={`nav-item ${tab === 'today' ? 'active' : ''}`} onClick={() => setTab('today')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Today
        </button>
        <button className={`nav-item ${tab === 'week' ? 'active' : ''}`} onClick={() => setTab('week')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Week
        </button>
        <button className={`nav-item ${tab === 'plan' ? 'active' : ''}`} onClick={() => setTab('plan')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Plan
        </button>
        <button className={`nav-item ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Log
        </button>
      </nav>
    </div>
  );
}
