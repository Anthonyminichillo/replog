import { Router } from 'express';
import { ObjectId } from 'mongodb';

const router = Router();

function parseSets(sets) {
  if (!Array.isArray(sets) || sets.length === 0) return null;
  const parsed = [];
  for (const set of sets) {
    const reps = Number(set.reps);
    const weight = Number(set.weight ?? 0);
    if (!Number.isInteger(reps) || reps < 1) return null;
    if (!Number.isFinite(weight) || weight < 0) return null;
    parsed.push({ reps, weight });
  }
  return parsed;
}

function parseWorkout(body) {
  const date = new Date(body.date);
  if (!body.date || isNaN(date)) {
    return { error: 'A valid date is required' };
  }
  if (!Array.isArray(body.exercises) || body.exercises.length === 0) {
    return { error: 'At least one exercise is required' };
  }

  const exercises = [];
  for (const exercise of body.exercises) {
    if (!ObjectId.isValid(exercise.exerciseId)) {
      return { error: 'Invalid exercise id' };
    }
    const sets = parseSets(exercise.sets);
    if (!sets) {
      return {
        error:
          'Each exercise needs at least one set with valid reps and weight',
      };
    }
    exercises.push({ exerciseId: new ObjectId(exercise.exerciseId), sets });
  }

  const workout = { date, exercises, durationMinutes: null, notes: '' };
  if (body.durationMinutes !== undefined && body.durationMinutes !== '') {
    const duration = Number(body.durationMinutes);
    if (!Number.isFinite(duration) || duration < 0) {
      return { error: 'Duration must be a positive number' };
    }
    workout.durationMinutes = duration;
  }
  if (typeof body.notes === 'string') workout.notes = body.notes.trim();

  return { workout };
}

async function addExerciseNames(db, exercises) {
  const ids = exercises.map((exercise) => exercise.exerciseId);
  const found = await db
    .collection('exercises')
    .find({ _id: { $in: ids } }, { projection: { name: 1 } })
    .toArray();
  const names = new Map(
    found.map((exercise) => [exercise._id.toString(), exercise.name]),
  );
  for (const exercise of exercises) {
    const name = names.get(exercise.exerciseId.toString());
    if (!name) return false;
    exercise.exerciseName = name;
  }
  return true;
}

// READ (workouts)
router.get('/', async (req, res) => {
  try {
    const workouts = await req.app.locals.db
      .collection('workouts')
      .find({ userId: req.user._id })
      .sort({ date: -1 })
      .toArray();
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ (one workout)
router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid workout id' });
    }
    const workout = await req.app.locals.db
      .collection('workouts')
      .findOne({ _id: new ObjectId(req.params.id), userId: req.user._id });
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE (workout)
router.post('/', async (req, res) => {
  try {
    const { workout, error } = parseWorkout(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const db = req.app.locals.db;
    if (!(await addExerciseNames(db, workout.exercises))) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    workout.userId = req.user._id;
    workout.createdAt = new Date();
    workout.lastModified = new Date();

    const result = await db.collection('workouts').insertOne(workout);
    res.status(201).json({ _id: result.insertedId, ...workout });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (workout)
router.put('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid workout id' });
    }
    const { workout, error } = parseWorkout(req.body);
    if (error) {
      return res.status(400).json({ error });
    }

    const db = req.app.locals.db;
    if (!(await addExerciseNames(db, workout.exercises))) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const result = await db
      .collection('workouts')
      .updateOne(
        { _id: new ObjectId(req.params.id), userId: req.user._id },
        { $set: { ...workout, lastModified: new Date() } },
      );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json({ updated: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (workout)
router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid workout id' });
    }
    const result = await req.app.locals.db
      .collection('workouts')
      .deleteOne({ _id: new ObjectId(req.params.id), userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;