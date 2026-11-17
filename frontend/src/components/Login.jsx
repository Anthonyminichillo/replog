import { useState } from 'react';
import PropTypes from 'prop-types';
import './Login.css';

function Login({ onLogin, onShowRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unable to log in.');
        return;
      }

      onLogin(data.user);
    } catch {
      setError('Unable to connect to the server.');
    }
  }

  return (
    <section className="auth-card">
      <h2>Log In</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>

        <button type="submit">Log In</button>
      </form>

      {error && <p>{error}</p>}

      <p>
        Don't have an account?{' '}
        <button type="button" onClick={onShowRegister}>
          Register
        </button>
      </p>
    </section>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onShowRegister: PropTypes.func.isRequired,
};

export default Login;
