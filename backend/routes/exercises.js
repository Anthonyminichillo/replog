import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Get all exercises
router.get('/', async (req, res) => {
  try {
    const exercises = await req.app.locals.db
      .collection('exercises')
      .find({})
      .toArray();

    res.json(exercises);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to retrieve exercises' });
  }
});

// Add a new exercise
router.post('/', async (req, res) => {
  try {
    const {
      name,
      muscleGroups,
      equipment,
      difficulty,
      type,
      description,
      instructions,
    } = req.body;

    if (
      !name ||
      !muscleGroups ||
      !equipment ||
      !difficulty ||
      !type ||
      !description ||
      !instructions
    ) {
      return res.status(400).json({
        error: 'Please provide all exercise information',
      });
    }

    const newExercise = {
      name,
      muscleGroups,
      equipment,
      difficulty,
      type,
      description,
      instructions,
    };

    const result = await req.app.locals.db
      .collection('exercises')
      .insertOne(newExercise);

    const savedExercise = await req.app.locals.db
      .collection('exercises')
      .findOne({ _id: result.insertedId });

    res.status(201).json(savedExercise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to add exercise' });
  }
});

// Update an existing exercise
router.put('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid exercise ID' });
    }

    const {
      name,
      muscleGroups,
      equipment,
      difficulty,
      type,
      description,
      instructions,
    } = req.body;

    if (
      !name ||
      !muscleGroups ||
      !equipment ||
      !difficulty ||
      !type ||
      !description ||
      !instructions
    ) {
      return res.status(400).json({
        error: 'Please provide all exercise information',
      });
    }

    const exerciseId = new ObjectId(req.params.id);

    const result = await req.app.locals.db.collection('exercises').updateOne(
      { _id: exerciseId },
      {
        $set: {
          name,
          muscleGroups,
          equipment,
          difficulty,
          type,
          description,
          instructions,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const updatedExercise = await req.app.locals.db
      .collection('exercises')
      .findOne({ _id: exerciseId });

    res.json(updatedExercise);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update exercise' });
  }
});

// Delete an exercise
router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid exercise ID' });
    }

    const exerciseId = new ObjectId(req.params.id);

    const result = await req.app.locals.db
      .collection('exercises')
      .deleteOne({ _id: exerciseId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json({ message: 'Exercise deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete exercise' });
  }
});

export default router;
