const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Exercise = require('../models/Exercise');

// @desc  Get all exercises
// @route GET /api/exercises
// @access  Private
exports.getExercises = asyncHandler(async (req, res, next) => {
  const exercises = Exercise.find();
  res.status(200).json({ success: true, data: exercises });
});

// @desc  Get single exercise
// @route GET /api/exercises/:id
// @access  Private
exports.getExercise = asyncHandler(async (req, res, next) => {
  const exercise = await Exercise.findById(req.params.id);

  if (!exercise) {
    return next(
      new ErrorResponse(`Exercise not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: exercise });
});

// @desc  Create new exercise
// @route POST /api/exercises
// @access  Private
exports.createExercise = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;

  const exercise = await Exercise.create(req.body);

  res.status(201).json({
    success: true,
    data: exercise
  });
});

// @desc  Update a single exercise
// @route PUT /api/exercises/:id
// @access  Private
exports.updateExercise = asyncHandler(async (req, res, next) => {
  let exercise = await Exercise.findById(req.params.id);

  if (!exercise) {
    return next(
      new ErrorResponse(`Exercise not found with id of ${req.params.id}`, 404)
    );
  }

  // Ensure user is exercise user
  if (exercise.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this exercise`
      )
    );
  }

  exercise = await Exercise.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: exercise });
});

// @desc  Delete exercise
// @route DELETE /api/exercises/:id
// @access  Private
exports.deleteExercise = asyncHandler(async (req, res, next) => {
  const exercise = await Exercise.findById(req.params.id);
  if (!exercise) {
    return next(
      new ErrorResponse(`Exercise not found with id of ${req.params.id}`, 404)
    );
  }

  // Ensure user is exercise user
  if (exercise.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this exercise`
      )
    );
  }

  exercise.remove();
  res.status(200).json({ success: true, data: {} });
});
