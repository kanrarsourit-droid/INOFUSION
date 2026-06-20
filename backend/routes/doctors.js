const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/doctors
// @desc    Get all doctors (filterable and populated)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { specialty, availability } = req.query;
    let query = {};

    if (specialty) {
      // Direct equality or partial regex
      query.specialty = new RegExp(specialty, 'i');
    }

    if (availability) {
      query.availability = availability;
    }

    const doctors = await Doctor.find(query).populate('hospital');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/doctors
// @desc    Create a new doctor profile
// @access  Private/Admin
router.post('/', protect, authorize('super_admin', 'hospital_admin'), async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    const populatedDoctor = await Doctor.findById(doctor._id).populate('hospital');
    res.status(201).json({ success: true, data: populatedDoctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/doctors/:id
// @desc    Update doctor details
// @access  Private/Admin
router.put('/:id', protect, authorize('super_admin', 'hospital_admin', 'doctor'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('hospital');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, data: doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/doctors/:id
// @desc    Delete a doctor
// @access  Private/Admin
router.delete('/:id', protect, authorize('super_admin', 'hospital_admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, message: 'Doctor profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
