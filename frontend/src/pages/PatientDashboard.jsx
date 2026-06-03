import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarClock, ShieldCheck, HeartHandshake, ShieldAlert, ArrowRight, Activity, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token, apiUrl, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchPatientAppointments();
  }, [isAuthenticated]);

  const fetchPatientAppointments = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/appointments/patient`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (err) {
      console.error('Error fetching appointments', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock recommendations based on general wellness
  const recommendations = [
    { id: 1, title: 'Monitor Hydration Levels', desc: 'Drink at least 3 liters of filtered water daily to maintain renal health.' },
    { id: 2, title: 'Schedule Eye Tests Yearly', desc: 'If matching Ophthalmologists, complete refraction screening biannually.' },
    { id: 3, title: 'Cardiac Wellness Routines', desc: 'Aim for 30 minutes of cardiovascular exercises 5 times a week.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* Welcome header block */}
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <span className="text-xs font-bold text-primary-500 uppercase tracking-widest">Medical Record Hub</span>
          <h1 className="font-heading text-3xl font-black text-slate-800 mt-1">Hello, {user?.name || 'Valued Patient'}</h1>
          <p className="text-slate-400 text-xs font-semibold">Email: {user?.email} • Account Type: Patient</p>
        </div>

        {/* SOS Emergency routing button */}
        <Link 
          to="/emergency"
          className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-md shadow-red-500/25 transition-all flex items-center gap-1.5 animate-pulse"
        >
          <ShieldAlert className="w-4 h-4 animate-bounce" /> Activate SOS Mode
        </Link>
      </div>

      {/* Grid of dashboards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Appointments history (8cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-heading font-black text-slate-800 text-base flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-primary-500" /> Appointment Schedule
              </h3>
              <button 
                onClick={() => navigate('/hospitals')}
                className="text-primary-500 text-xs font-bold hover:underline flex items-center gap-1"
              >
                Book New <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-600 text-sm mb-1">No Bookings Recorded</h4>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                  You have not scheduled any clinical consultations yet. Match symptoms or browse hospitals to book.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {appointments.map((apt) => (
                  <div 
                    key={apt._id}
                    className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">
                        📋
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          {apt.doctor?.name || 'Medical Officer'} 
                          <span className="text-slate-400 text-xs font-normal"> ({apt.doctor?.specialty || 'General'})</span>
                        </h4>
                        <p className="text-slate-400 text-[11px] font-semibold mt-0.5">{apt.hospital?.name || 'Clinic Facility'}</p>
                        
                        <div className="flex gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1.5">
                          <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" /> {new Date(apt.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.timeSlot}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                      <span className="text-[10px] font-mono text-slate-400 font-bold bg-white px-2 py-0.5 border border-slate-200 rounded">
                        {apt.appointmentId}
                      </span>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : apt.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Health recommendations (4cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick Metrics Triage card */}
          <div className="bg-gradient-to-tr from-primary-600 to-secondary-600 text-white rounded-2xl p-6 shadow-md shadow-primary-500/10">
            <h4 className="font-heading font-black text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-200 animate-pulse" /> Diagnostic Triage
            </h4>
            <p className="text-white/80 text-xs leading-relaxed mt-2 mb-4">
              Having severe, painful or recurring symptoms? Use the symptom checker to verify clinical urgency department options.
            </p>
            <button 
              onClick={() => navigate('/triage')}
              className="w-full py-3 bg-white text-primary-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm hover:bg-slate-50 transition-colors"
            >
              Analyze symptoms now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recommendations checklist */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-heading font-black text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <HeartHandshake className="w-4.5 h-4.5 text-primary-500" /> Health Checklist
            </h3>
            <div className="flex flex-col gap-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <h4 className="font-bold text-slate-700 text-xs">{rec.title}</h4>
                  <p className="text-slate-400 text-[10px] leading-relaxed mt-1">{rec.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PatientDashboard;
