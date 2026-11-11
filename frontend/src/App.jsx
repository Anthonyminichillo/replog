import { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('backend unreachable'));
  }, []);

  return (
    <main>
      <h1>RepLog</h1>
      <p>Backend status: {status}</p>
    </main>
  );
}

export default App;
