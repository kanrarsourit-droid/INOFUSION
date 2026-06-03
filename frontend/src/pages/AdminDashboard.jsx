import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, UserCog, Building, FileSpreadsheet, Plus, Edit2, Trash2, ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Doctor Form states
  const [docName, setDocName] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('General Physician');
  const [docExp, setDocExp] = useState('');
  const [docHospital, setDocHospital] = useState('');
  const [docAvail, setDocAvail] = useState('Available');
  const [editingDoctorId, setEditingDoctorId] = useState(null);

  // Hospital Edit states
  const [editingHospitalId, setEditingHospitalId] = useState(null);
  const [hospBedsAvail, setHospBedsAvail] = useState('');
  const [hospICUAvail, setHospICUAvail] = useState('');

  const { token, apiUrl, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      alert('Unauthorized! Admin rights required.');
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [isAuthenticated, user]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDoctors(),
        fetchHospitals(),
        fetchAppointments()
      ]);
    } catch (err) {
      console.error('Error loading admin lists', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    const res = await fetch(`${apiUrl}/api/doctors`);
    const data = await res.json();
    if (data.success) {
      setDoctors(data.data);
    }
  };

  const fetchHospitals = async () => {
    const res = await fetch(`${apiUrl}/api/hospitals`);
    const data = await res.json();
    if (data.success) {
      setHospitals(data.data);
      if (data.data.length > 0 && !docHospital) {
        setDocHospital(data.data[0]._id);
      }
    }
  };

  const fetchAppointments = async () => {
    const res = await fetch(`${apiUrl}/api/appointments/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      setAppointments(data.data);
    }
  };

  // Add or Edit Doctor
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!docName || !docExp || !docHospital) return;

    const payload = {
      name: docName,
      specialty: docSpecialty,
      experience: parseInt(docExp),
      hospital: docHospital,
      availability: docAvail
    };

    try {
      let res;
      if (editingDoctorId) {
        res = await fetch(`${apiUrl}/api/doctors/${editingDoctorId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${apiUrl}/api/doctors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        resetDoctorForm();
        fetchDoctors();
        alert(editingDoctorId ? 'Doctor updated successfully!' : 'Doctor added successfully!');
      } else {
        alert(data.message || 'Action failed.');
      }
    } catch (err) {
      alert('Error updating doctor profile.');
    }
  };

  const resetDoctorForm = () => {
    setDocName('');
    setDocSpecialty('General Physician');
    setDocExp('');
    setDocAvail('Available');
    setEditingDoctorId(null);
  };

  const handleEditDoctorClick = (doc) => {
    setEditingDoctorId(doc._id);
    setDocName(doc.name);
    setDocSpecialty(doc.specialty);
    setDocExp(doc.experience.toString());
    setDocHospital(doc.hospital?._id || hospIdSelectFallback());
    setDocAvail(doc.availability);
  };

  const hospIdSelectFallback = () => {
    return hospitals.length > 0 ? hospitals[0]._id : '';
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/doctors/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchDoctors();
      }
    } catch (err) {
      alert('Error deleting doctor profile.');
    }
  };

  // Update Hospital Beds count
  const handleUpdateBeds = async (e, hospId) => {
    e.preventDefault();
    if (!hospBedsAvail && !hospICUAvail) return;

    // Build patch body
    const payload = {};
    if (hospBedsAvail !== '') payload.bedsAvailable = parseInt(hospBedsAvail);
    if (hospICUAvail !== '') payload.icuAvailable = parseInt(hospICUAvail);

    try {
      const res = await fetch(`${apiUrl}/api/hospitals/${hospId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setEditingHospitalId(null);
        setHospBedsAvail('');
        setHospICUAvail('');
        fetchHospitals();
      }
    } catch (err) {
      alert('Error updating hospital beds data.');
    }
  };

  // Confirm/Cancel Appointment Status
  const handleAppointmentStatus = async (id, status) => {
    try {
      const res = await fetch(`${apiUrl}/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchAppointments();
      }
    } catch (err) {
      alert('Error updating appointment status.');
    }
  };

  // Statistics counters
  const totalBedsAvail = hospitals.reduce((sum, h) => sum + h.bedsAvailable, 0);
  const totalBedsTotal = hospitals.reduce((sum, h) => sum + h.bedsTotal, 0);
  const totalICUAvail = hospitals.reduce((sum, h) => sum + h.icuAvailable, 0);
  const totalICUTotal = hospitals.reduce((sum, h) => sum + h.icuTotal, 0);

  const specialtiesList = [
    'Cardiologist',
    'Dermatologist',
    'Ophthalmologist',
    'General Physician',
    'Neurologist',
    'Orthopedic Specialist',
    'Pediatrician'
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-8 items-start">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl p-4 shrink-0 shadow-sm flex flex-col gap-2">
        <div className="pb-4 mb-4 border-b border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Control</span>
          <h2 className="font-heading font-black text-slate-800 mt-0.5 text-base">MediRoute Console</h2>
        </div>
        
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
            activeTab === 'analytics' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Dashboard Analytics
        </button>

        <button 
          onClick={() => setActiveTab('doctors')}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
            activeTab === 'doctors' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCog className="w-4 h-4" />
          Doctors Manager
        </button>

        <button 
          onClick={() => setActiveTab('hospitals')}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
            activeTab === 'hospitals' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          Hospitals Bed Manager
        </button>

        <button 
          onClick={() => setActiveTab('appointments')}
          className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
            activeTab === 'appointments' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Appointment Tickets
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
            <span className="text-slate-400 font-medium text-sm">Syncing console data...</span>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            
            {/* TAB 1: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="font-heading font-black text-slate-800 text-lg">Hospital System Analytics</h3>
                  <p className="text-slate-400 text-xs mt-1">Real-time aggregate data across all connected medical facilities</p>
                </div>

                {/* Dashboard Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hospitals Connected</span>
                    <span className="font-heading font-black text-2xl text-slate-800 mt-1 block">{hospitals.length}</span>
                  </div>
                  <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Doctors Live</span>
                    <span className="font-heading font-black text-2xl text-slate-800 mt-1 block">{doctors.length}</span>
                  </div>
                  <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">General Beds (Avail/Total)</span>
                    <span className="font-heading font-black text-2xl text-slate-800 mt-1 block">
                      {totalBedsAvail} <span className="text-slate-300 font-normal text-sm">/ {totalBedsTotal}</span>
                    </span>
                  </div>
                  <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ICU Beds (Avail/Total)</span>
                    <span className={`font-heading font-black text-2xl mt-1 block ${totalICUAvail > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {totalICUAvail} <span className="text-slate-300 font-normal text-sm">/ {totalICUTotal}</span>
                    </span>
                  </div>
                </div>

                {/* Simulated Chart visual using CSS */}
                <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/20">
                  <h4 className="font-heading font-bold text-slate-700 text-xs uppercase tracking-wider mb-6">Hospital Occupancy comparison</h4>
                  <div className="flex flex-col gap-5">
                    {hospitals.map(h => {
                      const pct = Math.round((h.bedsAvailable / h.bedsTotal) * 100) || 0;
                      return (
                        <div key={h._id} className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-xs font-semibold">
                            <span className="text-slate-700">{h.name}</span>
                            <span className="text-primary-600 font-bold">{pct}% vacant ({h.bedsAvailable} / {h.bedsTotal} beds)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-primary-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DOCTOR CRUD */}
            {activeTab === 'doctors' && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-heading font-black text-slate-800 text-lg">Doctors Profiles Manager</h3>
                    <p className="text-slate-400 text-xs mt-1">Add, edit, or remove specialists and availability states</p>
                  </div>
                </div>

                {/* Doctor creation form */}
                <form onSubmit={handleDoctorSubmit} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex flex-col gap-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {editingDoctorId ? 'Edit Doctor Profile' : 'Add New Doctor Profile'}
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text"
                        required
                        placeholder="Dr. John Watson"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-1"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Specialty Department</label>
                      <select
                        value={docSpecialty}
                        onChange={(e) => setDocSpecialty(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-1"
                      >
                        {specialtiesList.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Experience (Years)</label>
                      <input 
                        type="number"
                        required
                        placeholder="e.g. 10"
                        value={docExp}
                        onChange={(e) => setDocExp(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Hospital</label>
                      <select 
                        value={docHospital}
                        onChange={(e) => setDocHospital(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none"
                      >
                        {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Availability Status</label>
                      <select 
                        value={docAvail}
                        onChange={(e) => setDocAvail(e.target.value)}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none"
                      >
                        <option value="Available">Available</option>
                        <option value="Busy">Busy</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2.5 justify-end">
                    {editingDoctorId && (
                      <button 
                        type="button"
                        onClick={resetDoctorForm}
                        className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      className="px-5 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-sm"
                    >
                      {editingDoctorId ? 'Save Changes' : 'Add Specialist'}
                    </button>
                  </div>
                </form>

                {/* Doctor List */}
                <div className="border border-slate-100 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                        <th className="p-4 uppercase tracking-wider">Name</th>
                        <th className="p-4 uppercase tracking-wider">Specialty</th>
                        <th className="p-4 uppercase tracking-wider">Hospital</th>
                        <th className="p-4 uppercase tracking-wider">Status</th>
                        <th className="p-4 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctors.map(doc => (
                        <tr key={doc._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-800">{doc.name} <span className="text-[10px] text-slate-400 font-normal">({doc.experience} yrs)</span></td>
                          <td className="p-4 text-slate-600 font-semibold">{doc.specialty}</td>
                          <td className="p-4 text-slate-500">{doc.hospital?.name || 'Unassigned'}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              doc.availability === 'Available' ? 'bg-emerald-50 text-emerald-600' : doc.availability === 'Busy' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-500'
                            }`}>
                              {doc.availability}
                            </span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditDoctorClick(doc)}
                              className="p-2 rounded bg-slate-100 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteDoctor(doc._id)}
                              className="p-2 rounded bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: HOSPITAL BEDS UPDATE */}
            {activeTab === 'hospitals' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="font-heading font-black text-slate-800 text-lg">Hospital Bed Vaccancies Manager</h3>
                  <p className="text-slate-400 text-xs mt-1">Configure general and ICU vacant counts for real-time routing accuracy</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {hospitals.map(h => {
                    const isEditing = editingHospitalId === h._id;

                    return (
                      <div 
                        key={h._id} 
                        className="border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold">🏥</div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{h.name}</h4>
                            <p className="text-slate-400 text-[10px] font-semibold">{h.address}, {h.city}</p>
                          </div>
                        </div>

                        {isEditing ? (
                          <form onSubmit={(e) => handleUpdateBeds(e, h._id)} className="flex flex-wrap items-end gap-3 w-full sm:w-auto">
                            <div className="flex flex-col gap-1 w-24">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Avail Gen Beds</label>
                              <input 
                                type="number" 
                                required
                                value={hospBedsAvail}
                                onChange={(e) => setHospBedsAvail(e.target.value)}
                                placeholder={h.bedsAvailable.toString()}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs w-full focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1 w-24">
                              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Avail ICU Beds</label>
                              <input 
                                type="number" 
                                required
                                value={hospICUAvail}
                                onChange={(e) => setHospICUAvail(e.target.value)}
                                placeholder={h.icuAvailable.toString()}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs w-full focus:outline-none"
                              />
                            </div>
                            <div className="flex gap-1.5">
                              <button type="submit" className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                              <button type="button" onClick={() => setEditingHospitalId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex gap-4 font-heading text-xs font-bold">
                              <span className="text-slate-600">Beds: <span className="text-slate-800 font-extrabold">{h.bedsAvailable} / {h.bedsTotal}</span></span>
                              <span className="text-slate-600">ICU: <span className={`${h.icuAvailable > 0 ? 'text-emerald-600' : 'text-red-500'} font-extrabold`}>{h.icuAvailable} / {h.icuTotal}</span></span>
                            </div>
                            <button 
                              onClick={() => { setEditingHospitalId(h._id); setHospBedsAvail(h.bedsAvailable.toString()); setHospICUAvail(h.icuAvailable.toString()); }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-[10px] font-black uppercase tracking-wider transition-colors"
                            >
                              Update vacancy
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: APPOINTMENTS VIEW */}
            {activeTab === 'appointments' && (
              <div className="flex flex-col gap-8">
                <div>
                  <h3 className="font-heading font-black text-slate-800 text-lg">Appointment Consultation Tickets</h3>
                  <p className="text-slate-400 text-xs mt-1">Audit and update patient booking schedules</p>
                </div>

                <div className="border border-slate-100 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                        <th className="p-4 uppercase tracking-wider">Ticket ID</th>
                        <th className="p-4 uppercase tracking-wider">Patient Name</th>
                        <th className="p-4 uppercase tracking-wider">Doctor Specialist</th>
                        <th className="p-4 uppercase tracking-wider">Date & Time</th>
                        <th className="p-4 uppercase tracking-wider">Status</th>
                        <th className="p-4 uppercase tracking-wider text-right">Approval Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(apt => (
                        <tr key={apt._id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="p-4 font-mono font-bold text-primary-600">{apt.appointmentId}</td>
                          <td className="p-4 font-bold text-slate-800">{apt.patient?.name || 'Deleted Account'} <span className="text-[10px] text-slate-400 font-normal">({apt.patient?.email})</span></td>
                          <td className="p-4 text-slate-600 font-semibold">{apt.doctor?.name || 'Clinic Specialist'} <span className="text-[10px] text-slate-400 font-normal">({apt.doctor?.specialty})</span></td>
                          <td className="p-4 text-slate-500 font-medium">{new Date(apt.date).toLocaleDateString()} • {apt.timeSlot.split(' - ')[0]}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : apt.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-600'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            {apt.status !== 'Confirmed' && (
                              <button 
                                onClick={() => handleAppointmentStatus(apt._id, 'Confirmed')}
                                className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                title="Confirm"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {apt.status !== 'Cancelled' && (
                              <button 
                                onClick={() => handleAppointmentStatus(apt._id, 'Cancelled')}
                                className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
