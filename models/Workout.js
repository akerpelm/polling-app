const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  exercises: [
    {
      exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: true
      }
    }
  ]
});

module.exports = mongoose.model('Workout', WorkoutSchema);
