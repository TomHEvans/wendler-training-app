import React from 'react';
import { SESSION_TYPES } from '../data/plan.js';

export default function DayDetail({ day, completions, onToggle, onBack }) {
  let total = 0;
  let done = 0;
  day.sessions.forEach(s => {
    s.exercises.forEach(e => {
      total++;
      if (completions[e.id]) done++;
    });
  });
  const progress = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="fade-in">
      <button className="back-btn" onClick={onBack}>
        &larr; Back to week
      </button>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{day.dayName}</h2>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{formatDate(day.date)}</span>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-dim)' }}>{day.label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="day-completion">{done}/{total}</span>
        </div>
      </div>

      {day.sessions.map(session => (
        <div key={session.id} className="card session">
          <div className="session-header">
            <span
              className="session-type-badge"
              style={{
                background: (SESSION_TYPES[session.type]?.color || '#666') + '22',
                color: SESSION_TYPES[session.type]?.color || '#666',
              }}
            >
              {SESSION_TYPES[session.type]?.label || session.type}
            </span>
            <span className="session-title">{session.title}</span>
          </div>

          <ul className="exercise-list">
            {session.exercises.map(exercise => {
              const isDone = completions[exercise.id] || false;
              return (
                <li key={exercise.id} className="exercise-item">
                  <button
                    className={`exercise-check ${isDone ? 'checked' : ''}`}
                    onClick={() => onToggle(exercise.id, day.date, !isDone)}
                    aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                  />
                  <div className="exercise-info">
                    <div className={`exercise-name ${isDone ? 'completed' : ''}`}>
                      {exercise.name}
                    </div>
                    <div className="exercise-detail">
                      {exercise.sets && `${exercise.sets} sets`}
                      {exercise.reps && ` x ${exercise.reps}`}
                      {exercise.weight && ` @ ${exercise.weight}`}
                      {exercise.hold && ` (${exercise.hold} hold)`}
                    </div>
                    {exercise.notes && (
                      <div className="exercise-notes">{exercise.notes}</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}
