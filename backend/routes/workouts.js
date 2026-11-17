import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const workouts = await req.app.locals.db
      .collection('workouts')
      .find({ userId: req.user._id })
      .sort({ date: -1 })
      .toArray();

    res.json(workouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to retrieve workouts' });
  }
});

export default router;
