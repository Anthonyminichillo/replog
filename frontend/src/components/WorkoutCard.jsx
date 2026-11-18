import PropTypes from 'prop-types';

function formatDate(date) {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatSet(set) {
  if (set.weight === 0) {
    return `${set.reps} reps`;
  }
  return `${set.reps} × ${set.weight} lb`;
}

function WorkoutCard({ workout, onDelete }) {
  return (
    <article className="workout-card">
      <header>
        <h3>{formatDate(workout.date)}</h3>
        {workout.durationMinutes !== null && (
          <p>{workout.durationMinutes} minutes</p>
        )}
      </header>

      <ul className="workout-exercises">
        {workout.exercises.map((exercise, index) => (
          <li key={`${exercise.exerciseId}-${index}`}>
            <strong>{exercise.exerciseName}</strong>
            <span>{exercise.sets.map(formatSet).join(', ')}</span>
          </li>
        ))}
      </ul>

      {workout.notes && <p className="workout-notes">{workout.notes}</p>}

      <button type="button" onClick={() => onDelete(workout._id)}>
        Delete
      </button>
    </article>
  );
}

WorkoutCard.propTypes = {
  workout: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    durationMinutes: PropTypes.number,
    notes: PropTypes.string,
    exercises: PropTypes.arrayOf(
      PropTypes.shape({
        exerciseId: PropTypes.string.isRequired,
        exerciseName: PropTypes.string.isRequired,
        sets: PropTypes.arrayOf(
          PropTypes.shape({
            reps: PropTypes.number.isRequired,
            weight: PropTypes.number.isRequired,
          })
        ).isRequired,
      })
    ).isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default WorkoutCard;