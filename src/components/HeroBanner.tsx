import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const scrollToLookbook = () => {
    const el = document.getElementById('lookbook');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full h-[88vh] min-h-[560px] bg-[#07080A] overflow-hidden select-none"
    >
      {/* Moody Nocturnal Architectural Photography & Studio Volumetric Lighting Layer */}
      <div className="absolute inset-0">
        {/* High-contrast dark streetwear editorial backdrop image with fallback architectural SVG composition */}
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=2000&q=85"
          alt="NOCTA FS/26 Cardinal Stock Editorial"
          className="w-full h-full object-cover object-center opacity-55 scale-[1.02] filter contrast-125 saturate-50"
          draggable={false}
        />

        {/* Architectural Volumetric Light Beams & Nocturnal Studio Silhouette Overlay */}
        <svg
          className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="heroSpotlight" cx="56%" cy="38%" r="52%">
              <stop offset="0%" stopColor="rgba(249, 115, 22, 0.22)" />
              <stop offset="45%" stopColor="rgba(30, 41, 59, 0.35)" />
              <stop offset="100%" stopColor="rgba(7, 8, 10, 0.92)" />
            </radialGradient>
            <linearGradient id="concreteGrid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
            </linearGradient>
          </defs>
          <rect width="1600" height="900" fill="url(#heroSpotlight)" />
          {/* Brutalist Concrete Perspective Lines */}
          <line x1="0" y1="720" x2="1600" y2="540" stroke="url(#concreteGrid)" strokeWidth="1" />
          <line x1="420" y1="0" x2="260" y2="900" stroke="url(#concreteGrid)" strokeWidth="1" />
          <line x1="1180" y1="0" x2="1340" y2="900" stroke="url(#concreteGrid)" strokeWidth="1" />
          {/* Subtle Watermark NOCTA 3-Star Emblem in Shadow */}
          <g transform="translate(1160, 340) scale(7.5)" opacity="0.06">
            <path d="M0 -14 L3 -3 L14 0 L3 3 L0 14 L-3 3 L-14 0 L-3 -3 Z" fill="#FFFFFF" />
            <path d="M-16 8 L-14 14 L-8 16 L-14 18 L-16 24 L-18 18 L-24 16 L-18 14 Z" fill="#FFFFFF" />
            <path d="M16 8 L18 14 L24 16 L18 18 L16 24 L14 18 L8 16 L14 14 Z" fill="#FFFFFF" />
          </g>
        </svg>

        {/* Bottom-Left & Full Viewport Editorial Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/85 via-transparent to-[#050507]/40" />
      </div>

      {/* Top-Right Editorial Telemetry Stamp */}
      <div className="absolute top-6 right-6 sm:right-10 z-10 hidden sm:flex items-center gap-4 text-[10px] font-mono-tech uppercase tracking-[0.25em] text-neutral-400">
        <span>ARCHIVE // TORONTO — LONDON — PARIS</span>
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
        <span>DROP 02 LIVE</span>
      </div>

      {/* Bottom-Left Editorial Content Overlay */}
      <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 sm:px-12 pb-14 sm:pb-20 flex flex-col justify-end items-start">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg"
        >
          {/* Eyebrow Text */}
          <p className="text-xs text-neutral-300 tracking-wider uppercase font-medium">
            Fall &apos;26 Cardinal Stock
          </p>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-white mt-1.5 leading-none">
            FS/26
          </h1>

          {/* Subtle Editorial Sub-caption */}
          <p className="text-xs text-neutral-400 mt-3 max-w-xs leading-relaxed">
            Nocturnal technical outerwear and heavyweight articulated fleece engineered for all conditions.
          </p>

          {/* CTA Pill Button */}
          <div className="mt-7 flex items-center gap-4">
            <button
              type="button"
              onClick={scrollToLookbook}
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/85 bg-white/5 px-7 py-2.5 text-xs uppercase tracking-[0.2em] font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-[#0A0A0A] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] cursor-pointer"
            >
              <span>Explore</span>
              <ArrowDownRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
