const express = require('express');
const {
  getWorkout,
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getPublicWorkouts
} = require('../controllers/workouts');

const Workout = require('../models/Workout');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getWorkouts).post(protect, createWorkout);

router
  .route('/:id')
  .get(protect, getWorkout)
  .put(protect, updateWorkout)
  .delete(protect, deleteWorkout);

router.route('/public').get(protect, getPublicWorkouts);

module.exports = router;
