import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const MAX_MATCHES = 50;

// Turns a date into the "YYYY-MM-DD" format a date input expects, in local time
function toDateInput(value) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function todayString() {
  return toDateInput(new Date());
}

function WorkoutForm({ initialWorkout, onSaved, onCancel }) {
  const isEditing = Boolean(initialWorkout);

  const [allExercises, setAllExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [date, setDate] = useState(() =>
    isEditing ? toDateInput(initialWorkout.date) : todayString()
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialWorkout?.durationMinutes ?? ''
  );
  const [notes, setNotes] = useState(initialWorkout?.notes ?? '');
  const [exercises, setExercises] = useState(initialWorkout?.exercises ?? []);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/exercises')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load exercises');
        }
        return res.json();
      })
      .then((data) => setAllExercises(data))
      .catch((err) => setError(err.message));
  }, []);

  const matches = allExercises
    .filter((exercise) =>
      exercise.name.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, MAX_MATCHES);

  function handleAddExercise() {
    const exercise = allExercises.find((item) => item._id === selectedId);
    if (!exercise) {
      return;
    }

    setExercises((current) => [
      ...current,
      {
        exerciseId: exercise._id,
        exerciseName: exercise.name,
        sets: [{ reps: '', weight: '' }],
      },
    ]);
    setSelectedId('');
  }

  function updateExercise(exerciseIndex, update) {
    setExercises((current) =>
      current.map((exercise, index) =>
        index === exerciseIndex ? update(exercise) : exercise
      )
    );
  }

  function handleRemoveExercise(exerciseIndex) {
    setExercises((current) =>
      current.filter((exercise, index) => index !== exerciseIndex)
    );
  }

  function handleAddSet(exerciseIndex) {
    updateExercise(exerciseIndex, (exercise) => ({
      ...exercise,
      sets: [...exercise.sets, { ...exercise.sets[exercise.sets.length - 1] }],
    }));
  }

  function handleRemoveSet(exerciseIndex, setIndex) {
    updateExercise(exerciseIndex, (exercise) => ({
      ...exercise,
      sets: exercise.sets.filter((set, index) => index !== setIndex),
    }));
  }

  function handleSetChange(exerciseIndex, setIndex, field, value) {
    updateExercise(exerciseIndex, (exercise) => ({
      ...exercise,
      sets: exercise.sets.map((set, index) =>
        index === setIndex ? { ...set, [field]: value } : set
      ),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (exercises.length === 0) {
      setError('Add at least one exercise before saving.');
      return;
    }

    const workout = {
      // Noon local time, so the date never shifts a day because of time zones
      date: new Date(`${date}T12:00`).toISOString(),
      durationMinutes,
      notes,
      exercises: exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
      })),
    };

    setSaving(true);

    try {
      const url = isEditing
        ? `/api/workouts/${initialWorkout._id}`
        : '/api/workouts';

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workout),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save workout');
      }

      if (!isEditing) {
        setExercises([]);
        setDurationMinutes('');
        setNotes('');
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="workout-form">
      <h2>{isEditing ? 'Edit Workout' : 'Log Workout'}</h2>
      {!isEditing && (
        <p className="workout-instructions">
          Search for an exercise, choose it from the list and press Add
          Exercise. Enter the reps and weight for each set (leave weight empty
          for bodyweight exercises). Add Set copies the previous set to save
          typing. Press Save Workout when you are done.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="workout-details">
          <label>
            Date
            <input
              type="date"
              value={date}
              max={todayString()}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label>
            Duration (minutes)
            <input
              type="number"
              min="0"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
            />
          </label>
        </div>

        <fieldset className="exercise-picker">
          <legend>Add an exercise</legend>

          <label>
            Search
            <input
              type="search"
              placeholder="e.g. bench press"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setSelectedId('');
              }}
            />
          </label>

          <label>
            Exercise
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              <option value="">
                {matches.length === 0
                  ? 'No matching exercises'
                  : 'Choose an exercise'}
              </option>
              {matches.map((exercise) => (
                <option key={exercise._id} value={exercise._id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleAddExercise}
            disabled={!selectedId}
          >
            Add Exercise
          </button>
        </fieldset>

        {exercises.map((exercise, exerciseIndex) => (
          <fieldset
            className="logged-exercise"
            key={`${exercise.exerciseId}-${exerciseIndex}`}
          >
            <legend>{exercise.exerciseName}</legend>

            <table>
              <thead>
                <tr>
                  <th scope="col">Set</th>
                  <th scope="col">Reps</th>
                  <th scope="col">Weight (lb)</th>
                  <th scope="col">
                    <span className="visually-hidden">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {exercise.sets.map((set, setIndex) => (
                  <tr key={setIndex}>
                    <td>{setIndex + 1}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        aria-label={`Set ${setIndex + 1} reps`}
                        value={set.reps}
                        onChange={(event) =>
                          handleSetChange(
                            exerciseIndex,
                            setIndex,
                            'reps',
                            event.target.value
                          )
                        }
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        aria-label={`Set ${setIndex + 1} weight`}
                        value={set.weight}
                        onChange={(event) =>
                          handleSetChange(
                            exerciseIndex,
                            setIndex,
                            'weight',
                            event.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                        disabled={exercise.sets.length === 1}
                      >
                        Remove Set
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button type="button" onClick={() => handleAddSet(exerciseIndex)}>
              Add Set
            </button>
            <button
              type="button"
              onClick={() => handleRemoveExercise(exerciseIndex)}
            >
              Remove Exercise
            </button>
          </fieldset>
        ))}

        <label>
          Notes
          <textarea
            value={notes}
            placeholder="How did it feel?"
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Workout'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </form>
    </section>
  );
}

WorkoutForm.propTypes = {
  initialWorkout: PropTypes.shape({
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
            reps: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            weight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
          })
        ).isRequired,
      })
    ).isRequired,
  }),
  onSaved: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

export default WorkoutForm;