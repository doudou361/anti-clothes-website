import React, { useState } from 'react';
import { ArrowRight, Settings, Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { backToStore, openProductDetail, products, setIsCalibrateMode } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer
      id="footer-contact"
      className="bg-[#FFFFFF] border-t border-neutral-100 text-[#0A0A0A] select-none"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Brand Column */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-[#0A0A0A]" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 2L18.2 11.8L28 14L18.2 16.2L16 26L13.8 16.2L4 14L13.8 11.8L16 2Z"
                fill="currentColor"
              />
              <circle cx="8" cy="24" r="1.8" fill="currentColor" />
              <circle cx="24" cy="24" r="1.8" fill="currentColor" />
            </svg>
            <span className="font-display text-sm font-bold tracking-[0.22em] uppercase">
              NOCTA / STUDIO
            </span>
          </div>
          <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
            Nocturnal technical concept store. Engineered for functional movement, architectural
            proportion, and real-time studio garment calibration.
          </p>
          <div className="text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400">
            FALL &apos;26 CARDINAL STOCK • DROP 02 ARCHIVE
          </div>
        </div>

        {/* Navigation Column */}
        <div className="md:col-span-2 space-y-2.5">
          <div className="text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400">
            SECTIONS
          </div>
          <ul className="space-y-2 text-xs text-neutral-600">
            <li>
              <button
                type="button"
                onClick={() => backToStore('hero')}
                className="hover:text-black transition cursor-pointer"
              >
                FS/26 Editorial Hero
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => backToStore('lookbook')}
                className="hover:text-black transition cursor-pointer"
              >
                Slide-On Model Lookbook
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => backToStore('drop-02')}
                className="hover:text-black transition cursor-pointer"
              >
                Drop 02 Hover-Flip Grid
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setIsCalibrateMode((prev) => !prev)}
                className="inline-flex items-center gap-1 text-neutral-900 font-semibold hover:underline cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>Admin Calibration Studio</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Archive Pieces Column */}
        <div className="md:col-span-3 space-y-2.5">
          <div className="text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400">
            DROP 02 CATALOG
          </div>
          <ul className="space-y-2 text-xs text-neutral-600">
            {products.slice(0, 4).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => openProductDetail(p.id)}
                  className="hover:text-black transition cursor-pointer text-left truncate max-w-full"
                >
                  {p.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Nocturnal Dispatch Newsletter */}
        <div className="md:col-span-3 space-y-3">
          <div className="text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400">
            NOCTURNAL DISPATCH
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Receive encrypted drop coordinates and private archive access prior to public release.
          </p>
          {subscribed ? (
            <div className="flex items-center gap-2 text-xs font-mono-tech text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2">
              <Check className="w-3.5 h-3.5" />
              <span>REGISTERED FOR DROP 03 DISPATCH</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex border-b border-black pb-1.5">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL ADDRESS"
                className="flex-1 text-xs uppercase tracking-widest placeholder:text-neutral-400 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="p-1 text-black hover:translate-x-0.5 transition cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-neutral-100 px-6 sm:px-12 py-5 max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400">
        <span>© 2026 NOCTA / STUDIO CONCEPT. ALL RIGHTS RESERVED.</span>
        <span>PRESS SHIFT + C TO LAUNCH CUTOUT CALIBRATION STUDIO</span>
      </div>
    </footer>
  );
};
