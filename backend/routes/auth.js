import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters.',
      });
    }

    const users = req.app.locals.db.collection('users');

    const existingUser = await users.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await users.insertOne({
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        _id: result.insertedId,
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Unable to register user.',
    });
  }
});

// Log in an existing user
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message || 'Login failed.',
      });
    }

    req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return res.json({
        message: 'Login successful.',
        user,
      });
    });
  })(req, res, next);
});

// Check whether a user is logged in
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      error: 'Not logged in.',
    });
  }

  return res.json({
    user: req.user,
  });
});

// Log out
router.post('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie('connect.sid');

      return res.json({
        message: 'Logged out successfully.',
      });
    });
  });
});

export default router;
