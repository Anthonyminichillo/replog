import { useState, useEffect } from 'react';
import './ExerciseList.css';

function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

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

  function handleEditClick(exercise) {
    setEditingId(exercise._id);

    setEditForm({
      name: exercise.name,
      muscleGroups: exercise.muscleGroups.join(', '),
      equipment: exercise.equipment.join(', '),
      difficulty: exercise.difficulty,
      type: exercise.type,
      description: exercise.description,
      instructions: exercise.instructions.join('\n'),
    });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    const updatedExercise = {
      ...editForm,
      muscleGroups: editForm.muscleGroups.split(',').map((item) => item.trim()),
      equipment: editForm.equipment.split(',').map((item) => item.trim()),
      instructions: editForm.instructions
        .split('\n')
        .filter((item) => item.trim()),
    };

    try {
      const response = await fetch(`/api/exercises/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedExercise),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update exercise');
      }

      setExercises((current) =>
        current.map((exercise) =>
          exercise._id === editingId ? data : exercise
        )
      );

      setEditingId(null);
      setEditForm({});
    } catch (err) {
      setError(err.message);
    }
  }

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
      <input
        type="text"
        placeholder="Search exercises by name..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      <div className="exercise-filters">
        <select
          value={muscleFilter}
          onChange={(event) => setMuscleFilter(event.target.value)}
        >
          <option value="">All Muscle Groups</option>
          <option>Chest</option>
          <option>Back</option>
          <option>Shoulders</option>
          <option>Arms</option>
          <option>Legs</option>
          <option>Core</option>
        </select>

        <select
          value={equipmentFilter}
          onChange={(event) => setEquipmentFilter(event.target.value)}
        >
          <option value="">All Equipment</option>
          <option>Barbell</option>
          <option>Dumbbell</option>
          <option>Bench</option>
          <option>Machine</option>
          <option>Bodyweight</option>
          <option>Cable</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(event) => setDifficultyFilter(event.target.value)}
        >
          <option value="">All Difficulties</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          <option value="">All Types</option>
          <option>Strength</option>
          <option>Cardio</option>
          <option>Mobility</option>
        </select>
      </div>
      <div className="exercise-grid">
        {exercises
          .filter((exercise) =>
            exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .filter((exercise) =>
            muscleFilter ? exercise.muscleGroups.includes(muscleFilter) : true
          )
          .filter((exercise) =>
            equipmentFilter
              ? exercise.equipment.includes(equipmentFilter)
              : true
          )
          .filter((exercise) =>
            difficultyFilter ? exercise.difficulty === difficultyFilter : true
          )
          .filter((exercise) =>
            typeFilter ? exercise.type === typeFilter : true
          )
          .map((exercise) => (
            <article className="exercise-card" key={exercise._id}>
              {editingId === exercise._id ? (
                <form onSubmit={handleEditSubmit}>
                  <h3>Edit Exercise</h3>

                  <label>
                    Exercise Name
                    <input
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      required
                    />
                  </label>

                  <label>
                    Muscle Groups
                    <input
                      name="muscleGroups"
                      value={editForm.muscleGroups}
                      onChange={handleEditChange}
                      required
                    />
                  </label>

                  <label>
                    Equipment
                    <input
                      name="equipment"
                      value={editForm.equipment}
                      onChange={handleEditChange}
                      required
                    />
                  </label>

                  <label>
                    Difficulty
                    <select
                      name="difficulty"
                      value={editForm.difficulty}
                      onChange={handleEditChange}
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </label>

                  <label>
                    Type
                    <select
                      name="type"
                      value={editForm.type}
                      onChange={handleEditChange}
                    >
                      <option>Strength</option>
                      <option>Cardio</option>
                      <option>Mobility</option>
                    </select>
                  </label>

                  <label>
                    Description
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      required
                    />
                  </label>

                  <label>
                    Instructions (one step per line)
                    <textarea
                      name="instructions"
                      value={editForm.instructions}
                      onChange={handleEditChange}
                      required
                    />
                  </label>

                  <button type="submit">Save Changes</button>

                  <button type="button" onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <h3>{exercise.name}</h3>

                  <p>{exercise.description}</p>

                  <p>
                    <strong>Muscles:</strong> {exercise.muscleGroups.join(', ')}
                  </p>

                  <p>
                    <strong>Equipment:</strong> {exercise.equipment.join(', ')}
                  </p>

                  <p>
                    <strong>Difficulty:</strong> {exercise.difficulty}
                  </p>

                  <p>
                    <strong>Type:</strong> {exercise.type}
                  </p>
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === exercise._id ? null : exercise._id
                      )
                    }
                  >
                    {expandedId === exercise._id
                      ? 'Hide Instructions'
                      : 'View Instructions'}
                  </button>

                  {expandedId === exercise._id && (
                    <div className="exercise-instructions">
                      <h4>How to Perform</h4>
                      <ol>
                        {exercise.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <button onClick={() => handleEditClick(exercise)}>
                    Edit Exercise
                  </button>

                  <button onClick={() => handleDelete(exercise._id)}>
                    Delete Exercise
                  </button>
                </>
              )}
            </article>
          ))}
      </div>
    </section>
  );
}

export default ExerciseList;
