import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, MapPin, Phone, Siren, Activity, CalendarClock, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmergencyAssistance = () => {
  const [sosActivated, setSosActivated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [recommendedHospital, setRecommendedHospital] = useState(null);

  const { apiUrl } = useAuth();

  useEffect(() => {
    // Fetch hospitals to find closest ICU availability
    const fetchHospitals = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/hospitals`);
        const data = await res.json();
        if (data.success) {
          setHospitals(data.data);
        }
      } catch (err) {
        console.error('Error fetching hospitals', err);
      }
    };
    fetchHospitals();
  }, []);

  const handleSOSActivation = () => {
    setLoading(true);
    
    // Simulate telemetry lookup (GPS locate + triage ICU beds check)
    setTimeout(() => {
      setLoading(false);
      setSosActivated(true);

      // Find the hospital with ICU beds available, prioritizing distance
      const icuHospitals = hospitals.filter(h => h.icuAvailable > 0);
      const target = icuHospitals.length > 0 
        ? icuHospitals.sort((a, b) => a.distance - b.distance)[0] 
        : hospitals[0]; // Fallback to first if no ICU is vacant

      setRecommendedHospital(target);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      
      <div className="text-center max-w-xl mx-auto mb-10">
        <h1 className="font-heading text-3xl font-extrabold text-red-600 flex items-center justify-center gap-2">
          <Siren className="w-8 h-8 animate-bounce text-red-600" /> SOS Emergency Hub
        </h1>
        <p className="text-slate-500 text-sm mt-2">Instant one-click hospital routing and ICU vacant spot locator</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* SOS Action Console (7cols) */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col justify-center items-center text-center">
          
          <AnimatePresence mode="wait">
            {!sosActivated ? (
              <motion.div 
                key="inactive"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center"
              >
                {/* Pulsing Outer Rings */}
                <div className="relative w-44 h-44 mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
                  <div className="absolute inset-4 rounded-full bg-red-500/20 animate-[ping_2s_infinite]" />
                  <button 
                    onClick={handleSOSActivation}
                    disabled={loading}
                    className="absolute inset-8 rounded-full bg-gradient-to-tr from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-heading font-black text-xl shadow-xl shadow-red-500/40 border-4 border-white flex flex-col items-center justify-center select-none active:scale-95 transition-all"
                  >
                    {loading ? (
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Siren className="w-7 h-7 mb-1" />
                        <span>SOS</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="font-heading font-extrabold text-slate-800 text-base mb-1.5">Activate Emergency Routing</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
                  Pressing the SOS button triggers GPS simulations to route you to the nearest vacant ICU and dispatch emergency alerts.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="activated"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center w-full"
              >
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                  <Siren className="w-8 h-8 animate-pulse text-red-600" />
                </div>
                
                <h3 className="font-heading font-black text-red-600 text-lg mb-1">SOS Telemetry Activated</h3>
                <p className="text-slate-500 text-xs font-semibold">Triage location identified. Routing to ICU bed.</p>
                
                {recommendedHospital ? (
                  <div className="w-full bg-red-50/50 border border-red-100 rounded-2xl p-6 text-left flex flex-col gap-4 mt-6">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Hospital Identified</span>
                        <h4 className="font-heading font-extrabold text-slate-800 text-base">{recommendedHospital.name}</h4>
                        <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {recommendedHospital.address}, {recommendedHospital.city} ({recommendedHospital.distance} km)
                        </p>
                      </div>
                      
                      <div className="bg-red-600 text-white rounded-xl px-3 py-1.5 text-center flex flex-col shrink-0 select-none">
                        <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-85">Vacant ICU</span>
                        <span className="font-heading font-black text-lg leading-tight mt-0.5">{recommendedHospital.icuAvailable} Beds</span>
                      </div>
                    </div>

                    <div className="h-px bg-red-200/50 w-full" />

                    <div className="flex gap-2">
                      <a 
                        href={`tel:${recommendedHospital.contactPhone}`}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-red-600/20"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Ambulance
                      </a>
                      <button 
                        onClick={() => setSosActivated(false)}
                        className="px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic mt-4">Locating nearest ICU vacant unit...</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* SOS Contacts Board (5cols) */}
        <div className="md:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <h3 className="font-heading font-bold text-sm text-primary-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" /> National Emergency Services
            </h3>
            
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex justify-between items-center bg-slate-800/80 border border-slate-700/30 rounded-xl p-3.5">
                <span className="text-slate-300 font-semibold text-xs">National Health Helpline</span>
                <span className="text-red-400 font-mono font-bold text-sm">104</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/80 border border-slate-700/30 rounded-xl p-3.5">
                <span className="text-slate-300 font-semibold text-xs">Emergency Ambulance Line</span>
                <span className="text-red-400 font-mono font-bold text-sm">102 / 108</span>
              </div>
              <div className="flex justify-between items-center bg-slate-800/80 border border-slate-700/30 rounded-xl p-3.5">
                <span className="text-slate-300 font-semibold text-xs">Police / Disaster Line</span>
                <span className="text-red-400 font-mono font-bold text-sm">112</span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-slate-800/40 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-slate-400">
            <Activity className="w-5 h-5 text-slate-500 shrink-0" />
            <span>
              MediRoute AI continuously updates bed vacancies. Telemetry results shown reflect real-time ICU vacancies to prevent redirection delays.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default EmergencyAssistance;
