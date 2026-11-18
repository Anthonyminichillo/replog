import { useEffect, useState } from 'react';
import ExerciseList from './components/ExerciseList.jsx';
import AddExercise from './components/AddExercise.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import NavBar from './components/NavBar.jsx';
import WorkoutHistory from './components/WorkoutHistory.jsx';
import WorkoutForm from './components/WorkoutForm.jsx';
import ProgressTracker from './components/ProgressTracker.jsx';
import './App.css';

function App() {
  const [refresh, setRefresh] = useState(0);
  const [user, setUser] = useState(null);
  const [authPage, setAuthPage] = useState('login');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('exercises');

  useEffect(() => {
    async function checkLogin() {
      try {
        const response = await fetch('/api/auth/me');

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Unable to check login status:', error);
      } finally {
        setLoading(false);
      }
    }

    checkLogin();
  }, []);

  function handleExerciseAdded() {
    setRefresh((current) => current + 1);
  }

  async function handleRegister(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      } else {
        setAuthPage('login');
      }
    } catch (error) {
      console.error('Unable to log in after registration:', error);
      setAuthPage('login');
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      setUser(null);
      setAuthPage('login');
      setPage('exercises');
    } catch (error) {
      console.error('Unable to log out:', error);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="brand">
          <p className="brand-label">TRAINING LOG / EST. 2026</p>
          <h1>
            REPLOG<span>.</span>
          </h1>
          <p className="brand-tagline">TRACK EVERY REP. BUILD EVERY DAY.</p>
        </div>

        {user ? (
          <div className="user-panel">
            <div>
              <p className="user-label">SIGNED IN AS</p>
              <p className="user-email">{user.email}</p>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        ) : (
          <p className="header-status">PERSONNEL ACCESS / LOGIN REQUIRED</p>
        )}
      </header>

      {user ? (
        <>
          <NavBar currentPage={page} onNavigate={setPage} />

          {page === 'exercises' && (
            <>
              <AddExercise onExerciseAdded={handleExerciseAdded} />
              <ExerciseList key={refresh} />
            </>
          )}
          {page === 'log' && <WorkoutForm onSaved={() => setPage('history')} />}


          {page === 'history' && <WorkoutHistory />}
          {page === 'progress' && <ProgressTracker />}
          
        </>
      ) : (
        <div className="auth-layout">
          {authPage === 'login' ? (
            <Login
              onLogin={setUser}
              onShowRegister={() => setAuthPage('register')}
            />
          ) : (
            <Register
              onRegister={handleRegister}
              onShowLogin={() => setAuthPage('login')}
            />
          )}
        </div>
      )}

      <footer className="site-footer">
        <span>REPLOG / TRAINING SYSTEM</span>
        <span>CONSISTENCY OVER EVERYTHING.</span>
      </footer>
    </main>
  );
}

export default App;
