import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const SearchModal: React.FC = () => {
  const { products, isSearchOpen, setIsSearchOpen, openProductDetail } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.narrative.toLowerCase().includes(q)
    );
  });

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSearchOpen(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white border border-neutral-200 shadow-2xl overflow-hidden"
          >
            {/* Search Input Header */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
              <Search className="w-4 h-4 text-neutral-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Drop 02 & Cardinal Stock (e.g. Puffer, Hoodie, Camo, 800-fill)..."
                className="flex-1 text-xs uppercase tracking-wider text-[#0A0A0A] placeholder:text-neutral-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-neutral-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400 mb-4">
                ARCHIVE RESULTS ({filtered.length})
              </div>

              {filtered.length === 0 ? (
                <p className="text-xs text-neutral-500 py-8 text-center">
                  No garments matched &ldquo;{query}&rdquo;.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filtered.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        openProductDetail(prod.id);
                      }}
                      className="group flex items-center gap-4 p-3 border border-neutral-100 hover:border-black transition cursor-pointer"
                    >
                      <div className="w-16 h-20 bg-neutral-50 p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={prod.frontCutoutUrl}
                          alt={prod.title}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[9px] font-mono-tech text-neutral-400">
                          {prod.code} • {prod.category}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] truncate mt-0.5">
                          {prod.title}
                        </div>
                        <div className="text-xs text-neutral-500 mt-1 flex items-center justify-between">
                          <span>{prod.priceFormatted}</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
