import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const HeroCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement.clientHeight || 500);

    // Track mouse
    const mouse = { x: null, y: null, radius: 100 };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Particle nodes for "3D Neural Hospital Mesh"
    const particles = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        size: Math.random() * 3 + 2,
        density: Math.random() * 30 + 10,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: i % 3 === 0 ? 'rgba(59, 130, 246, 0.7)' : i % 3 === 1 ? 'rgba(99, 102, 241, 0.7)' : 'rgba(16, 185, 129, 0.7)'
      });
    }

    let angle = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw rotating background medical digital globe grid
      ctx.save();
      ctx.translate(width / 2, height / 2);
      angle += 0.003;
      ctx.rotate(angle);
      
      // Draw grid ring 1
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.stroke();

      // Draw grid ring 2 (angled)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 160, 60, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();

      // Draw grid ring 3 (angled opposite)
      ctx.beginPath();
      ctx.ellipse(0, 0, 160, 60, -Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();

      // Draw glowing central health core
      const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 80);
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
      gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 80, 0, Math.PI * 2);
      ctx.fill();

      // Central cross/hospital icon (rotating)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-15, 0); ctx.lineTo(15, 0);
      ctx.moveTo(0, -15); ctx.lineTo(0, 15);
      ctx.stroke();

      ctx.restore();

      // Update and draw neural particle nodes
      particles.forEach((p, idx) => {
        // Move floating particles
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap boundaries
        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;

        // Interaction with mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const maxDistance = mouse.radius;
            const force = (maxDistance - distance) / maxDistance;
            const directionX = forceDirectionX * force * p.density * 0.4;
            const directionY = forceDirectionY * force * p.density * 0.4;
            p.x -= directionX;
            p.y -= directionY;
          }
        }

        // Draw node
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nodes inside a distance threshold
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 110) {
            ctx.strokeStyle = `rgba(148, 163, 184, ${0.18 * (1 - distance / 110)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      // Handle window resize dynamically
      const currentWidth = canvas.parentElement.clientWidth || 500;
      const currentHeight = canvas.parentElement.clientHeight || 500;
      if (currentWidth !== width || currentHeight !== height) {
        width = canvas.width = currentWidth;
        height = canvas.height = currentHeight;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative w-full h-[380px] md:h-[450px] flex items-center justify-center">
      {/* Outer spinning glow rings */}
      <div className="absolute w-72 h-72 rounded-full border border-dashed border-primary-500/20 animate-[spin_30s_linear_infinite]" />
      <div className="absolute w-96 h-96 rounded-full border border-dashed border-secondary-500/10 animate-[spin_45s_linear_infinite_reverse]" />
      
      {/* Floating 3D hospital icon container */}
      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        className="absolute z-10 pointer-events-none w-32 h-32 bg-white/80 backdrop-blur-md shadow-xl shadow-primary-500/10 border border-slate-200/50 rounded-2xl flex flex-col items-center justify-center p-4 gap-2"
      >
        <span className="text-4xl animate-bounce">🏥</span>
        <div className="h-1 w-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MediRoute AI</span>
      </motion.div>

      {/* Floating healthcare icons */}
      <motion.div 
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
        className="absolute top-10 left-12 md:left-20 z-10 bg-white/95 shadow-md border border-slate-100 rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
      >
        <span className="text-xl">🩺</span>
        <span className="text-xs font-semibold text-slate-700">Triage Expert</span>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, delay: 1.2 }}
        className="absolute bottom-12 right-10 md:right-16 z-10 bg-white/95 shadow-md border border-slate-100 rounded-xl p-3 flex items-center gap-2"
      >
        <span className="text-xl">🚑</span>
        <span className="text-xs font-semibold text-slate-700">Ambulance Hub</span>
      </motion.div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default HeroCanvas;
