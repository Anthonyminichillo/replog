
import { useState } from 'react';
import ExerciseList from './components/ExerciseList.jsx';
import AddExercise from './components/AddExercise.jsx';

function App() {
  const [refresh, setRefresh] = useState(0);

  function handleExerciseAdded() {
    setRefresh((current) => current + 1);
  }

  return (
    <main>
      <h1>RepLog</h1>
      <AddExercise onExerciseAdded={handleExerciseAdded} />
      <ExerciseList key={refresh} />
    </main>
  );
}

export default App;
