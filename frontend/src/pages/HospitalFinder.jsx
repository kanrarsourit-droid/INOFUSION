import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Bed, Phone, ShieldCheck, Stethoscope, Star, Calendar, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HospitalFinder = () => {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [onlyICU, setOnlyICU] = useState(false);
  const [expandedHospitalId, setExpandedHospitalId] = useState(null);

  // Booking Modal states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM - 10:30 AM');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState('');

  const { apiUrl, isAuthenticated, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Read URL query params (e.g., if redirected from Triage with a specialty query)
  const queryParams = new URLSearchParams(location.search);
  const initialSpecialtyFilter = queryParams.get('specialty') || '';
  const [specialtyFilter, setSpecialtyFilter] = useState(initialSpecialtyFilter);

  // Fetch Hospitals & Doctors on mount and when filter changes
  useEffect(() => {
    fetchHospitals();
    fetchDoctors();
  }, [searchCity, onlyICU]);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      let url = `${apiUrl}/api/hospitals`;
      const queryParts = [];
      if (searchCity) queryParts.push(`city=${encodeURIComponent(searchCity)}`);
      if (onlyICU) queryParts.push(`hasICU=true`);
      if (queryParts.length > 0) url += `?${queryParts.join('&')}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setHospitals(data.data);
      }
    } catch (err) {
      console.error('Error fetching hospitals', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      let url = `${apiUrl}/api/doctors`;
      if (specialtyFilter) {
        url += `?specialty=${encodeURIComponent(specialtyFilter)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDoctors(data.data);
      }
    } catch (err) {
      console.error('Error fetching doctors', err);
    }
  };

  // Trigger search when user changes specialty filter dropdown
  useEffect(() => {
    fetchDoctors();
  }, [specialtyFilter]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Authentication required. Redirecting to Login.');
      navigate('/login');
      return;
    }

    if (!bookingDate || !bookingTime) {
      setBookingError('Please enter booking date and select a timeslot.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess(null);

    try {
      const res = await fetch(`${apiUrl}/api/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          date: bookingDate,
          timeSlot: bookingTime
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data.data);
        // Refresh local doctors & hospitals count
        fetchHospitals();
      } else {
        setBookingError(data.message || 'Failed to book appointment.');
      }
    } catch (err) {
      setBookingError('Server connection failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  const timeSlots = [
    '09:00 AM - 09:30 AM',
    '10:00 AM - 10:30 AM',
    '11:00 AM - 11:30 AM',
    '02:00 PM - 02:30 PM',
    '03:00 PM - 03:30 PM',
    '04:00 PM - 04:30 PM'
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-slate-900">Hospital & Specialist Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Locate active medical facilities and secure consultation bookings</p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search by City */}
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              type="text"
              placeholder="Search by city (e.g. Metropolis)..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/10"
            />
          </div>

          {/* Specialty Filter Dropdown */}
          <select 
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/10"
          >
            <option value="">All Specialties</option>
            <option value="Cardiologist">Cardiologist</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Ophthalmologist">Ophthalmologist</option>
            <option value="General Physician">General Physician</option>
            <option value="Neurologist">Neurologist</option>
            <option value="Orthopedic Specialist">Orthopedic Specialist</option>
            <option value="Pediatrician">Pediatrician</option>
          </select>

          {/* ICU Filter */}
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm select-none cursor-pointer">
            <input 
              type="checkbox"
              checked={onlyICU}
              onChange={(e) => setOnlyICU(e.target.checked)}
              className="rounded text-primary-500"
            />
            <span className="text-slate-600 font-semibold text-xs uppercase tracking-wider">With ICU Beds</span>
          </label>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
          <span className="text-slate-400 font-medium text-sm">Searching nearest hospitals...</span>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-heading font-bold text-slate-700 mb-1">No Hospitals Found</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            No active medical facilities fit your selected filters. Please adjust the search term or checkboxes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {hospitals.map((hospital) => {
            // Find doctors matching this hospital
            const hospitalDocs = doctors.filter(doc => doc.hospital?._id === hospital._id);
            const isExpanded = expandedHospitalId === hospital._id;

            return (
              <div 
                key={hospital._id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                {/* Hospital Core Row */}
                <div className="p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  
                  {/* Left Column Info */}
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-100/50 flex items-center justify-center shrink-0">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-lg text-slate-800 flex items-center gap-2">
                        {hospital.name}
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">
                          {hospital.distance} km away
                        </span>
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {hospital.address}, {hospital.city}
                      </p>
                      <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {hospital.contactPhone}
                      </p>
                    </div>
                  </div>

                  {/* Mid Bed Vaccancy Stats */}
                  <div className="flex gap-8 items-center bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full md:w-auto shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">General Beds</span>
                      <span className="font-heading font-black text-slate-800 text-lg flex items-center gap-1.5 mt-0.5">
                        <Bed className="w-4 h-4 text-primary-500" />
                        {hospital.bedsAvailable} <span className="text-slate-300 text-xs font-normal">/ {hospital.bedsTotal}</span>
                      </span>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ICU Beds</span>
                      <span className={`font-heading font-black text-lg flex items-center gap-1.5 mt-0.5 ${hospital.icuAvailable > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        <ShieldCheck className="w-4 h-4" />
                        {hospital.icuAvailable} <span className="text-slate-300 text-xs font-normal">/ {hospital.icuTotal}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => setExpandedHospitalId(isExpanded ? null : hospital._id)}
                      className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      {isExpanded ? 'Hide Doctors' : `View Doctors (${hospitalDocs.length})`}
                    </button>
                    {hospital.icuAvailable > 0 && (
                      <button 
                        onClick={() => navigate('/emergency')}
                        className="px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-extrabold transition-all"
                      >
                        SOS Route
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Doctors List Panel */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 bg-slate-50/50"
                    >
                      <div className="p-6 flex flex-col gap-4">
                        <h4 className="font-heading font-bold text-slate-700 text-xs uppercase tracking-wider">Available Specialists inside this facility</h4>
                        
                        {hospitalDocs.length === 0 ? (
                          <p className="text-slate-400 text-xs italic">
                            No doctors found matching filters inside this hospital. Try clearing specialty filters.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {hospitalDocs.map((doctor) => (
                              <div 
                                key={doctor._id}
                                className="bg-white border border-slate-200/80 rounded-xl p-4 flex justify-between items-center hover:border-primary-500/20 transition-all shadow-sm"
                              >
                                <div className="flex gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold">
                                    👨‍⚕️
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                                      {doctor.name}
                                      <span className="flex items-center text-[10px] text-amber-500 font-bold">
                                        <Star className="w-3 h-3 fill-current mr-0.5" />
                                        {doctor.rating}
                                      </span>
                                    </h5>
                                    <p className="text-slate-400 text-xs font-semibold">{doctor.specialty} • {doctor.experience} Yrs exp</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                      doctor.availability === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                    }`}>
                                      {doctor.availability}
                                    </span>
                                  </div>
                                </div>

                                <button 
                                  onClick={() => setSelectedDoctor(doctor)}
                                  disabled={doctor.availability !== 'Available'}
                                  className="px-4 py-2.5 rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  Book
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>
      )}

      {/* APPOINTMENT BOOKING DIALOG/MODAL */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 relative overflow-hidden"
            >
              <button 
                onClick={() => { setSelectedDoctor(null); setBookingSuccess(null); setBookingError(''); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>

              {!bookingSuccess ? (
                <>
                  <h3 className="font-heading font-extrabold text-slate-900 text-lg mb-1">Confirm Appointment</h3>
                  <p className="text-slate-400 text-xs font-medium mb-6">Booking for {selectedDoctor.name} ({selectedDoctor.specialty})</p>

                  {bookingError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold">
                      {bookingError}
                    </div>
                  )}

                  <form onSubmit={handleBookAppointment} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Choose Date</label>
                      <input 
                        type="date"
                        required
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Time Slot</label>
                      <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto pr-1">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setBookingTime(slot)}
                            className={`py-2 rounded-xl text-[10px] font-bold text-center border transition-all ${
                              bookingTime === slot 
                                ? 'bg-primary-500 text-white border-primary-500' 
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            {slot.split(' - ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="mt-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary-500/10"
                    >
                      {bookingLoading ? 'Confirming Ticket...' : 'Secure Appointment'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-6 h-6 animate-[heartbeat_1.5s_infinite]" />
                  </div>
                  <h3 className="font-heading font-black text-slate-800 text-lg mb-1">Appointment Confirmed!</h3>
                  <p className="text-slate-400 text-xs font-semibold mb-4">Your ticket ID: <span className="font-mono text-primary-600 font-bold bg-primary-50 px-2 py-0.5 rounded">{bookingSuccess.appointmentId}</span></p>
                  
                  <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-left text-xs text-slate-600 flex flex-col gap-1.5 mb-6">
                    <div className="flex justify-between"><span>Doctor:</span><span className="font-bold text-slate-800">{selectedDoctor.name}</span></div>
                    <div className="flex justify-between"><span>Hospital:</span><span className="font-bold text-slate-800">{bookingSuccess.hospital?.name || 'MediRoute Center'}</span></div>
                    <div className="flex justify-between"><span>Date:</span><span className="font-bold text-slate-800">{new Date(bookingSuccess.date).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span>Time:</span><span className="font-bold text-slate-800">{bookingSuccess.timeSlot}</span></div>
                  </div>

                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => { setSelectedDoctor(null); setBookingSuccess(null); }}
                      className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary-500/10"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HospitalFinder;
