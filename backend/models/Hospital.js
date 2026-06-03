const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a hospital name'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  distance: {
    type: Number,
    required: true,
    default: 1.0 // Simulated distance in km
  },
  bedsAvailable: {
    type: Number,
    required: true,
    default: 0
  },
  bedsTotal: {
    type: Number,
    required: true,
    default: 0
  },
  icuAvailable: {
    type: Number,
    required: true,
    default: 0
  },
  icuTotal: {
    type: Number,
    required: true,
    default: 0
  },
  contactPhone: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Hospital', hospitalSchema);
