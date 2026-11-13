import 'dotenv/config';
import express from 'express';
import { MongoClient } from 'mongodb';
import exercisesRouter from './routes/exercises.js';

const app = express();
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

app.locals.db = client.db(process.env.DB_NAME);

app.use('/api/exercises', exercisesRouter);

app.get('/api/health', async (req, res) => {
  try {
    await client.db(process.env.DB_NAME).command({ ping: 1 });
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
