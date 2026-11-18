import { useState, useEffect } from 'react';
import WorkoutCard from './WorkoutCard.jsx';

const PAGE_SIZE = 20;
const DAY_MS = 1000 * 60 * 60 * 24;

function getStats(workouts) {
  const now = Date.now();
  const daysAgo = (workout) => (now - new Date(workout.date)) / DAY_MS;

  return {
    lastWeek: workouts.filter((workout) => daysAgo(workout) <= 7).length,
    lastMonth: workouts.filter((workout) => daysAgo(workout) <= 30).length,
    daysSinceLast:
      workouts.length > 0
        ? Math.max(0, Math.floor(daysAgo(workouts[0])))
        : null,
  };
}

function WorkoutHistory() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetch('/api/workouts')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load workouts');
        }
        return res.json();
      })
      .then((data) => {
        setWorkouts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  async function handleDelete(workoutId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this workout?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Unable to delete workout');
      }

      setWorkouts((current) =>
        current.filter((workout) => workout._id !== workoutId)
      );
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p>Loading workouts...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const stats = getStats(workouts);

  return (
    <section className="workout-history">
      <h2>Workout History</h2>
      <p className="workout-instructions">
        Your logged workouts, newest first. Use the numbers below to check how
        consistent you have been, and delete any workout logged by mistake.
      </p>

      <dl className="workout-stats">
        <div>
          <dt>Last 7 days</dt>
          <dd>{stats.lastWeek} workouts</dd>
        </div>
        <div>
          <dt>Last 30 days</dt>
          <dd>{stats.lastMonth} workouts</dd>
        </div>
        <div>
          <dt>Since last workout</dt>
          <dd>
            {stats.daysSinceLast === null
              ? 'No workouts yet'
              : `${stats.daysSinceLast} days`}
          </dd>
        </div>
      </dl>

      {workouts.length === 0 ? (
        <p>No workouts logged yet.</p>
      ) : (
        <div className="workout-list">
          {workouts.slice(0, visibleCount).map((workout) => (
            <WorkoutCard
              key={workout._id}
              workout={workout}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {visibleCount < workouts.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
        >
          Show more
        </button>
      )}
    </section>
  );
}

WorkoutHistory.propTypes = {};

export default WorkoutHistory;