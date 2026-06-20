const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/hospitals
// @desc    Get all hospitals (filterable)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, minBeds, hasICU } = req.query;
    let query = {};

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (minBeds) {
      query.bedsAvailable = { $gte: parseInt(minBeds) };
    }

    if (hasICU === 'true') {
      query.icuAvailable = { $gt: 0 };
    }

    const hospitals = await Hospital.find(query).sort({ distance: 1 });
    res.json({ success: true, count: hospitals.length, data: hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/hospitals/:id
// @desc    Get single hospital details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/hospitals
// @desc    Create a new hospital
// @access  Private/Admin
router.post('/', protect, authorize('super_admin'), async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/hospitals/:id
// @desc    Update hospital details / bed occupancy
// @access  Private/Admin (or staff)
router.put('/:id', protect, authorize('super_admin', 'hospital_admin', 'doctor', 'nurse', 'receptionist'), async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({ success: true, data: hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/hospitals/:id
// @desc    Delete a hospital
// @access  Private/Admin
router.delete('/:id', protect, authorize('super_admin'), async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({ success: true, message: 'Hospital deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
