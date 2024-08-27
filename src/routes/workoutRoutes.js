const express = require("express");
const router = express.Router();
const Workout = require("../models/Workout");
const Exercise = require("../models/Exercise");

// Middleware function to validate exercise IDs inthe request
const validateExerciseIds = async (req, res, next) => {
  const { exercises } = req.body;

  if (exercises) {
    for (const exercise of exercises) {
      const validExercise = await Exercise.findById(exercise.exerciseId);
      if (!validExercise) {
        return res
          .status(400)
          .json({ error: `Exercise with ID ${exercise.exerciseId} not found` });
      }
    }
  }

  next();
};

// Create a new workout
router.post("/", async (req, res) => {
  try {
    const { userId, date, notes, exercises } = req.body;

    // Validate that all exercise IDs are valid
    for (const exercise of exercises) {
      const validExercise = await Exercise.findById(exercise.exerciseId);
      if (!validExercise) {
        return res
          .status(400)
          .json({ error: `Exercise with ID ${exercise.exerciseId} not found` });
      }
    }

    // Create and save the new workout
    const newWorkout = new Workout({ userId, date, notes, exercises });
    await newWorkout.save();

    res.status(201).json(newWorkout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all workout
router.get("/", async (req, res) => {
  try {
    const workouts = await Workout.find().populate("userId");
    res.status(200).json(workouts);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single workout
router.get("/:id", async (req, res) => {
  try {
    const workoutId = req.params.id;
    const workout = await Workout.findById(workoutId).populate("userId");

    if (!workout) {
      return res.status(404).json({ error: "workout not found" });
    }
    res.status(200).json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update exercise
router.patch("/:id", validateExerciseIds, async (req, res) => {
  try {
    const workoutId = req.params.id;
    const updates = req.body;

    const updatedWorkout = await Workout.findByIdAndUpdate(workoutId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedWorkout) {
      return res.status(400).json({ error: "Workout not found" });
    }
    res
      .status(200)
      .json({ message: "Workout updated successfully", updatedWorkout });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete exercise
router.delete("/:id", async (req, res) => {
  try {
    const workoutId = req.params.id;

    const deletedWorkout = await Workout.findByIdAndDelete(workoutId);

    if (!deletedWorkout) {
      return res.status(404).json({ error: "Workout not found" });
    }
    res.status(200).json({ message: "Workout deleted sucessfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
