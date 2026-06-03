import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldAlert, ArrowRight, ArrowLeft, Send, Sparkles, Stethoscope, Clock, Calendar } from 'lucide-react';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const { apiUrl } = useAuth();
  const navigate = useNavigate();

  const handleTriage = async (e) => {
    e.preventDefault();
    if (!symptoms) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch(`${apiUrl}/api/triage/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, age: parseInt(age) || null, gender })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        setErrorMsg(data.message || 'Triage analysis failed.');
      }
    } catch (err) {
      setErrorMsg('Connection error. Could not contact triage backend.');
    } finally {
      setLoading(false);
    }
  };

  // Help determine visual styles based on Urgency Levels
  const getUrgencyStyles = (level) => {
    const l = level?.toLowerCase();
    if (l === 'critical') {
      return {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        badge: 'bg-red-600 text-white',
        desc: 'Severe emergency risk. Medical care is required immediately.'
      };
    }
    if (l === 'high') {
      return {
        bg: 'bg-orange-50 border-orange-200',
        text: 'text-orange-800',
        badge: 'bg-orange-500 text-white',
        desc: 'Urgent medical risk. Please contact a clinic promptly.'
      };
    }
    if (l === 'medium') {
      return {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-800',
        badge: 'bg-blue-500 text-white',
        desc: 'Moderate risk. Plan a consultation with a specialist.'
      };
    }
    return {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      badge: 'bg-emerald-500 text-white',
      desc: 'Low urgency risk. Home recovery or routine checkups advised.'
    };
  };

  const urgency = result ? getUrgencyStyles(result.urgency) : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      
      {/* Back to Home Link */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Triage Form (7cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-500 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-extrabold text-slate-900">AI Symptom Checker</h2>
              <p className="text-slate-400 text-xs font-medium">Verify urgency & match medical specialists</p>
            </div>
          </div>

          <form onSubmit={handleTriage} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Patient Age</label>
                <input 
                  type="number"
                  placeholder="e.g. 29"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Describe Symptoms</label>
              <textarea 
                required
                rows="5"
                placeholder="Describe how you feel. (e.g. I have a dry cough, mild fever since yesterday and head congestion, or Chest tightness/pain with shortness of breath)"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/10 hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Symptoms...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Run AI Triage
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="mt-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Results Dashboard (5cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          {!result && !loading ? (
            <div className="bg-slate-100/60 border border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-slate-700 mb-1">Awaiting Symptoms Input</h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-[200px]">
                Submit the symptom checker form to trigger AI triage routing analysis.
              </p>
            </div>
          ) : loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px] shadow-sm">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin" />
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" />
                </div>
              </div>
              <h4 className="font-heading font-bold text-slate-700 mb-1">Gemini AI Triage Live</h4>
              <p className="text-slate-400 text-xs leading-relaxed max-w-[220px]">
                Matching clinical keywords and calculating recommended specialist departments.
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Main Analysis card */}
              <div className={`border rounded-2xl p-6 shadow-md transition-all ${urgency.bg}`}>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Triage Diagnosis</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${urgency.badge}`}>
                    {result.urgency}
                  </span>
                </div>
                
                <h3 className={`font-heading text-lg font-black mb-1.5 ${urgency.text}`}>
                  {result.specialist} Referral
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  {urgency.desc}
                </p>

                <div className="h-px bg-slate-200/50 w-full mb-4" />

                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/90 border border-slate-200/20 shadow-sm flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Action</h5>
                    <p className="text-slate-700 text-xs font-semibold leading-relaxed mt-0.5">
                      {result.nextAction}
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-[10px] font-mono text-slate-400 italic flex justify-end">
                  Engine: {result.method}
                </div>
              </div>

              {/* Action buttons redirects */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <h4 className="font-heading font-bold text-sm text-slate-800">Available Routing Options</h4>
                
                <button 
                  onClick={() => navigate(`/hospitals?specialty=${result.specialist}`)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-between px-4 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    Book doctor in matched department
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => navigate('/hospitals')}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-between px-4 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Locate nearby general/ICU bed spaces
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {result.urgency === 'Critical' && (
                  <button 
                    onClick={() => navigate('/emergency')}
                    className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 px-4 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Enter SOS Emergency Mode
                  </button>
                )}
              </div>

            </motion.div>
          )}
        </div>

      </div>

    </div>
  );
};

export default SymptomChecker;
