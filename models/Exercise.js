const mongoose = require('mongoose');

const MuscleEnum = [
  'abdominals',
  'hamstrings',
  'calves',
  'shoulders',
  'adductors',
  'glutes',
  'quadriceps',
  'biceps',
  'forearms',
  'abductors',
  'triceps',
  'chest',
  'lower_back',
  'traps',
  'middle_back',
  'lats',
  'neck'
];

const ForceEnum = ['pull', 'push', 'static'];

const LevelEnum = ['beginner', 'intermediate', 'expert'];

const MechanicEnum = ['compound', 'isolation'];

const EquipmentEnum = [
  'body only',
  'machine',
  'kettlebells',
  'dumbbell',
  'cable',
  'barbell',
  'bands',
  'medicine ball',
  'exercise ball',
  'e-z curl bar',
  'foam roll'
];

const CategoryEnum = [
  'strength',
  'stretching',
  'plyometrics',
  'strongman',
  'powerlifting',
  'cardio',
  'olympic weightlifting',
  'crossfit',
  'weighted bodyweight',
  'assisted bodyweight'
];

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter the exercise name']
  },
  aliases: [String],
  primaryMuscles: {
    type: [
      {
        type: String,
        enum: MuscleEnum
      }
    ],
    required: [true, 'Please enter at least one primary muscle']
  },
  secondaryMuscles: {
    type: [
      {
        type: String,
        enum: MuscleEnum
      }
    ],
    default: []
  },
  force: {
    type: String,
    enum: ForceEnum
  },
  level: {
    type: String,
    enum: LevelEnum
  },
  mechanic: {
    type: String,
    enum: MechanicEnum
  },
  equipment: {
    type: String,
    enum: EquipmentEnum
  },
  category: {
    type: String,
    enum: CategoryEnum,
    required: [true, 'Please enter the exercise category']
  },
  instructions: {
    type: [String],
    required: [true, 'Please enter the exercise instructions']
  },
  description: String,
  tips: [String],
  sets: {
    type: Number,
    default: 3
  },
  repsPerSet: {
    type: Number,
    default: 10
  },
  weight: {
    type: Boolean,
    default: true
  },
  weightPerRep: {
    type: Number,
    default: 45
  },
  weightUnits: {
    type: String,
    enum: ['lbs', 'kgs'],
    default: 'lbs'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
