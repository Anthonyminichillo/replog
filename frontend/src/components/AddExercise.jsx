
import { useState } from 'react';
import PropTypes from 'prop-types';
import './AddExercise.css';

function AddExercise({ onExerciseAdded }) {
  const [name, setName] = useState('');
  const [muscleGroups, setMuscleGroups] = useState('');
  const [equipment, setEquipment] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [type, setType] = useState('Strength');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const newExercise = {
      name,
      muscleGroups: muscleGroups.split(',').map((item) => item.trim()),
      equipment: equipment.split(',').map((item) => item.trim()),
      difficulty,
      type,
      description,
      instructions: instructions.split('\n').filter((item) => item.trim()),
    };

    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExercise),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to add exercise');
      }

      onExerciseAdded(data);

      setName('');
      setMuscleGroups('');
      setEquipment('');
      setDifficulty('Beginner');
      setType('Strength');
      setDescription('');
      setInstructions('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="add-exercise">
      <h2>Add Custom Exercise</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Exercise Name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label>
          Muscle Groups (comma separated)
          <input
            value={muscleGroups}
            onChange={(event) => setMuscleGroups(event.target.value)}
            placeholder="Chest, Triceps, Shoulders"
            required
          />
        </label>

        <label>
          Equipment (comma separated)
          <input
            value={equipment}
            onChange={(event) => setEquipment(event.target.value)}
            placeholder="Barbell, Bench"
            required
          />
        </label>

        <label>
          Difficulty
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </label>

        <label>
          Exercise Type
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option>Strength</option>
            <option>Cardio</option>
            <option>Mobility</option>
          </select>
        </label>

        <label>
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </label>

        <label>
          Instructions (one step per line)
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder={'Step 1\nStep 2\nStep 3'}
            required
          />
        </label>

        <button type="submit">Add Exercise</button>

        {error && <p className="form-error">{error}</p>}
      </form>
    </section>
  );
}

AddExercise.propTypes = {
  onExerciseAdded: PropTypes.func.isRequired,
};

export default AddExercise;
