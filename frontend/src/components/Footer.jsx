import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Mail, Phone, ExternalLink, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  // Footer has the dark futuristic style on landing, standard dark on others
  const bgClass = isLanding
    ? 'bg-[#020010] border-t border-white/5'
    : 'bg-slate-900 border-t border-slate-800';

  return (
    <footer className={`${bgClass} text-slate-400 pt-16 pb-8`}>
      {/* Animated gradient divider */}
      {isLanding && (
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent mb-12" />
      )}

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white ${
              isLanding
                ? 'bg-gradient-to-tr from-cyan-500 to-purple-600'
                : 'bg-gradient-to-tr from-primary-500 to-secondary-500'
            }`}>
              <Activity className="w-4 h-4" />
            </div>
            <span className={`font-heading font-extrabold text-lg ${
              isLanding ? 'text-white' : 'text-white'
            }`}>
              MediRoute AI
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Revolutionizing healthcare triage and patient routing with AI intelligence. Find care, track bed availability, and book specialist consultations — instantly.
          </p>
          {/* Social icons */}
          <div className="flex gap-3 mt-2">
            {[
              { icon: Github, label: 'GH' },
              { icon: Twitter, label: 'TW' },
              { icon: Linkedin, label: 'LN' },
            ].map((social) => (
              <a
                key={social.label}
                href="#"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isLanding
                    ? 'bg-white/5 border border-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/30 hover:text-cyan-400'
                    : 'bg-slate-800 hover:bg-primary-500 hover:text-white'
                }`}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div>
          <h4 className={`font-semibold text-sm uppercase tracking-wider mb-5 font-heading ${
            isLanding ? 'text-white' : 'text-white'
          }`}>
            Key Features
          </h4>
          <ul className="flex flex-col gap-3 text-sm">
            {[
              { to: '/triage', label: 'AI Symptom Checker' },
              { to: '/hospitals', label: 'Hospital Bed Finder' },
              { to: '/emergency', label: 'Emergency Assistance' },
              { to: '/login', label: 'Appointment Portal' },
            ].map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`transition-colors ${
                    isLanding ? 'hover:text-cyan-400' : 'hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className={`font-semibold text-sm uppercase tracking-wider mb-5 font-heading ${
            isLanding ? 'text-white' : 'text-white'
          }`}>
            Legal & Terms
          </h4>
          <ul className="flex flex-col gap-3 text-sm">
            {['Privacy Policy', 'Terms of Service', 'AI Usage Disclaimer', 'Contact Support'].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  className={`transition-colors ${
                    isLanding ? 'hover:text-cyan-400' : 'hover:text-white'
                  }`}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-4">
          <h4 className={`font-semibold text-sm uppercase tracking-wider mb-1 font-heading ${
            isLanding ? 'text-white' : 'text-white'
          }`}>
            Get In Touch
          </h4>
          <div className="flex items-center gap-2.5 text-sm">
            <Mail className={`w-4 h-4 ${isLanding ? 'text-cyan-400' : 'text-primary-400'}`} />
            <span>support@mediroute.ai</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Phone className={`w-4 h-4 ${isLanding ? 'text-cyan-400' : 'text-primary-400'}`} />
            <span>+91 91234 56780</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`max-w-7xl mx-auto px-6 mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs ${
        isLanding ? 'border-t border-white/5' : 'border-t border-slate-800/80'
      }`}>
        <span>&copy; {new Date().getFullYear()} MediRoute AI. All rights reserved.</span>
        <div className="flex items-center gap-1.5">
          <span>Developed for Smart India Hackathon Prototyping</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
