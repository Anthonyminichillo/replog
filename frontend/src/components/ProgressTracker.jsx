import { useState, useEffect } from 'react';
import ProgressChart from './ProgressChart.jsx';
import './ProgressTracker.css';

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Every exercise this user has logged, most-logged first
function getLoggedExercises(workouts) {
  const counts = new Map();
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      const existing = counts.get(exercise.exerciseId);
      if (existing) {
        existing.count += 1;
      } else {
        counts.set(exercise.exerciseId, {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          count: 1,
        });
      }
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

function filterExercises(exercises, search) {
  return exercises.filter((exercise) =>
    exercise.exerciseName.toLowerCase().includes(search.toLowerCase())
  );
}

function ProgressTracker() {
  const [loggedExercises, setLoggedExercises] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/workouts')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load workouts');
        }
        return res.json();
      })
      .then((data) => {
        const exercises = getLoggedExercises(data);
        setLoggedExercises(exercises);
        setSelectedId(exercises[0]?.exerciseId ?? '');
        setListLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setListLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    // If the user picks another exercise before this finishes, ignore it
    let ignore = false;

    Promise.all([
      fetch(`/api/workouts/progress/${selectedId}`),
      fetch(`/api/workouts/suggestion/${selectedId}`),
    ])
      .then((responses) => {
        if (responses.some((res) => !res.ok)) {
          throw new Error('Failed to load progress');
        }
        return Promise.all(responses.map((res) => res.json()));
      })
      .then(([progress, suggestion]) => {
        if (!ignore) {
          setResult({ exerciseId: selectedId, progress, suggestion });
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedId]);

  function handleSearchChange(value) {
    setSearch(value);
    const matches = filterExercises(loggedExercises, value);
    const selectedStillListed = matches.some(
      (exercise) => exercise.exerciseId === selectedId
    );
    if (matches.length > 0 && !selectedStillListed) {
      setSelectedId(matches[0].exerciseId);
    }
  }

  if (listLoading) {
    return <p>Loading progress...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (loggedExercises.length === 0) {
    return (
      <section className="progress-tracker">
        <h2>Progress</h2>
        <p>Log a workout first, then come back here to see your progress.</p>
      </section>
    );
  }

  const filteredExercises = filterExercises(loggedExercises, search);
  const loading = !result || result.exerciseId !== selectedId;
  const sessions = result?.progress.sessions ?? [];
  const isBodyweight = sessions.every((session) => session.topWeight === 0);
  const points = sessions.map((session) => ({
    date: session.date,
    value: isBodyweight ? session.totalReps : session.topWeight,
  }));

  return (
    <section className="progress-tracker">
      <h2>Progress</h2>
      <p className="workout-instructions">
        Search or choose an exercise you have logged to see your personal
        record, how your top weight has changed and what weight to use this
        week.
      </p>

      <label>
        Search
        <input
          type="search"
          placeholder="e.g. squat"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
        />
      </label>

      {filteredExercises.length === 0 ? (
        <p>No logged exercises match &quot;{search}&quot;.</p>
      ) : (
        <label>
          Exercise
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {filteredExercises.map((exercise) => (
              <option key={exercise.exerciseId} value={exercise.exerciseId}>
                {exercise.exerciseName} ({exercise.count} sessions)
              </option>
            ))}
          </select>
        </label>
      )}

      {loading ? (
        <p>Loading exercise...</p>
      ) : (
        <>
          <dl className="progress-summary">
            <div>
              <dt>Personal record</dt>
              <dd>
                {isBodyweight
                  ? 'Bodyweight'
                  : `${result.progress.personalRecord.weight} lb`}{' '}
                on {formatDate(result.progress.personalRecord.date)}
              </dd>
            </div>
            <div>
              <dt>Suggested this week</dt>
              <dd>
                {result.suggestion.suggestedWeight === null
                  ? 'No weight change'
                  : `${result.suggestion.suggestedWeight} lb`}
              </dd>
            </div>
            <div>
              <dt>Why</dt>
              <dd>{result.suggestion.reason}</dd>
            </div>
          </dl>

          {points.length < 2 ? (
            <p>Log this exercise at least twice to see a chart.</p>
          ) : (
            <ProgressChart
              points={points}
              label={isBodyweight ? 'Total reps' : 'Top weight'}
              unit={isBodyweight ? 'reps' : 'lb'}
            />
          )}
        </>
      )}
    </section>
  );
}

ProgressTracker.propTypes = {};

export default ProgressTracker;
