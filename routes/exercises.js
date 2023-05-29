const express = require('express');
const {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise
} = require('../controllers/exercises');

const Exercise = require('../models/Exercise');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getExercises)
  // .get(advancedResults(Exercise), getExercises)
  .post(protect, createExercise);

router
  .route('/:id')
  .get(protect, getExercise)
  .put(protect, updateExercise)
  // .put(protect, authorize('publisher', 'admin'), updateExercise)
  .delete(protect, deleteExercise);
// .delete(protect, authorize('publisher', 'admin'), deleteExercise);

module.exports = router;
