import React, { useState } from 'react';
import { SESSION_TYPES, SHOULDER_PREHAB, KNEE_REHAB, CONSTRAINTS } from '../data/plan.js';

export default function PlanEditor({ weeks, onSavePlan }) {
  const today = new Date().toISOString().split('T')[0];
  const currentWeekIdx = weeks.findIndex(w => {
    const dates = Object.keys(w.days);
    return dates[0] <= today && today <= dates[dates.length - 1];
  });
  // Default to next week if it's Sunday, otherwise current week
  const isSunday = new Date().getDay() === 0;
  const defaultIdx = isSunday ? Math.min(currentWeekIdx + 1, weeks.length - 1) : Math.max(0, currentWeekIdx);
  const [weekIdx, setWeekIdx] = useState(defaultIdx);
  const [editWeek, setEditWeek] = useState(JSON.parse(JSON.stringify(weeks[weekIdx])));
  const [expandedDays, setExpandedDays] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const week = editWeek;
  const days = Object.values(week.days).sort((a, b) => a.date.localeCompare(b.date));

  function changeWeek(newIdx) {
    setWeekIdx(newIdx);
    setEditWeek(JSON.parse(JSON.stringify(weeks[newIdx])));
    setExpandedDays({});
    setSaved(false);
  }

  function toggleDay(date) {
    setExpandedDays(prev => ({ ...prev, [date]: !prev[date] }));
  }

  function updateNotes(field, value) {
    setEditWeek(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function updateExercise(date, sessionIdx, exerciseIdx, field, value) {
    setEditWeek(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.days[date].sessions[sessionIdx].exercises[exerciseIdx][field] = value;
      return next;
    });
    setSaved(false);
  }

  function removeExercise(date, sessionIdx, exerciseIdx) {
    setEditWeek(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.days[date].sessions[sessionIdx].exercises.splice(exerciseIdx, 1);
      return next;
    });
    setSaved(false);
  }

  function addExercise(date, sessionIdx) {
    setEditWeek(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.days[date].sessions[sessionIdx].exercises.push({
        id: `${date}-custom-${Date.now()}`,
        name: '',
        sets: 3,
        reps: '10',
        notes: '',
      });
      return next;
    });
    setSaved(false);
  }

  function addSession(date) {
    setEditWeek(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.days[date].sessions.push({
        id: `${date}-session-${Date.now()}`,
        type: 'strength',
        title: 'New Session',
        exercises: [],
      });
      return next;
    });
    setSaved(false);
  }

  function removeSession(date, sessionIdx) {
    setEditWeek(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.days[date].sessions.splice(sessionIdx, 1);
      return next;
    });
    setSaved(false);
  }

  function updateSessionType(date, sessionIdx, type) {
    setEditWeek(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.days[date].sessions[sessionIdx].type = type;
      return next;
    });
    setSaved(false);
  }

  function updateSessionTitle(date, sessionIdx, title) {
    setEditWeek(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.days[date].sessions[sessionIdx].title = title;
      return next;
    });
    setSaved(false);
  }

  function addPrehabToDay(date) {
    setEditWeek(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      // Add shoulder prehab as first session
      const prehabSession = {
        id: `${date}-prehab`,
        type: 'prehab',
        title: 'Shoulder Prehab Circuit',
        exercises: SHOULDER_PREHAB.exercises.map(e => ({
          ...e,
          id: `${date}-${e.id}`,
        })),
      };
      next.days[date].sessions.unshift(prehabSession);
      return next;
    });
    setSaved(false);
  }

  function addRehabToDay(date) {
    setEditWeek(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const rehabSession = {
        id: `${date}-rehab`,
        type: 'rehab',
        title: 'Knee Rehab',
        exercises: KNEE_REHAB.exercises.map(e => ({
          ...e,
          id: `${date}-${e.id}`,
        })),
      };
      next.days[date].sessions.push(rehabSession);
      return next;
    });
    setSaved(false);
  }

  function replaceWithClass(date) {
    setEditWeek(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      // Keep prehab/rehab sessions, replace others with a class
      const kept = next.days[date].sessions.filter(s => s.type === 'prehab' || s.type === 'rehab');
      kept.push({
        id: `${date}-class-${Date.now()}`,
        type: 'class',
        title: 'Class (e.g. F45, Barry\'s)',
        exercises: [
          { id: `${date}-class-ex`, name: 'Class session', sets: 1, reps: 'Full class', notes: 'Update with class name' },
        ],
      });
      next.days[date].sessions = kept;
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await onSavePlan(weekIdx, editWeek);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="fade-in">
      <div className="week-header">
        <div className="week-label">Edit: {week.label}</div>
        <div className="week-nav">
          <button onClick={() => changeWeek(weekIdx - 1)} disabled={weekIdx === 0}>&larr;</button>
          <button onClick={() => changeWeek(weekIdx + 1)} disabled={weekIdx >= weeks.length - 1}>&rarr;</button>
        </div>
      </div>

      {/* Constraints reminder */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 6 }}>Physio Constraints</div>
        <ul className="constraints-list">
          {CONSTRAINTS.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </div>

      {/* Gym plan + physio notes */}
      <div className="plan-section">
        <label>Gym Plan Notes (this week)</label>
        <textarea
          className="plan-textarea"
          value={week.gymPlanNotes || ''}
          onChange={e => updateNotes('gymPlanNotes', e.target.value)}
          placeholder="Paste your gym plan for the week here..."
        />
      </div>

      <div className="plan-section">
        <label>Physio Notes / Updates</label>
        <textarea
          className="plan-textarea"
          value={week.physioNotes || ''}
          onChange={e => updateNotes('physioNotes', e.target.value)}
          placeholder="Any updates from physio this week..."
        />
      </div>

      {/* Day editors */}
      <h3 className="section-heading">Daily Plan</h3>

      {days.map(day => {
        const isOpen = expandedDays[day.date];
        const hasPrehab = day.sessions.some(s => s.type === 'prehab');
        const hasRehab = day.sessions.some(s => s.type === 'rehab');

        return (
          <div key={day.date} className="day-editor">
            <div className="day-editor-header" onClick={() => toggleDay(day.date)}>
              <div>
                <span style={{ fontWeight: 700, marginRight: 8 }}>{day.dayName}</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                  {formatShortDate(day.date)}
                </span>
              </div>
              <span className={`chevron ${isOpen ? 'open' : ''}`}>&#9660;</span>
            </div>

            {isOpen && (
              <div className="day-editor-content">
                {/* Quick action buttons */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {!hasPrehab && (
                    <button className="btn btn-small btn-ghost" onClick={() => addPrehabToDay(day.date)}>
                      + Shoulder Prehab
                    </button>
                  )}
                  {!hasRehab && (
                    <button className="btn btn-small btn-ghost" onClick={() => addRehabToDay(day.date)}>
                      + Knee Rehab
                    </button>
                  )}
                  <button className="btn btn-small btn-ghost" onClick={() => replaceWithClass(day.date)}>
                    Replace with Class
                  </button>
                </div>

                {day.sessions.map((session, si) => (
                  <div key={session.id} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <select
                        className="type-select"
                        value={session.type}
                        onChange={e => updateSessionType(day.date, si, e.target.value)}
                      >
                        {Object.entries(SESSION_TYPES).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                      <input
                        style={{
                          flex: 1,
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          color: 'var(--text)',
                          fontSize: 13,
                          padding: '4px 8px',
                          fontWeight: 600,
                        }}
                        value={session.title}
                        onChange={e => updateSessionTitle(day.date, si, e.target.value)}
                      />
                      <button className="remove-btn" onClick={() => removeSession(day.date, si)}>
                        &times;
                      </button>
                    </div>

                    {session.exercises.map((ex, ei) => (
                      <div key={ex.id || ei} className="exercise-editor-row">
                        <input
                          className="input-name"
                          value={ex.name}
                          onChange={e => updateExercise(day.date, si, ei, 'name', e.target.value)}
                          placeholder="Exercise name"
                        />
                        <input
                          className="input-sets"
                          value={ex.sets || ''}
                          onChange={e => updateExercise(day.date, si, ei, 'sets', e.target.value)}
                          placeholder="Sets"
                        />
                        <input
                          className="input-reps"
                          value={ex.reps || ''}
                          onChange={e => updateExercise(day.date, si, ei, 'reps', e.target.value)}
                          placeholder="Reps"
                        />
                        <button className="remove-btn" onClick={() => removeExercise(day.date, si, ei)}>
                          &times;
                        </button>
                      </div>
                    ))}

                    <button className="add-exercise-btn" onClick={() => addExercise(day.date, si)}>
                      + Add exercise
                    </button>
                  </div>
                ))}

                <button className="add-session-btn" onClick={() => addSession(day.date)}>
                  + Add session
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Save button */}
      <div style={{ padding: '20px 0' }}>
        <button
          className={`btn btn-full ${saved ? '' : 'btn-primary'}`}
          onClick={handleSave}
          disabled={saving}
          style={saved ? { background: 'var(--green)', color: 'white' } : {}}
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Week Plan'}
        </button>
      </div>
    </div>
  );
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
