import { useState } from 'react';
import PropTypes from 'prop-types';
import './Register.css';

function Register({ onRegister, onShowLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unable to create account.');
        return;
      }

      onRegister(email, password);
    } catch {
      setError('Unable to connect to the server.');
    }
  }

  return (
    <section className="auth-card">
      <h2>Create Account</h2>

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
          Password (at least 8 characters)
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
        </label>

        <button type="submit">Create Account</button>
      </form>

      {error && <p>{error}</p>}

      <p>
        Already have an account?{' '}
        <button type="button" onClick={onShowLogin}>
          Log In
        </button>
      </p>
    </section>
  );
}

Register.propTypes = {
  onRegister: PropTypes.func.isRequired,
  onShowLogin: PropTypes.func.isRequired,
};

export default Register;
