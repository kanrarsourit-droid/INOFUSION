const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Confirmed'
  },
  appointmentId: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate a human-readable appointment ID prior to saving (e.g., MR-48291)
appointmentSchema.pre('save', function (next) {
  if (!this.appointmentId) {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.appointmentId = `MR-${randomNum}`;
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
