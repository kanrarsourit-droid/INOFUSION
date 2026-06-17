import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroCanvas from '../components/HeroCanvas';
import { useTheme } from '../context/ThemeContext';
import {
  ArrowRight, Sparkles, Compass, Siren, Brain, Cpu,
  Waypoints, ShieldCheck, HeartHandshake,
  Zap, Radio, Lock, BedDouble, Stethoscope, Globe,
  Activity, Star, ChevronDown, MonitorCheck, CalendarCheck,
  BarChart3, Ambulance, Hospital, Search
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ================================================================
   UTILITIES
   ================================================================ */

// Smooth easing
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

// Per-section visibility from scroll progress
function getSectionStyle(progress, index, total) {
  const size = 1 / total;
  const start = index * size;
  const end = start + size;
  const fadeLen = size * 0.18;

  if (progress < start - 0.01 || progress > end + 0.01) return { opacity: 0, y: 70 };
  if (progress < start + fadeLen) {
    const t = easeOutQuart(Math.max(0, progress - start) / fadeLen);
    return { opacity: t, y: 70 * (1 - t) };
  }
  if (progress > end - fadeLen) {
    const t = easeOutQuart(Math.max(0, end - progress) / fadeLen);
    return { opacity: t, y: -50 * (1 - t) };
  }
  return { opacity: 1, y: 0 };
}

/* ================================================================
   TILT CARD — 3D mouse-reactive glassmorphism card
   ================================================================ */
function TiltCard({ children, className = '' }) {
  const { isDark } = useTheme();

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    e.currentTarget.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.02)`;
    e.currentTarget.style.background = isDark 
      ? `radial-gradient(circle at ${50 + x * 30}% ${50 + y * 30}%, rgba(0,212,255,0.08), rgba(15,12,41,0.6))`
      : `radial-gradient(circle at ${50 + x * 30}% ${50 + y * 30}%, rgba(14,116,144,0.08), rgba(255,255,255,0.8))`;
  }, [isDark]);

  const handleMouseLeave = useCallback((e) => {
    e.currentTarget.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
    e.currentTarget.style.background = isDark ? 'rgba(15,12,41,0.5)' : 'rgba(255,255,255,0.7)';
  }, [isDark]);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-card rounded-2xl transition-all duration-300 ${className}`}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

/* ================================================================
   ANIMATED COUNTER
   ================================================================ */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const end = parseInt(target);
    const increment = end / 120;
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={(el) => { if (el && !started) setStarted(true); }}>{count}{suffix}</span>;
}

/* ================================================================
   SCROLL SECTION — Handles fade in/out based on scroll progress
   ================================================================ */
