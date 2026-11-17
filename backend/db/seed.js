import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { faker } from '@faker-js/faker';

const client = new MongoClient(process.env.MONGO_URI);

const exerciseTemplates = [
  {
    name: 'Barbell Bench Press',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: ['Barbell', 'Bench'],
    type: 'Strength',
  },
  {
    name: 'Dumbbell Shoulder Press',
    muscleGroups: ['Shoulders', 'Triceps'],
    equipment: ['Dumbbell'],
    type: 'Strength',
  },
  {
    name: 'Barbell Back Squat',
    muscleGroups: ['Legs', 'Core'],
    equipment: ['Barbell'],
    type: 'Strength',
  },
  {
    name: 'Dumbbell Bicep Curl',
    muscleGroups: ['Arms'],
    equipment: ['Dumbbell'],
    type: 'Strength',
  },
  {
    name: 'Lat Pulldown',
    muscleGroups: ['Back', 'Arms'],
    equipment: ['Machine'],
    type: 'Strength',
  },
  {
    name: 'Cable Tricep Pushdown',
    muscleGroups: ['Arms'],
    equipment: ['Cable'],
    type: 'Strength',
  },
  {
    name: 'Push-Up',
    muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: ['Bodyweight'],
    type: 'Strength',
  },
  {
    name: 'Dumbbell Romanian Deadlift',
    muscleGroups: ['Legs', 'Back'],
    equipment: ['Dumbbell'],
    type: 'Strength',
  },
  {
    name: 'Plank',
    muscleGroups: ['Core'],
    equipment: ['Bodyweight'],
    type: 'Strength',
  },
  {
    name: 'Seated Cable Row',
    muscleGroups: ['Back', 'Arms'],
    equipment: ['Cable'],
    type: 'Strength',
  },
  {
    name: 'Leg Press',
    muscleGroups: ['Legs'],
    equipment: ['Machine'],
    type: 'Strength',
  },
  {
    name: 'Dumbbell Lateral Raise',
    muscleGroups: ['Shoulders'],
    equipment: ['Dumbbell'],
    type: 'Strength',
  },
  {
    name: 'Treadmill Run',
    muscleGroups: ['Legs'],
    equipment: ['Machine'],
    type: 'Cardio',
  },
  {
    name: 'Jump Rope',
    muscleGroups: ['Legs', 'Shoulders'],
    equipment: ['Bodyweight'],
    type: 'Cardio',
  },
  {
    name: 'Mountain Climbers',
    muscleGroups: ['Core', 'Legs', 'Shoulders'],
    equipment: ['Bodyweight'],
    type: 'Cardio',
  },
  {
    name: 'Bicycle Crunch',
    muscleGroups: ['Core'],
    equipment: ['Bodyweight'],
    type: 'Strength',
  },
  {
    name: 'Goblet Squat',
    muscleGroups: ['Legs', 'Core'],
    equipment: ['Dumbbell'],
    type: 'Strength',
  },
  {
    name: 'Chest Fly',
    muscleGroups: ['Chest', 'Shoulders'],
    equipment: ['Dumbbell', 'Bench'],
    type: 'Strength',
  },
  {
    name: 'Cable Face Pull',
    muscleGroups: ['Shoulders', 'Back'],
    equipment: ['Cable'],
    type: 'Strength',
  },
  {
    name: 'Walking Lunge',
    muscleGroups: ['Legs', 'Core'],
    equipment: ['Bodyweight'],
    type: 'Strength',
  },
];

const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

const variations = [
  'Standard',
  'Controlled Tempo',
  'Paused',
  'Slow Tempo',
  'Advanced',
  'Beginner',
  'Extended Range',
  'Modified',
  'Variation A',
  'Variation B',
  'Variation C',
  'Variation D',
  'Variation E',
  'Variation F',
  'Variation G',
  'Variation H',
  'Variation I',
  'Variation J',
  'Variation K',
  'Variation L',
  'Variation M',
  'Variation N',
  'Variation O',
  'Variation P',
  'Variation Q',
  'Variation R',
  'Variation S',
  'Variation T',
  'Variation U',
  'Variation V',
  'Variation W',
  'Variation X',
  'Variation Y',
  'Variation Z',
  'Variation AA',
  'Variation AB',
  'Variation AC',
  'Variation AD',
  'Variation AE',
  'Variation AF',
  'Variation AG',
  'Variation AH',
  'Variation AI',
  'Variation AJ',
  'Variation AK',
  'Variation AL',
  'Variation AM',
  'Variation AN',
  'Variation AO',
  'Variation AP',
];

const generatedExercises = Array.from({ length: 1000 }, (_, index) => {
  const template = exerciseTemplates[index % exerciseTemplates.length];
  const variation = variations[Math.floor(index / exerciseTemplates.length)];

  return {
    seedId: `generated-exercise-${index + 1}`,
    name: `${template.name} - ${variation}`,
    muscleGroups: template.muscleGroups,
    equipment: template.equipment,
    difficulty: faker.helpers.arrayElement(difficulties),
    type: template.type,
    description: `A ${faker.helpers.arrayElement(difficulties).toLowerCase()} ${template.type.toLowerCase()} exercise targeting ${template.muscleGroups.join(', ')}.`,
    instructions: [
      'Position yourself correctly before beginning the exercise.',
      'Maintain proper posture and controlled movement.',
      'Perform the movement through a comfortable range of motion.',
      'Return to the starting position and repeat.',
    ],
  };
});

try {
  await client.connect();

  const db = client.db(process.env.DB_NAME);
  const exercises = db.collection('exercises');

  const operations = generatedExercises.map((exercise) => ({
    updateOne: {
      filter: { seedId: exercise.seedId },
      update: { $setOnInsert: exercise },
      upsert: true,
    },
  }));

  const result = await exercises.bulkWrite(operations);

  const total = await exercises.countDocuments();

  console.log(`Generated records added: ${result.upsertedCount}`);
  console.log(`Total exercises in database: ${total}`);
} catch (err) {
  console.error('Error generating exercise data:', err);
} finally {
  await client.close();
}
