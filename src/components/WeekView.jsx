import React, { useState } from 'react';
import { SESSION_TYPES } from '../data/plan.js';
import DayDetail from './DayDetail.jsx';

export default function WeekView({ weeks, completions, onToggle }) {
  const today = new Date().toISOString().split('T')[0];

  // Find current week index
  const currentWeekIdx = weeks.findIndex(w => {
    const dates = Object.keys(w.days);
    return dates.includes(today) || (dates[0] <= today && today <= dates[dates.length - 1]);
  });
  const [weekIdx, setWeekIdx] = useState(Math.max(0, currentWeekIdx));
  const [selectedDay, setSelectedDay] = useState(null);

  const week = weeks[weekIdx];
  if (!week) return <div className="empty-state"><p>No plan loaded yet.</p></div>;

  const days = Object.values(week.days).sort((a, b) => a.date.localeCompare(b.date));

  if (selectedDay) {
    const dayData = week.days[selectedDay];
    if (dayData) {
      return (
        <DayDetail
          day={dayData}
          completions={completions[selectedDay] || {}}
          onToggle={onToggle}
          onBack={() => setSelectedDay(null)}
        />
      );
    }
  }

  return (
    <div className="fade-in">
      <div className="week-header">
        <div className="week-label">{week.label}</div>
        <div className="week-nav">
          <button onClick={() => setWeekIdx(i => i - 1)} disabled={weekIdx === 0}>
            &larr;
          </button>
          <button onClick={() => setWeekIdx(i => i + 1)} disabled={weekIdx >= weeks.length - 1}>
            &rarr;
          </button>
        </div>
      </div>

      {week.gymPlanNotes && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-subtitle" style={{ marginBottom: 4 }}>Gym Plan Notes</div>
          <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{week.gymPlanNotes}</div>
        </div>
      )}

      {week.physioNotes && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-subtitle" style={{ marginBottom: 4 }}>Physio Notes</div>
          <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{week.physioNotes}</div>
        </div>
      )}

      {days.map(day => {
        const dayCompletions = completions[day.date] || {};
        let total = 0;
        let done = 0;
        day.sessions.forEach(s => {
          s.exercises.forEach(e => {
            total++;
            if (dayCompletions[e.id]) done++;
          });
        });

        const isToday = day.date === today;
        const progress = total > 0 ? (done / total) * 100 : 0;

        return (
          <div
            key={day.date}
            className={`day-card ${isToday ? 'today' : ''}`}
            onClick={() => setSelectedDay(day.date)}
          >
            <div className="day-card-top">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="day-name">{day.dayName}</span>
                {isToday && <span className="today-badge">Today</span>}
              </div>
              <span className="day-date-label">{formatShortDate(day.date)}</span>
            </div>
            <div className="day-label">{day.label}</div>
            <div className="day-badges">
              {day.sessions.map(s => (
                <span
                  key={s.id}
                  className="session-type-badge"
                  style={{
                    background: (SESSION_TYPES[s.type]?.color || '#666') + '22',
                    color: SESSION_TYPES[s.type]?.color || '#666',
                  }}
                >
                  {SESSION_TYPES[s.type]?.label || s.type}
                </span>
              ))}
              {total > 0 && (
                <span className="day-completion" style={{ marginLeft: 'auto' }}>
                  {done}/{total}
                </span>
              )}
            </div>
            {total > 0 && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
