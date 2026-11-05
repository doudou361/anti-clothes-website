import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CategorySplitSection: React.FC = () => {
  const { openProductDetail } = useStore();
  const [footwearPreviewOpen, setFootwearPreviewOpen] = useState(false);

  const scrollToDrop02 = () => {
    const el = document.getElementById('drop-02');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="categories" className="bg-[#FFFFFF] pt-8">
      {/* 50/50 Editorial Split Banners */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
        {/* Left Card: FOOTWEAR */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          onClick={() => setFootwearPreviewOpen(true)}
          className="group relative aspect-[16/11] sm:aspect-[16/10] bg-[#0B0C0E] overflow-hidden cursor-pointer select-none"
        >
          {/* Dark Architectural Sneaker Macro Shot */}
          <img
            src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=85"
            alt="NOCTA Hot Step Carbon Footwear Macro"
            className="w-full h-full object-cover object-center opacity-60 filter contrast-125 grayscale-[35%] transition-transform duration-700 ease-out group-hover:scale-105"
            draggable={false}
          />
          {/* Subtle Carbon Technical Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Top-Left Spec Stamp */}
          <div className="absolute top-5 left-6 text-[10px] font-mono-tech uppercase tracking-[0.22em] text-neutral-400">
            CARBON TRACTION SYSTEM // 01
          </div>

          {/* Bottom-Left Editorial Copy */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                FOOTWEAR
              </h3>
              <p className="text-xs text-neutral-300 mt-1.5 max-w-xs leading-relaxed">
                Sculpted G-Tek outsole architecture with reflective 3M™ uppers.
                <br />
                Engineered for nocturnal urban grip and endurance.
              </p>
            </div>
            <span className="w-9 h-9 rounded-full border border-white/30 bg-white/10 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </motion.div>

        {/* Right Card: COUTURE */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onClick={scrollToDrop02}
          className="group relative aspect-[16/11] sm:aspect-[16/10] bg-[#0E0F12] overflow-hidden cursor-pointer select-none"
        >
          {/* High-Contrast Studio Garment Detail Shot */}
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
            alt="NOCTA Studio Couture Technical Outerwear"
            className="w-full h-full object-cover object-center opacity-60 filter contrast-125 saturate-50 transition-transform duration-700 ease-out group-hover:scale-105"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Top-Left Spec Stamp */}
          <div className="absolute top-5 left-6 text-[10px] font-mono-tech uppercase tracking-[0.22em] text-neutral-400">
            BALLISTIC SHELLS &amp; 520GSM FLEECE // 02
          </div>

          {/* Bottom-Left Editorial Copy */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
                COUTURE
              </h3>
              <p className="text-xs text-neutral-300 mt-1.5 max-w-xs leading-relaxed">
                800-fill down baffle chambers and seam-sealed storm shells.
                <br />
                Precision-calibrated silhouettes built for every climate.
              </p>
            </div>
            <span className="w-9 h-9 rounded-full border border-white/30 bg-white/10 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </motion.div>
      </div>

      {/* Brand Manifesto Block */}
      <div className="py-20 px-6">
        <motion.blockquote
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="max-w-xl mx-auto text-center text-sm text-neutral-700 leading-relaxed font-normal"
        >
          &ldquo;Born for the night, built for those who move with style, relentless
          determination and gritty focus.&rdquo;
        </motion.blockquote>

        <div id="drop-02" className="pt-4">
          <h2 className="text-center text-lg font-bold tracking-[0.25em] uppercase mt-12 underline underline-offset-8 text-[#0A0A0A]">
            DROP 02
          </h2>
        </div>
      </div>

      {/* Footwear Capsule Editorial Preview Modal */}
      {footwearPreviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setFootwearPreviewOpen(false)}
        >
          <div
            className="bg-white border border-neutral-200 max-w-md w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFootwearPreviewOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400">
              NOCTA FOOTWEAR DIVISION // ARCHIVE
            </div>
            <h3 className="text-lg font-bold uppercase tracking-tight mt-1 text-[#0A0A0A]">
              HOT STEP TERRA // CARBON BLACK
            </h3>
            <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
              The Footwear capsule drops alongside the complete Drop 02 outerwear uniform. Explore
              the matching <strong>Puffer Jacket Orange</strong> and{' '}
              <strong>Piped Hoodie Black Yellow</strong> in the interactive studio below.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setFootwearPreviewOpen(false);
                  openProductDetail('sneaker-hot-step-black');
                }}
                className="flex-1 bg-[#0A0A0A] text-white text-xs uppercase tracking-widest font-semibold py-2.5 hover:bg-neutral-800 transition cursor-pointer"
              >
                Inspect Hot Step Terra
              </button>
              <button
                type="button"
                onClick={() => {
                  setFootwearPreviewOpen(false);
                  openProductDetail('sneaker-glide-white-chrome');
                }}
                className="px-4 py-2.5 border border-neutral-200 text-xs uppercase tracking-widest font-medium hover:border-black transition cursor-pointer"
              >
                Inspect Glide White
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
