import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import HeroCanvas from '../components/HeroCanvas';
import { Activity, ShieldAlert, ArrowRight, ClipboardCheck, Compass, CalendarCheck, ShieldCheck, HeartHandshake, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { apiUrl } = useAuth();
  
  // Real-time counter/stats mock states (pulsating to feel alive)
  const [stats, setStats] = useState({
    hospitals: 12,
    beds: 145,
    doctors: 47,
    served: 2840
  });

  useEffect(() => {
    // Pulse numbers slightly during the session to simulate live telemetry
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        beds: prev.beds + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0),
        served: prev.served + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden min-h-screen">
      
      {/* BACKGROUND GRAPHICS */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary-200/20 to-secondary-200/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-100/10 to-primary-100/20 rounded-full blur-2xl -z-10 pointer-events-none" />

      {/* HERO SECTION */}
      <section id="home" className="max-w-7xl mx-auto px-6 pt-12 pb-24 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left copy */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100/50 w-fit text-primary-700 text-xs font-bold uppercase tracking-wider">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            AI-Powered Healthcare Navigation
          </div>
          
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Find the right <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Doctor</span>, Hospital, and Care Instantly
          </h1>
          
          <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
            MediRoute AI analyzes your symptoms using Gemini generative intelligence, recommends immediate medical actions, finds real-time hospital bed allocations, and schedules instant doctor appointments.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              to="/triage" 
              className="px-6 py-3.5 bg-primary-500 hover:bg-primary-600 shadow-lg shadow-primary-500/25 text-white font-bold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 transition-all group"
            >
              Check Symptoms
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/hospitals" 
              className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl hover:-translate-y-0.5 transition-all"
            >
              Find Hospitals
            </Link>
            <Link 
              to="/emergency" 
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 text-white font-bold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              Emergency Help
            </Link>
          </div>
        </motion.div>

        {/* Right Canvas illustration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <HeroCanvas />
        </motion.div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-14 shadow-lg shadow-primary-500/10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold tracking-tight font-heading">{stats.hospitals}+</span>
            <span className="text-sm font-medium text-white/80 mt-1 uppercase tracking-wider">Hospitals Connected</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold tracking-tight font-heading animate-pulse">{stats.beds}</span>
            <span className="text-sm font-medium text-white/80 mt-1 uppercase tracking-wider">Available Beds</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold tracking-tight font-heading">{stats.doctors}+</span>
            <span className="text-sm font-medium text-white/80 mt-1 uppercase tracking-wider">Specialists Live</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold tracking-tight font-heading">{stats.served}+</span>
            <span className="text-sm font-medium text-white/80 mt-1 uppercase tracking-wider">Patients Routed</span>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">
            Designed for Modern Medical Triage
          </h2>
          <p className="text-slate-500">
            Streamlining emergency admissions and routing using smart AI decision systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 hover:shadow-xl hover:border-primary-500/20 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-slate-800 mb-3">AI Symptom Checker</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Describe symptoms naturally. Our system evaluates urgency levels, matches keywords, and recommends optimal clinical care types.
            </p>
            <Link to="/triage" className="text-primary-500 font-bold text-sm inline-flex items-center gap-1 hover:underline">
              Analyze Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 hover:shadow-xl hover:border-primary-500/20 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-slate-800 mb-3">Hospital Bed Tracker</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              View live bed and ICU vacancy tallies in hospitals. Filter by location and distance to optimize transport routing.
            </p>
            <Link to="/hospitals" className="text-primary-500 font-bold text-sm inline-flex items-center gap-1 hover:underline">
              Browse Beds <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 hover:shadow-xl hover:border-primary-500/20 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-slate-800 mb-3">Instant Consultations</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Book consultations with matching specialists instantly. Generates unique tracking IDs for seamless administrative check-in.
            </p>
            <Link to="/login" className="text-primary-500 font-bold text-sm inline-flex items-center gap-1 hover:underline">
              Book Appointment <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-slate-100/50 border-t border-b border-slate-200/50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">How MediRoute AI Operates</h2>
            <p className="text-slate-500 text-sm">Four seamless steps to optimized patient triage.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center px-4 relative">
              <div className="w-14 h-14 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center font-heading font-extrabold text-primary-500 text-xl mb-5">1</div>
              <h4 className="font-bold text-base text-slate-800 mb-2">Input Symptoms</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Enter your signs or physical complaints along with basic demographic data.</p>
            </div>
            
            <div className="flex flex-col items-center text-center px-4 relative">
              <div className="w-14 h-14 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center font-heading font-extrabold text-primary-500 text-xl mb-5">2</div>
              <h4 className="font-bold text-base text-slate-800 mb-2">AI Analyzes Case</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Our backend triggers Gemini API (or rules logic) to evaluate triage priority levels.</p>
            </div>

            <div className="flex flex-col items-center text-center px-4 relative">
              <div className="w-14 h-14 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center font-heading font-extrabold text-primary-500 text-xl mb-5">3</div>
              <h4 className="font-bold text-base text-slate-800 mb-2">Select Best Hospital</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Review nearest facilities, tracking available general and ICU bed spaces.</p>
            </div>

            <div className="flex flex-col items-center text-center px-4 relative">
              <div className="w-14 h-14 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center font-heading font-extrabold text-primary-500 text-xl mb-5">4</div>
              <h4 className="font-bold text-base text-slate-800 mb-2">Confirm Appointment</h4>
              <p className="text-slate-500 text-xs leading-relaxed">Secure timeslots with your matched specialist to save critical diagnostic minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US / TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
            Engineered for Resilience, Built for Crises
          </h2>
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base mb-1">Dual-Engine Fallback Design</h4>
                <p className="text-slate-500 text-sm">If API limits or credentials fail, our built-in keyword-mapping rules keep the triage engine online seamlessly.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base mb-1">Direct Clinic Routing</h4>
                <p className="text-slate-500 text-sm">Empower emergency dispatch and walk-in triage by verifying which facilities can receive new incoming patients.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col gap-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
          <h4 className="font-heading text-lg font-bold text-primary-400">🚨 Developer Hackathon Note</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            The platform is pre-loaded with mock hospitals, specialized doctors, and complete authentication modules. Log in with our preset admin or patient accounts to test the entire appointment cycle instantly.
          </p>
          <div className="bg-slate-800/80 rounded-xl p-4 flex flex-col gap-2 font-mono text-xs border border-slate-700/50">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Credential Shortcuts</span>
            <div className="flex justify-between border-b border-slate-700/30 pb-1.5">
              <span>Patient Login:</span>
              <span className="text-primary-300">patient@mediroute.com / patient123</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span>Admin Login:</span>
              <span className="text-secondary-300">admin@mediroute.com / admin123</span>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-slate-100/50 py-24 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-3">
            <h2 className="font-heading text-3xl font-extrabold">Endorsed by Clinical Personnel</h2>
            <p className="text-slate-500 text-sm">Read feedbacks from medical staff utilizing our scheduling backend.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <div className="flex gap-1 text-amber-500"><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /></div>
              <p className="text-slate-600 text-sm leading-relaxed italic">"MediRoute AI dramatically decreases our ER check-in gridlock. Booking symptoms ahead of time saves lives."</p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-9 h-9 rounded-full bg-slate-200 font-bold flex items-center justify-center text-xs">SM</div>
                <div><h5 className="font-bold text-slate-800 text-xs">Dr. Sarah Miller</h5><span className="text-slate-400 text-[10px]">Head of Emergency, City Central</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <div className="flex gap-1 text-amber-500"><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /></div>
              <p className="text-slate-600 text-sm leading-relaxed italic">"The live bed-occupancy database is exceptionally simple to update. Our administrative team saves hours."</p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-9 h-9 rounded-full bg-slate-200 font-bold flex items-center justify-center text-xs">RJ</div>
                <div><h5 className="font-bold text-slate-800 text-xs">Richard Jackson</h5><span className="text-slate-400 text-[10px]">Ops Director, Apex Center</span></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <div className="flex gap-1 text-amber-500"><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /></div>
              <p className="text-slate-600 text-sm leading-relaxed italic">"Connecting patients directly to the correct specialists prevents double-bookings. Truly startup-level."</p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <div className="w-9 h-9 rounded-full bg-slate-200 font-bold flex items-center justify-center text-xs">AP</div>
                <div><h5 className="font-bold text-slate-800 text-xs">Alice Patel</h5><span className="text-slate-400 text-[10px]">Outpatient Clinic Lead</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center flex flex-col gap-6 items-center">
          <h2 className="font-heading text-3xl font-extrabold text-slate-900">Contact Our Team</h2>
          <p className="text-slate-500 max-w-md text-sm">
            Have questions about system integrations? We are happy to help implement MediRoute AI at your clinical site.
          </p>
          <form className="w-full max-w-md flex flex-col gap-4 mt-2" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully! Our integrations team will get back to you shortly.'); }}>
            <input type="text" placeholder="Your Name" required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm" />
            <input type="email" placeholder="Your Email Address" required className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm" />
            <textarea placeholder="How can we assist you?" required rows="3" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm resize-none"></textarea>
            <button type="submit" className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-500/10">Send Message</button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Landing;
