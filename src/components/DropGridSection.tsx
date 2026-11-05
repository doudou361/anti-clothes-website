import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const DropGridSection: React.FC = () => {
  const {
    products,
    categories,
    activeGender,
    activeCategory,
    selectGenderAndCategory,
    openProductDetail,
  } = useStore();

  const [showAllCatalog, setShowAllCatalog] = useState<boolean>(false);

  const displayedProducts = showAllCatalog
    ? products
    : products.filter(
        (p) => p.gender === activeGender && p.category === activeCategory
      );

  const handleSelectCatTab = (gender: 'men' | 'women', catId: string) => {
    setShowAllCatalog(false);
    selectGenderAndCategory(gender, catId);
  };

  const scrollToLookbookWithCategory = (gender: 'men' | 'women', catId: string) => {
    selectGenderAndCategory(gender, catId);
    const el = document.getElementById('lookbook');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#FFFFFF] pb-24">
      {/* Organized Category & Gender Filter Bar */}
      <div className="max-w-6xl mx-auto px-6 mb-4 flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={() => setShowAllCatalog(true)}
            className={`text-[10px] font-mono-tech uppercase tracking-[0.22em] pb-1 transition cursor-pointer ${
              showAllCatalog
                ? 'text-[#0A0A0A] font-bold border-b-2 border-[#0A0A0A]'
                : 'text-neutral-400 hover:text-[#0A0A0A]'
            }`}
          >
            ALL PIECES ({String(products.length).padStart(2, '0')})
          </button>

          {categories.map((cat) => {
            const count = products.filter(
              (p) => p.gender === cat.gender && p.category === cat.id
            ).length;
            const isSelected =
              !showAllCatalog &&
              activeGender === cat.gender &&
              activeCategory === cat.id;
            return (
              <button
                key={`${cat.gender}-${cat.id}`}
                type="button"
                onClick={() => handleSelectCatTab(cat.gender, cat.id)}
                className={`text-[10px] font-mono-tech uppercase tracking-[0.2em] pb-1 transition cursor-pointer ${
                  isSelected
                    ? 'text-[#0A0A0A] font-bold border-b-2 border-[#0A0A0A]'
                    : 'text-neutral-400 hover:text-[#0A0A0A]'
                }`}
              >
                {cat.gender === 'women' ? `GIRL // ${cat.label}` : `MEN // ${cat.label}`} (
                {String(count).padStart(2, '0')})
              </button>
            );
          })}
        </div>

        {!showAllCatalog && (
          <button
            type="button"
            onClick={() => scrollToLookbookWithCategory(activeGender, activeCategory)}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono-tech uppercase tracking-widest text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-3.5 py-1.5 rounded-full transition cursor-pointer"
          >
            <span>
              Swipe {activeGender === 'women' ? 'Girl' : "Men's"} {activeCategory} on Interactive Model Stage
            </span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* 3-Column Product Grid with Front-to-Back Hover Flip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 max-w-6xl mx-auto px-6 py-10">
        {displayedProducts.map((product, index) => {
          const totalStock = Object.values(product.stockBySize || {}).reduce(
            (s, n) => s + n,
            0
          );
          return (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: (index % 3) * 0.06 }}
              onClick={() => openProductDetail(product.id)}
              className="flex flex-col items-center cursor-pointer group select-none"
            >
              {/* Pure White Image Container with Locked-Scale Front-to-Back Cross-Fade */}
              <div className="w-full aspect-[4/5] bg-[#FFFFFF] relative flex items-center justify-center cursor-pointer overflow-hidden border border-transparent group-hover:border-neutral-100 transition-colors">
                {/* Top-Left Category & Gender Pill */}
                <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-1.5">
                  <span className="text-[9px] font-mono-tech uppercase tracking-widest text-[#0A0A0A] bg-neutral-100 px-2 py-0.5 rounded-full">
                    {product.gender === 'women' ? 'GIRL' : 'MEN'} // {product.category}
                  </span>
                </div>

                {/* Subtle Front/Back View Indicator Pill on Hover */}
                <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="text-[9px] font-mono-tech uppercase tracking-widest text-neutral-400 bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded-full">
                    REAR VIEW
                  </span>
                </div>

                {/* Default State: frontCutoutUrl */}
                <img
                  src={product.frontCutoutUrl}
                  alt={`${product.title} — Front Cutout`}
                  className="w-full h-full object-contain p-3 transition-opacity duration-300 ease-in-out opacity-100 group-hover:opacity-0"
                  draggable={false}
                />

                {/* Hover State: backCutoutUrl at the exact same scale and position */}
                <img
                  src={product.backCutoutUrl}
                  alt={`${product.title} — Back Cutout`}
                  className="absolute inset-0 w-full h-full object-contain p-3 transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100"
                  draggable={false}
                />
              </div>

              {/* Centered Typography Below Image */}
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-900 mt-4 text-center group-hover:underline underline-offset-4">
                {product.title}
              </h3>
              <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
                <span>{product.priceFormatted}</span>
                <span className="text-neutral-300">•</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech text-neutral-500">
                  <Package className="w-3 h-3" />
                  {totalStock} in stock
                </span>
              </div>
            </motion.article>
          );
        })}
      </div>

      {/* Footer CTA: Toggle between Filtered Category & Full Catalog */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={() => setShowAllCatalog((prev) => !prev)}
          className="border border-black rounded-full px-8 py-2.5 text-xs uppercase tracking-widest font-medium text-[#0A0A0A] hover:bg-black hover:text-white transition cursor-pointer"
        >
          {showAllCatalog
            ? `Filter by ${activeCategory}`
            : `View All ${products.length} Pieces`}
        </button>
      </div>
    </section>
  );
};
