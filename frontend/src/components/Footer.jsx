import React from 'react';
import { Activity, Mail, Phone, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white">
              <Activity className="w-4.5 h-4.5" />
            </div>
            <span className="font-heading font-extrabold text-lg text-white">
              MediRoute AI
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Revolutionizing healthcare triage and patient routing. Find care, track bed counts, and book specialist consultations in seconds.
          </p>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 font-heading">
            Key Features
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><a href="/triage" className="hover:text-white transition-colors">AI Symptom Checker</a></li>
            <li><a href="/hospitals" className="hover:text-white transition-colors">Hospital Bed Finder</a></li>
            <li><a href="/emergency" className="hover:text-white transition-colors">Emergency Assistance</a></li>
            <li><a href="/login" className="hover:text-white transition-colors">Appointment Portal</a></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 font-heading">
            Legal & Terms
          </h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">AI Usage Disclaimer</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 font-heading">
            Get In Touch
          </h4>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-primary-400" />
            <span>support@mediroute.ai</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-primary-400" />
            <span>+91 91234 56780</span>
          </div>
          <div className="mt-4 flex gap-3">
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all">
              <span className="text-xs">FB</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all">
              <span className="text-xs">TW</span>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all">
              <span className="text-xs">LN</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <span>&copy; {new Date().getFullYear()} MediRoute AI. All rights reserved.</span>
        <div className="flex items-center gap-1">
          <span>Developed for Smart India Hackathon Prototyping</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
