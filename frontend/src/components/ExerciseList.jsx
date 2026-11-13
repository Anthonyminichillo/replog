
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ExerciseList.css';

function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/exercises')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load exercises');
        }
        return res.json();
      })
      .then((data) => {
        setExercises(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  async function handleDelete(exerciseId) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this exercise?'
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`/api/exercises/${exerciseId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Unable to delete exercise');
    }

    setExercises((current) =>
      current.filter((exercise) => exercise._id !== exerciseId)
    );
  } catch (err) {
    setError(err.message);
  }
}

  if (loading) {
    return <p>Loading exercises...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="exercise-list">
      <h2>Exercise Library</h2>

      <div className="exercise-grid">
        {exercises.map((exercise) => (
          <article className="exercise-card" key={exercise._id}>
            <h3>{exercise.name}</h3>

            <p>{exercise.description}</p>

            <p>
              <strong>Muscles:</strong>{' '}
              {exercise.muscleGroups.join(', ')}
            </p>

            <p>
              <strong>Equipment:</strong>{' '}
              {exercise.equipment.join(', ')}
            </p>

            <p>
              <strong>Difficulty:</strong> {exercise.difficulty}
            </p>

            <p>
              <strong>Type:</strong> {exercise.type}
            </p>
            <button onClick={() => handleDelete(exercise._id)}>
             Delete Exercise
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

ExerciseList.propTypes = {};

export default ExerciseList;
