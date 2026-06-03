const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a doctor name'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Please add a specialty'],
    enum: [
      'Cardiologist',
      'Dermatologist',
      'Ophthalmologist',
      'General Physician',
      'Neurologist',
      'Orthopedic Specialist',
      'Pediatrician'
    ]
  },
  experience: {
    type: Number,
    required: [true, 'Please add experience in years']
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  availability: {
    type: String,
    enum: ['Available', 'Busy', 'On Leave'],
    default: 'Available'
  },
  rating: {
    type: Number,
    default: 4.5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
