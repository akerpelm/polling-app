const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Workout = require('../models/Workout');

exports.getWorkout = asyncHandler(async (req, res, next) => {
  const workout = await Workout.findById(req.params.id);

  if (!workout) {
    return next(
      new ErrorResponse(`Workout not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: workout });
});

exports.getWorkouts = asyncHandler(async (req, res, next) => {
  const workouts = await Workout.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    data: workouts
  });
});

exports.getPublicWorkouts = asyncHandler(async (req, res) => {
  try {
    const { max, limit, offset } = req.query;
    const maxCount = parseInt(max) || 100; // Maximum number of workouts to retrieve
    const limitCount = parseInt(limit) || 10; // Number of workouts per page
    const offsetCount = parseInt(offset) || 0; // Offset for pagination

    const workouts = await Workout.find({ privacy: 'public' })
      .limit(limitCount)
      .skip(offsetCount)
      .populate('user', 'username')
      .populate('exercises.exercise', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json(workouts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @desc      Create new workout
// @route     POST /api/v1/workouts
// @access    Private
// @desc      Create new workout
// @route     POST /api/v1/workouts
// @access    Private
exports.createWorkout = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const workout = await Workout.create(req.body);

  res.status(201).json({
    success: true,
    data: workout
  });
});

// @desc      Update workout
// @route     PUT /api/v1/workouts/:id
// @access    Private
exports.updateWorkout = asyncHandler(async (req, res, next) => {
  let workout = await Workout.findById(req.params.id);

  if (!workout) {
    return next(
      new ErrorResponse(`Workout not found with id of ${req.params.id}`, 404)
    );
  }

  if (workout.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this workout`,
        403
      )
    );
  }

  // Validate and populate exercises
  const populatedExercises = await Promise.all(
    req.body.exercises.map(async (exerciseId) => {
      const exercise = await Exercise.findById(exerciseId);
      if (!exercise) {
        throw new ErrorResponse(
          `Exercise not found with id ${exerciseId}`,
          404
        );
      }
      return exercise;
    })
  );

  req.body.exercises = populatedExercises;

  workout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: workout
  });
});

exports.deleteWorkout = asyncHandler(async (req, res, next) => {
  const workout = await Workout.findById(req.params.id);

  if (!workout) {
    return next(
      new ErrorResponse(`Workout not found with id of ${req.params.id}`, 404)
    );
  }

  if (workout.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this workout`,
        403
      )
    );
  }

  await workout.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// ...
