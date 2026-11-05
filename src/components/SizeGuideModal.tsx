import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ruler } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen, selectedProduct } = useStore();
  const [unit, setUnit] = useState<'CM' | 'IN'>('CM');

  const rows =
    unit === 'CM'
      ? [
          { metric: 'Chest Width (Pit to Pit)', s: '58 cm', m: '61 cm', l: '64 cm', xl: '68 cm' },
          { metric: 'Center Back Length', s: '67 cm', m: '70 cm', l: '73 cm', xl: '76 cm' },
          { metric: 'Across Shoulder', s: '52 cm', m: '55 cm', l: '58 cm', xl: '61 cm' },
          { metric: 'Sleeve Length (Center Back)', s: '86 cm', m: '89 cm', l: '92 cm', xl: '95 cm' },
        ]
      : [
          { metric: 'Chest Width (Pit to Pit)', s: '22.8"', m: '24.0"', l: '25.2"', xl: '26.8"' },
          { metric: 'Center Back Length', s: '26.4"', m: '27.6"', l: '28.7"', xl: '29.9"' },
          { metric: 'Across Shoulder', s: '20.5"', m: '21.7"', l: '22.8"', xl: '24.0"' },
          { metric: 'Sleeve Length (Center Back)', s: '33.9"', m: '35.0"', l: '36.2"', xl: '37.4"' },
        ];

  return (
    <AnimatePresence>
      {isSizeGuideOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSizeGuideOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white border border-neutral-200 p-6 sm:p-8 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400">
              <Ruler className="w-3.5 h-3.5 text-black" />
              <span>GARMENT ARCHITECTURE SPECIFICATION</span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#0A0A0A]">
                {selectedProduct.shortTitle} — SIZE MATRIX
              </h3>

              <div className="inline-flex border border-neutral-200">
                {(['CM', 'IN'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-3 py-1 text-[10px] font-mono-tech font-bold cursor-pointer ${
                      unit === u
                        ? 'bg-[#0A0A0A] text-white'
                        : 'bg-white text-neutral-500 hover:text-black'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-neutral-500 mt-2">
              Engineered with a relaxed, boxy architectural drape. Take your normal size for the
              intended Drop 02 fit. {selectedProduct.sizingReference}.
            </p>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-[10px] font-mono-tech uppercase tracking-wider text-neutral-400">
                    <th className="py-2.5 pr-4">Dimension</th>
                    <th className="py-2.5 px-3 text-center">S</th>
                    <th className="py-2.5 px-3 text-center">M</th>
                    <th className="py-2.5 px-3 text-center">L</th>
                    <th className="py-2.5 px-3 text-center">XL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono-tech text-[11px]">
                  {rows.map((r) => (
                    <tr key={r.metric}>
                      <td className="py-3 pr-4 font-sans font-medium text-neutral-800">
                        {r.metric}
                      </td>
                      <td className="py-3 px-3 text-center text-neutral-600">{r.s}</td>
                      <td className="py-3 px-3 text-center font-semibold text-black bg-neutral-50">
                        {r.m}
                      </td>
                      <td className="py-3 px-3 text-center text-neutral-600">{r.l}</td>
                      <td className="py-3 px-3 text-center text-neutral-600">{r.xl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
              <span>Tolerance: ±1.0 cm across technical seams</span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="px-5 py-2 bg-[#0A0A0A] text-white text-[11px] uppercase tracking-widest font-semibold hover:bg-neutral-800 transition cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
