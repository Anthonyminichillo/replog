import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import { MongoClient } from 'mongodb';
import exercisesRouter from './routes/exercises.js';
import configurePassport from './config/passport.js';
import authRouter from './routes/auth.js';

const app = express();
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

const db = client.db(process.env.DB_NAME);

app.locals.db = db;

configurePassport(db);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client,
      dbName: process.env.DB_NAME,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: false,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/exercises', exercisesRouter);
app.use('/api/auth', authRouter);

app.get('/api/health', async (req, res) => {
  try {
    await db.command({ ping: 1 });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error' });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
