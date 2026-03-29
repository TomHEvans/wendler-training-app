import React from 'react';
import { getDaysUntilRace, getWeeksUntilRace, RACE_DATE, RACE_NAME, SESSION_TYPES } from '../data/plan.js';

export default function Dashboard({ weeks, completions, onSelectDay, onToggle }) {
  const daysLeft = getDaysUntilRace();
  const weeksLeft = getWeeksUntilRace();
  const today = new Date().toISOString().split('T')[0];

  // Find today's plan
  let todayPlan = null;
  let todayWeek = null;
  for (const week of weeks) {
    if (week.days[today]) {
      todayPlan = week.days[today];
      todayWeek = week;
      break;
    }
  }

  const todayCompletions = completions[today] || {};

  // Count total exercises and completed for today
  let totalExercises = 0;
  let completedExercises = 0;
  if (todayPlan) {
    todayPlan.sessions.forEach(s => {
      s.exercises.forEach(e => {
        totalExercises++;
        if (todayCompletions[e.id]) completedExercises++;
      });
    });
  }

  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Physio frequency this week - count days with completed prehab/rehab
  const weekPrehabDays = new Set();
  const weekRehabDays = new Set();
  if (todayWeek) {
    Object.entries(todayWeek.days).forEach(([date, day]) => {
      const dayCompletions = completions[date] || {};
      day.sessions.forEach(s => {
        if (s.type === 'prehab') {
          const done = s.exercises.some(e => dayCompletions[e.id]);
          if (done) weekPrehabDays.add(date);
        }
        if (s.type === 'rehab') {
          const done = s.exercises.some(e => dayCompletions[e.id]);
          if (done) weekRehabDays.add(date);
        }
      });
    });
  }

  return (
    <div className="fade-in">
      {/* Countdown */}
      <div className="countdown">
        <div className="countdown-number">{daysLeft}</div>
        <div className="countdown-label">
          days to {RACE_NAME} ({weeksLeft} weeks)
        </div>
        <div className="countdown-date">Race day: {formatDate(RACE_DATE)}</div>
      </div>

      {/* Physio frequency tracker */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 10 }}>This Week's Physio</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Shoulder Prehab</div>
            <div className="freq-tracker">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`freq-dot ${i < weekPrehabDays.size ? 'done' : ''}`} />
              ))}
              <span className="freq-label">{weekPrehabDays.size}/4</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>Knee Rehab</div>
            <div className="freq-tracker">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`freq-dot ${i < weekRehabDays.size ? 'done' : ''}`} />
              ))}
              <span className="freq-label">{weekRehabDays.size}/4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's training */}
      {todayPlan ? (
        <div>
          <div className="card-header" style={{ padding: '0' }}>
            <div>
              <div className="card-title">Today - {todayPlan.dayName}</div>
              <div className="card-subtitle">{todayPlan.label}</div>
            </div>
            <div className="day-completion">
              {completedExercises}/{totalExercises}
            </div>
          </div>

          <div className="progress-bar" style={{ marginBottom: 16 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {todayPlan.sessions.map(session => (
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
                  const done = todayCompletions[exercise.id] || false;
                  return (
                    <li key={exercise.id} className="exercise-item">
                      <button
                        className={`exercise-check ${done ? 'checked' : ''}`}
                        onClick={() => onToggle(exercise.id, today, !done)}
                        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                      />
                      <div className="exercise-info">
                        <div className={`exercise-name ${done ? 'completed' : ''}`}>
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
      ) : (
        <div className="card empty-state">
          <p>No training planned for today.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Enjoy your rest day!</p>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
