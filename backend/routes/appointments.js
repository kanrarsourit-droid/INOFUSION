const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/appointments/book
// @desc    Book a new medical appointment
// @access  Private
router.post('/book', protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot } = req.body;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Please provide doctorId, date, and timeSlot' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Create the appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      hospital: doctor.hospital,
      date,
      timeSlot,
      status: 'Confirmed' // Direct confirmation for streamlined hackathon flow
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor')
      .populate('hospital')
      .populate('patient', 'name email');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/appointments/patient
// @desc    Get logged-in patient's appointments
// @access  Private
router.get('/patient', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate({
        path: 'doctor',
        populate: { path: 'hospital' }
      })
      .populate('hospital')
      .sort({ date: -1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/appointments/admin
// @desc    Get all appointments (Admin only)
// @access  Private/Admin
router.get('/admin', protect, authorize('hospital_admin', 'super_admin', 'doctor', 'receptionist'), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name email')
      .populate('doctor')
      .populate('hospital')
      .sort({ date: -1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status (Confirm/Cancel)
// @access  Private/Admin
router.put('/:id/status', protect, authorize('hospital_admin', 'super_admin', 'doctor', 'receptionist'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Confirmed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('patient', 'name email')
      .populate('doctor')
      .populate('hospital');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