function ScrollSection({ progress, index, total, children, className = '' }) {
  const style = getSectionStyle(progress, index, total);
  return (
    <div
      className={`fixed inset-0 z-10 flex items-center ${className}`}
      style={{
        opacity: style.opacity,
        transform: `translateY(${style.y}px)`,
        pointerEvents: style.opacity > 0.3 ? 'auto' : 'none',
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

/* ================================================================
   LANDING PAGE — 10-Scene Scroll-Driven Storytelling Experience
   ================================================================ */
const TOTAL_SECTIONS = 10;

const Landing = () => {
  const { theme, isDark } = useTheme();
  const containerRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  // ——— GSAP ScrollTrigger: track scroll progress ———
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
          if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(() => {
              setProgress(scrollProgressRef.current);
              rafRef.current = null;
            });
          }
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Current active section for nav dots
  const activeSection = Math.min(Math.floor(progress * TOTAL_SECTIONS), TOTAL_SECTIONS - 1);

  // Navigate to a section on dot click
  const scrollToSection = (index) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const target = (index / TOTAL_SECTIONS) * max + max / TOTAL_SECTIONS * 0.5;
    window.scrollTo({ top: target, behavior: 'smooth' });
  };

  // Section nav labels
  const sectionLabels = [
    'Launch', 'Deconstruct', 'Analysis', 'Specialists',
    'Routing', 'Emergency', 'Command', 'Impact',
    'Features', 'Future'
  ];

  return (
    <div ref={containerRef} style={{ height: `${TOTAL_SECTIONS * 100}vh` }} className="relative">

      {/* ══════════════════════════════════
          FIXED 3D CANVAS BACKGROUND
          ══════════════════════════════════ */}
      <div className="fixed inset-0 z-0">
        <HeroCanvas scrollProgress={scrollProgressRef} />
      </div>

      {/* Gradient overlays for text readability */}
      <div className="fixed inset-0 z-[1] pointer-events-none text-readability-overlay" />
      <div className="fixed bottom-0 left-0 right-0 h-32 z-[1] pointer-events-none text-bottom-fade" />

      {/* ══════════════════════════════════
          NAVIGATION DOTS — Right side
          ══════════════════════════════════ */}
      <div className="fixed right-5 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-2.5">
        {sectionLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => scrollToSection(i)}
            className={`group relative transition-all duration-500 rounded-full ${
              activeSection === i
                ? 'w-2.5 h-7 bg-cyan-500 dark:bg-cyan-400 shadow-lg shadow-cyan-500/30'
                : 'w-2 h-2 bg-slate-300 dark:bg-white/15 hover:bg-slate-400 dark:hover:bg-white/30'
            }`}
            title={label}
          >
            <span className={`absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap transition-opacity ${
              activeSection === i ? 'text-cyan-600 dark:text-cyan-400 opacity-100' : 'text-slate-500 dark:text-white/40 opacity-0 group-hover:opacity-100'
            }`}>
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          SCENE 0: HEALTHCARE CORE (HERO)
          ══════════════════════════════════════════ */}
      <ScrollSection progress={progress} index={0} total={TOTAL_SECTIONS} className="justify-center">
        <div className="max-w-6xl mx-auto px-6 text-center flex flex-col items-center gap-7">
          {/* Status badge */}
          <div className="glass-dark rounded-full px-5 py-2.5 inline-flex items-center gap-3 text-sm">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-slate-700 dark:text-slate-400 font-medium text-xs sm:text-sm">
              Next-Gen Healthcare Routing — <span className="text-emerald-600 dark:text-emerald-400 font-bold">Live</span>
            </span>
          </div>

          {/* Main title */}
          <h1 className="font-heading text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold leading-[0.95] tracking-tight">
            <span className="block text-slate-900 dark:text-white" style={{ textShadow: isDark ? '0 0 80px rgba(0,212,255,0.15)' : 'none' }}>MEDIROUTE</span>
            <span className="block bg-gradient-to-r from-cyan-600 via-blue-500 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-500 bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
            AI-powered symptom analysis, real-time hospital routing, and instant specialist matching — one intelligent platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link to="/triage" className="group relative px-8 py-4 rounded-xl font-bold text-sm sm:text-base overflow-hidden hover:-translate-y-0.5 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl" />
              <div className="absolute inset-0 rounded-xl shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-shadow" />
              <span className="relative flex items-center gap-2 text-white">
                <Sparkles className="w-4 h-4" /> Analyze Symptoms <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link to="/hospitals" className="group px-8 py-4 rounded-xl font-bold text-sm sm:text-base glass-dark hover:bg-slate-100 dark:hover:bg-white/10 transition-all hover:-translate-y-0.5">
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">
                <Compass className="w-4 h-4" /> Find Hospitals
              </span>
            </Link>
            <Link to="/emergency" className="group relative px-8 py-4 rounded-xl font-bold text-sm sm:text-base overflow-hidden hover:-translate-y-0.5 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl" />
              <div className="absolute inset-0 rounded-xl shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow" />
              <span className="relative flex items-center gap-2 text-white"><Siren className="w-4 h-4" /> Emergency</span>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="pt-10 flex flex-col items-center gap-2 animate-pulse">
            <span className="text-[10px] text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em]">Scroll to Explore</span>
            <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-600" />
          </div>
        </div>
      </ScrollSection>

      {/* ══════════════════════════════════════════
          SCENE 1: OBJECT DECONSTRUCTION
          ══════════════════════════════════════════ */}
      <ScrollSection progress={progress} index={1} total={TOTAL_SECTIONS} className="justify-center">
        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-8">
          <span className="scene-label text-cyan-600 dark:text-cyan-400/80">SYSTEM ARCHITECTURE</span>
          <h2 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1]">
            <span className="text-slate-900 dark:text-white" style={{ textShadow: isDark ? '0 0 60px rgba(0,212,255,0.1)' : 'none' }}>DECONSTRUCTING</span><br />
            <span className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">HEALTHCARE</span>
          </h2>
          <p className="text-slate-650 dark:text-slate-550 text-sm sm:text-base max-w-md leading-relaxed">
            Every component serves a purpose. Every module powers a critical healthcare function. Watch the system reveal itself.
          </p>
          {/* Floating tags around the 3D object */}
          <div className="hidden lg:grid grid-cols-3 gap-6 w-full max-w-3xl pt-4">
            {[
              { label: 'Triage Engine', icon: Brain, color: 'text-cyan-600 dark:text-cyan-400' },
              { label: 'Neural Router', icon: Waypoints, color: 'text-purple-600 dark:text-purple-400' },
              { label: 'Data Core', icon: Cpu, color: 'text-pink-600 dark:text-pink-400' },
            ].map(tag => (
              <div key={tag.label} className="glass-dark rounded-xl px-4 py-3 flex items-center gap-3">
                <tag.icon className={`w-4 h-4 ${tag.color}`} />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{tag.label}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* ══════════════════════════════════════════
          SCENE 2: AI SYMPTOM CHECKER
          ══════════════════════════════════════════ */}
      <ScrollSection progress={progress} index={2} total={TOTAL_SECTIONS}>
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 max-w-xl">
            <span className="scene-label text-cyan-600 dark:text-cyan-400/80">01 — Symptom Analysis</span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="text-slate-900 dark:text-white">Your Symptoms.</span><br />
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">Our AI Intelligence.</span>
            </h2>
            <p className="text-slate-700 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              Describe symptoms naturally in conversation. Our Gemini-powered AI evaluates urgency, identifies possible conditions, and delivers personalized precautionary guidance — instantly.
            </p>
            <Link to="/triage" className="inline-flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm hover:gap-3 transition-all group w-fit">
              Try Symptom Checker <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Terminal mockup card */}
          <div className="hidden lg:block">
            <TiltCard className="p-8 flex flex-col gap-5">
              <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Brain className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">Gemini AI Engine</h3>
              <div className="font-mono text-sm text-slate-700 dark:text-slate-400 space-y-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl p-5 border border-slate-200 dark:border-white/5">
                <div className="text-slate-400 dark:text-slate-600">{'>'} Patient: "severe chest pain, shortness of breath"</div>
                <div className="text-cyan-600 dark:text-cyan-400">⚡ Analyzing with neural triage model...</div>
                <div className="text-yellow-600 dark:text-yellow-400">⚠ Urgency: <span className="text-red-600 dark:text-red-400 font-bold">CRITICAL</span></div>
                <div className="text-purple-600 dark:text-purple-400">🏥 Match: Cardiology Department</div>
                <div className="text-emerald-600 dark:text-emerald-400">✓ 3 specialists • 2 hospitals with ICU</div>
              </div>
            </TiltCard>
          </div>
        </div>
      </ScrollSection>

      {/* ══════════════════════════════════════════
          SCENE 3: SPECIALIST RECOMMENDATION ENGINE
          ══════════════════════════════════════════ */}
      <ScrollSection progress={progress} index={3} total={TOTAL_SECTIONS}>
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Card on left (desktop) */}
          <div className="hidden lg:block order-1">
            <TiltCard className="p-8 flex flex-col gap-5">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <span className="text-xs text-slate-505 uppercase tracking-wider">Neural Matching</span>
                  <div className="text-slate-900 dark:text-white font-bold">Specialist Router v2.0</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Pulmonology', 'General'].map((spec, i) => (
                  <div key={spec} className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-lg p-3 text-center hover:border-purple-500/30 transition-colors">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{spec}</div>
                    <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-1">{[4, 3, 5, 6, 2, 8][i]} doctors</div>
                  </div>
                ))}
              </div>
            </TiltCard>
          </div>

          {/* Text on right */}
          <div className="flex flex-col gap-6 max-w-xl order-2 lg:order-2">
            <span className="scene-label text-purple-600 dark:text-purple-400/80">02 — Specialist Engine</span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="text-slate-900 dark:text-white">Find The Right</span><br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-500 bg-clip-text text-transparent">Doctor Instantly.</span>
            </h2>
            <p className="text-slate-700 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              AI routes you to the exact specialist your symptoms require. No guesswork, no waiting — precision matching across the entire medical network.
            </p>
            <Link to="/triage" className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm hover:gap-3 transition-all group w-fit">
              Find Specialists <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </ScrollSection>

      {/* ══════════════════════════════════════════
          SCENE 4: HOSPITAL ROUTING ENGINE
          ══════════════════════════════════════════ */}
      <ScrollSection progress={progress} index={4} total={TOTAL_SECTIONS}>
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 max-w-xl">
            <span className="scene-label text-blue-600 dark:text-blue-400/80">03 — Hospital Network</span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              <span className="text-slate-900 dark:text-white">Smart Hospital</span><br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">Discovery.</span>
            </h2>
            <p className="text-slate-700 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              Real-time hospital bed and ICU vacancy monitoring across the entire network. Find the nearest facility with available capacity in milliseconds.
            </p>
            <Link to="/hospitals" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm hover:gap-3 transition-all group w-fit">
              Browse Hospitals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="hidden lg:block">
            <TiltCard className="p-8">
              <div className="flex items-center gap-3 mb-5">
                <Waypoints className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="text-slate-900 dark:text-white font-bold">Network Status</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase">All Online</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Hospitals', value: '12+', icon: Hospital, color: 'text-cyan-600 dark:text-cyan-400' },
                  { label: 'Beds Available', value: '145', icon: BedDouble, color: 'text-purple-600 dark:text-purple-400' },
                  { label: 'ICU Beds', value: '23', icon: Activity, color: 'text-pink-600 dark:text-pink-400' },
                  { label: 'Avg Response', value: '< 2s', icon: Zap, color: 'text-emerald-600 dark:text-emerald-400' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-xl p-4 flex flex-col gap-2 hover:border-blue-500/20 transition-colors">
                    <item.icon className="w-4 h-4 text-slate-400 dark:text-white/60 opacity-60" />
                    <span className={`text-2xl font-bold font-heading ${item.color}`}>{item.value}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</span>
                  </div>
                ))}
              </div>
            </TiltCard>
          </div>
        </div>
      </ScrollSection>

      {/* ══════════════════════════════════════════
          SCENE 5: EMERGENCY RESPONSE SYSTEM
          ══════════════════════════════════════════ */}
      <ScrollSection progress={progress} index={5} total={TOTAL_SECTIONS} className="justify-center">
        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center gap-8 relative">
          {/* Emergency radial pulse background */}
          <div className="absolute inset-0 -z-10 red-pulse-bg rounded-3xl" />

          <span className="scene-label text-red-600 dark:text-red-400/80">04 — Emergency Response</span>
          <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            <span className="text-slate-900 dark:text-white">Emergency Response</span><br />
            <span className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-600 dark:from-red-400 dark:via-orange-400 dark:to-amber-400 bg-clip-text text-transparent">In Seconds.</span>
          </h2>
          <p className="text-slate-705 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
            Emergency triage triggers immediate hospital routing. Critical cases receive priority pathways. Every second is optimized for survival.
          </p>

          {/* Emergency stats */}
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: 'Response Time', value: '< 3s', color: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-500/20' },
              { label: 'Hospital Scan', value: 'Instant', color: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-500/20' },
              { label: 'Route Optimize', value: 'Real-time', color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/20' },
            ].map(stat => (
              <div key={stat.label} className={`glass-dark rounded-xl px-5 py-3 border ${stat.border}`}>
                <div className={`text-lg font-bold font-heading ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-slate-505 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          <Link to="/emergency" className="group relative px-8 py-4 rounded-xl font-bold text-base overflow-hidden hover:-translate-y-0.5 transition-all red-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl" />
            <div className="absolute inset-0 rounded-xl shadow-lg shadow-red-500/30" />
            <span className="relative flex items-center gap-2 text-white">
              <Siren className="w-5 h-5" /> Activate Emergency Protocol <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </ScrollSection>

      {/* ══════════════════════════════════════════
          SCENE 6: DIGITAL TWIN COMMAND CENTER
          ══════════════════════════════════════════ */}
      <ScrollSection progress={progress} index={6} total={TOTAL_SECTIONS}>
        <div className="max-w-6xl mx-auto px-6 w-full flex flex-col items-center gap-10">
          <div className="text-center flex flex-col gap-4">
            <span className="scene-label text-emerald-600 dark:text-emerald-400/80">05 — Command Center</span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-slate-900 dark:text-white">Complete Visibility.</span><br />
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">Total Control.</span>
            </h2>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl">
            {[
              { label: 'Hospitals Connected', value: 12, suffix: '+', icon: Globe, color: 'text-cyan-600 dark:text-cyan-400' },
              { label: 'Available Beds', value: 145, suffix: '', icon: BedDouble, color: 'text-purple-600 dark:text-purple-400' },
              { label: 'Specialists Online', value: 47, suffix: '+', icon: Stethoscope, color: 'text-pink-600 dark:text-pink-400' },
              { label: 'Patients Served', value: 2840, suffix: '+', icon: HeartHandshake, color: 'text-emerald-600 dark:text-emerald-400' },
            ].map((stat) => (
              <TiltCard key={stat.label} className="p-5 sm:p-6 flex flex-col items-center text-center gap-3">
                <stat.icon className="w-5 h-5 text-slate-400 dark:text-white/50 opacity-50" />
                <span className={`text-3xl sm:text-4xl font-bold font-heading ${stat.color}`}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-[10px] text-slate-505 uppercase tracking-wider font-medium">{stat.label}</span>
              </TiltCard>
            ))}
          </div>

          {/* Tech highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
            {[
              { icon: Zap, title: 'Dual-Engine Fallback', desc: 'Seamless switch between Gemini AI and rule-based triage.', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10' },
              { icon: Lock, title: 'Age-Aware AI', desc: 'Context-aware recommendations adapted to patient demographics.', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
              { icon: Radio, title: 'Real-Time Sync', desc: 'Hospital status updated across the network instantly.', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10' },
              { icon: ShieldCheck, title: 'Empathetic AI', desc: 'Warm, caring explanations — not cold clinical output.', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map(item => (
              <div key={item.title} className="flex gap-4 items-start glass-card rounded-xl p-5">
                <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">{item.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* ══════════════════════════════════════════
          SCENE 7: BIG TYPOGRAPHY
          ══════════════════════════════════════════ */}
      <ScrollSection progress={progress} index={7} total={TOTAL_SECTIONS} className="justify-center">
        <div className="max-w-7xl mx-auto px-6 text-center flex flex-col items-center gap-3">
          {(() => {
            const sectionStart = 7 / TOTAL_SECTIONS;
            const sectionEnd = 8 / TOTAL_SECTIONS;
            const sectionLen = sectionEnd - sectionStart;
            const localP = Math.max(0, Math.min(1, (progress - sectionStart) / sectionLen));

            const words = [
              { text: 'SMARTER', gradient: 'from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500' },
              { text: 'FASTER', gradient: 'from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-500' },
              { text: 'CONNECTED', gradient: 'from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400' },
              { text: 'HEALTHCARE', gradient: 'from-emerald-500 via-cyan-500 to-purple-650 dark:from-emerald-400 dark:via-cyan-400 dark:to-purple-400' },
            ];

            return words.map((word, i) => {
              const wordStart = i / words.length;
              const wordEnd = (i + 1) / words.length;
              const wordP = Math.max(0, Math.min(1, (localP - wordStart) / (wordEnd - wordStart)));

              const fadeIn = Math.min(1, wordP * 4);
              const fadeOut = Math.max(0, 1 - Math.max(0, (wordP - 0.7) / 0.3));
              const opacity = Math.min(fadeIn, fadeOut);
              const scale = 0.7 + wordP * 0.3;

              return (
                <div
                  key={word.text}
                  className="overflow-hidden"
                  style={{
                    opacity,
                    transform: `scale(${scale})`,
                    transition: 'none',
                  }}
                >
                  <span className={`text-massive font-heading bg-gradient-to-r ${word.gradient} bg-clip-text text-transparent`}>
                    {word.text}
                  </span>
                </div>
              );
            });
          })()}
        </div>
      </ScrollSection>

      {/* ══════════════════════════════════════════
          SCENE 8: FEATURE SHOWCASE
          ══════════════════════════════════════════ */}
      <ScrollSection progress={progress} index={8} total={TOTAL_SECTIONS}>
        <div className="max-w-6xl mx-auto px-6 w-full flex flex-col items-center gap-8">
          <div className="text-center flex flex-col gap-3">
            <span className="scene-label text-cyan-600 dark:text-cyan-400/80">PLATFORM FEATURES</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              <span className="text-slate-900 dark:text-white">Everything You Need.</span><br />
              <span className="bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-400 bg-clip-text text-transparent">One Platform.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[
              { icon: Brain, title: 'AI Symptom Checker', desc: 'Gemini-powered triage', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10', delay: '' },
              { icon: Stethoscope, title: 'Doctor Recommendation', desc: 'Neural specialist matching', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', delay: 'card-float-delay-1' },
              { icon: Search, title: 'Hospital Finder', desc: 'Nearest facility search', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', delay: 'card-float-delay-2' },
              { icon: BedDouble, title: 'Bed Availability', desc: 'Real-time vacancy tracking', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10', delay: 'card-float-delay-3' },
              { icon: MonitorCheck, title: 'ICU Tracking', desc: 'Critical care monitoring', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', delay: 'card-float-delay-4' },
              { icon: CalendarCheck, title: 'Appointment Booking', desc: 'Instant scheduling', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', delay: 'card-float-delay-5' },
              { icon: Ambulance, title: 'Emergency Assistance', desc: 'Priority routing system', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10', delay: 'card-float-delay-6' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Operational intelligence', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10', delay: 'card-float-delay-7' },
            ].map(feature => (
              <TiltCard key={feature.title} className={`p-5 flex flex-col gap-3 card-float ${feature.delay}`}>
                <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{feature.title}</h4>
                <p className="text-slate-500 dark:text-slate-500 text-xs leading-relaxed">{feature.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </ScrollSection>

      {/* ══════════════════════════════════════════
          SCENE 9: FINAL CALL TO ACTION
          ══════════════════════════════════════════ */}
      <ScrollSection progress={progress} index={9} total={TOTAL_SECTIONS}>
        <div className="max-w-5xl mx-auto px-6 w-full flex flex-col items-center gap-10">
          <div className="text-center flex flex-col gap-5 items-center">
            <span className="scene-label text-cyan-600 dark:text-cyan-400/80">THE FUTURE</span>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-slate-900 dark:text-white">The Future of Healthcare</span><br />
              <span className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Navigation Is Here.</span>
            </h2>
            <p className="text-slate-700 dark:text-slate-400 text-base max-w-md leading-relaxed">
              Jump in. Test the full platform with pre-loaded data. No setup required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Credentials card */}
            <TiltCard className="p-7 flex flex-col gap-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                <Sparkles className="w-3.5 h-3.5" /> Demo Credentials
              </div>
              <div className="font-mono text-sm flex flex-col gap-3">
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2.5">
                  <span className="text-slate-505 dark:text-slate-500">Patient:</span>
                  <span className="text-cyan-700 dark:text-cyan-400 font-semibold">patient@mediroute.com</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2.5">
                  <span className="text-slate-505 dark:text-slate-500">Password:</span>
                  <span className="text-cyan-700 dark:text-cyan-400 font-semibold">patient123</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2.5">
                  <span className="text-slate-550 dark:text-slate-500">Admin:</span>
                  <span className="text-purple-700 dark:text-purple-400 font-semibold">admin@mediroute.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-555 dark:text-slate-500">Password:</span>
                  <span className="text-purple-750 dark:text-purple-400 font-semibold">admin123</span>
                </div>
              </div>
              <Link to="/login" className="w-full py-3 text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-cyan-500/20 text-sm block">
                Launch Platform
              </Link>
            </TiltCard>

            {/* Contact card */}
            <TiltCard className="p-7 flex flex-col gap-5">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <HeartHandshake className="w-3.5 h-3.5" /> Contact Team
              </div>
              <form onSubmit={(e) => { e.preventDefault(); alert('Message sent! Our team will reply shortly.'); }} className="flex flex-col gap-3">
                <input
                  id="cta-name" type="text" placeholder="Your Name" required
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500/55 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                />
                <input
                  id="cta-email" type="email" placeholder="Email" required
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500/55 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all"
                />
                <textarea
                  id="cta-message" placeholder="Message" rows="2" required
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-cyan-500/55 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all resize-none"
                />
                <button id="cta-submit" type="submit" className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-purple-500/20 text-sm">
                  Send Message
                </button>
              </form>
            </TiltCard>
          </div>

          {/* Testimonials row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
            {[
              { name: 'Dr. Sarah Miller', role: 'Head of Emergency', initials: 'SM', quote: 'MediRoute AI dramatically decreases our ER gridlock. Pre-triage saves critical minutes.' },
              { name: 'Richard Jackson', role: 'Ops Director, Apex Medical', initials: 'RJ', quote: 'The live bed-occupancy dashboard is brilliantly intuitive. Our admin team saves hours daily.' },
              { name: 'Dr. Alice Patel', role: 'Outpatient Lead', initials: 'AP', quote: 'Direct specialist routing prevents double-bookings. Genuinely startup-level innovation.' },
            ].map(t => (
              <div key={t.name} className="glass-card rounded-xl p-5 flex flex-col gap-3">
                <div className="flex gap-1">{[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />)}</div>
                <p className="text-slate-700 dark:text-slate-400 text-xs leading-relaxed italic flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-white/5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center text-slate-800 dark:text-white text-[10px] font-bold">{t.initials}</div>
                  <div><span className="text-slate-900 dark:text-white text-[11px] font-bold">{t.name}</span><br /><span className="text-slate-500 dark:text-slate-500 text-[9px]">{t.role}</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Team credit */}
          <div className="text-center pt-4 flex flex-col items-center gap-3">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            <p className="text-slate-500 dark:text-slate-600 text-xs uppercase tracking-[0.3em] font-bold">
              Built By <span className="text-cyan-600 dark:text-cyan-400">VOID WALKERS</span> • <span className="text-purple-600 dark:text-purple-400">INNOFUSION 3.0</span>
            </p>
          </div>
        </div>
      </ScrollSection>

      {/* ══════════════════════════════════
          BOTTOM FADE (transition to footer)
          ══════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 h-40 landing-bottom-fade pointer-events-none z-[5]" />
    </div>
  );
};

export default Landing;
