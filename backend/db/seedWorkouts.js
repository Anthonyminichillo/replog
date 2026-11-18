import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const client = new MongoClient(process.env.MONGO_URI);

const TEST_PASSWORD = 'password123';

// One test user per persona. Gaps control how often they train.
const testUsers = [
  { email: 'marcus@replog.test', workoutCount: 300, maxGapDays: 4, strength: 0.6 },
  { email: 'priya@replog.test', workoutCount: 450, maxGapDays: 3, strength: 1.2 },
  { email: 'jordan@replog.test', workoutCount: 250, maxGapDays: 9, strength: 0.9 },
];

const workoutNotes = [
  '',
  '',
  'Felt strong',
  'Low energy today',
  'Short on time',
  'Focused on form',
];

function roundToFive(weight) {
  return Math.round(weight / 5) * 5;
}

// Walks backward from today with random gaps, then flips to oldest first
function buildDates(count, maxGapDays) {
  const dates = [];
  const date = new Date();
  date.setHours(18, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    dates.push(new Date(date));
    date.setDate(
      date.getDate() - faker.number.int({ min: 1, max: maxGapDays }),
    );
  }
  return dates.reverse();
}

function buildWorkouts(user, userId, exercises) {
  const startWeights = new Map(
    exercises.map((exercise) => [
      exercise._id.toString(),
      faker.number.int({ min: 8, max: 27 }) * 5 * user.strength,
    ]),
  );
  const dates = buildDates(user.workoutCount, user.maxGapDays);

  return dates.map((date, index) => {
    const progress = index / (dates.length - 1); // 0 = oldest, 1 = newest
    const chosen = faker.helpers.arrayElements(exercises, { min: 3, max: 5 });

    return {
      seedId: `generated-workout-${user.email}-${index + 1}`,
      userId,
      date,
      durationMinutes: faker.number.int({ min: 30, max: 90 }),
      notes: faker.helpers.arrayElement(workoutNotes),
      exercises: chosen.map((exercise) => {
        const isBodyweight = exercise.equipment.includes('Bodyweight');
        const weight = isBodyweight
          ? 0
          : roundToFive(
              startWeights.get(exercise._id.toString()) * (1 + 0.4 * progress),
            );
        return {
          exerciseId: exercise._id,
          exerciseName: exercise.name,
          sets: Array.from(
            { length: faker.number.int({ min: 3, max: 4 }) },
            () => ({ reps: faker.number.int({ min: 5, max: 10 }), weight }),
          ),
        };
      }),
      createdAt: date,
      lastModified: date,
    };
  });
}

try {
  await client.connect();

  const db = client.db(process.env.DB_NAME);

  const exercises = await db
    .collection('exercises')
    .find(
      { name: / - Standard$/, type: 'Strength' },
      { projection: { name: 1, equipment: 1 } },
    )
    .toArray();
  if (exercises.length === 0) {
    throw new Error('No exercises found. Run "npm run seed" first.');
  }

  const users = db.collection('users');
  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 12);
  const operations = [];

  for (const user of testUsers) {
    await users.updateOne(
      { email: user.email },
      {
        $setOnInsert: {
          email: user.email,
          password: hashedPassword,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
    const { _id } = await users.findOne({ email: user.email });

    for (const workout of buildWorkouts(user, _id, exercises)) {
      operations.push({
        updateOne: {
          filter: { seedId: workout.seedId },
          update: { $setOnInsert: workout },
          upsert: true,
        },
      });
    }
  }

  const workouts = db.collection('workouts');
  const result = await workouts.bulkWrite(operations);
  await workouts.createIndex({ userId: 1, date: -1 });

  const total = await workouts.countDocuments();

  console.log(`Generated workouts added: ${result.upsertedCount}`);
  console.log(`Total workouts in database: ${total}`);
  console.log(`Test logins use password: ${TEST_PASSWORD}`);
} catch (err) {
  console.error('Error generating workout data:', err);
} finally {
  await client.close();
}