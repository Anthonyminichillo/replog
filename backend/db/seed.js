import 'dotenv/config';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI);

const sampleExercise = {
  name: 'Barbell Bench Press',
  muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
  equipment: ['Barbell', 'Bench'],
  difficulty: 'Intermediate',
  type: 'Strength',
  description: 'A compound upper-body exercise that primarily works the chest.',
  instructions: [
    'Lie flat on the bench with your feet planted.',
    'Grip the bar slightly wider than shoulder-width.',
    'Lower the bar toward your chest.',
    'Press the bar back up under control.',
  ],
};

try {
  await client.connect();

  const db = client.db(process.env.DB_NAME);

  const result = await db
    .collection('exercises')
    .updateOne(
      { name: sampleExercise.name },
      { $setOnInsert: sampleExercise },
      { upsert: true }
    );

  console.log(
    result.upsertedCount === 1
      ? 'Sample exercise added!'
      : 'Sample exercise already exists.'
  );
} catch (err) {
  console.error('Error adding sample exercise:', err);
} finally {
  await client.close();
}
