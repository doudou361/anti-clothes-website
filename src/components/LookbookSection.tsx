import React, { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Crosshair,
  Sparkles,
  UserCheck,
  Package,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  DEFAULT_BASE_MODEL_URL,
  DEFAULT_FEMALE_BASE_MODEL_URL,
  DEFAULT_SHIRTLESS_BASE_MODEL_URL,
} from '../data/garmentVisuals';
import { CrosshairGridOverlay } from './CrosshairGridOverlay';

export const LookbookSection: React.FC = () => {
  const {
    categories,
    activeGender,
    activeCategory,
    categoryProducts,
    selectGenderAndCategory,
    baseModelUrl,
    baseModelCalibration,
    lookbookIndex,
    setLookbookIndex,
    openProductDetail,
    isCalibrateMode,
    calibrationTargetMode,
    setCalibrationTargetMode,
    lookbookCalibrationLayer,
    onionSkinOpacity,
    showCrosshairGrid,
  } = useStore();

  const sectionRef = useRef<HTMLElement | null>(null);

  // Studio view angle ('front' | 'back' for apparel; 'front' | 'side' | 'back' for footwear)
  const [activeAngle, setActiveAngle] = useState<'front' | 'side' | 'back'>('front');
  const [showBareOption, setShowBareOption] = useState(false);

  // Reset bare option and angle when category or gender changes
  useEffect(() => {
    setShowBareOption(false);
    setActiveAngle('front');
  }, [activeGender, activeCategory]);

  // Derived category & product state
  const genderCategories = categories.filter((c) => c.gender === activeGender);
  const currentCatConfig =
    genderCategories.find((c) => c.id === activeCategory) || genderCategories[0];

  const total = categoryProducts.length;
  const safeIndex = total > 0 ? lookbookIndex % total : 0;
  const activeProduct = categoryProducts[safeIndex];

  const isFootwearStage = activeCategory === 'SHOES';
  const isPantsStage = activeCategory === 'PANTS';
  const isUpperBodyStage = activeCategory === 'HOODIES' || activeCategory === 'TSHIRTS';

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setLookbookIndex((prev) => (prev + 1) % total);
  }, [setLookbookIndex, total]);

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setLookbookIndex((prev) => (prev - 1 + total) % total);
  }, [setLookbookIndex, total]);

  const toggleAngle = useCallback(() => {
    if (isFootwearStage) {
      setActiveAngle((prev) => (prev === 'front' ? 'side' : prev === 'side' ? 'back' : 'front'));
    } else {
      setActiveAngle((prev) => (prev === 'front' ? 'back' : 'front'));
    }
  }, [isFootwearStage]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev]);

  // Drag gesture: swipe left/right or up/down to cycle garments smoothly
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const absX = Math.abs(info.offset.x);
    const absY = Math.abs(info.offset.y);
    if (absX >= absY) {
      if (info.offset.x < -45) handleNext();
      else if (info.offset.x > 45) handlePrev();
    } else {
      if (info.offset.y < -45) handleNext();
      else if (info.offset.y > 45) handlePrev();
    }
  };

  const scrollToDropGrid = () => {
    const el = document.getElementById('drop-02');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (!activeProduct) return null;

  const activeCoords = activeProduct.calibration.lookbook;
  const isLookbookCalibrating = isCalibrateMode && calibrationTargetMode === 'lookbook';
  const effectiveGarmentOpacity = isLookbookCalibrating ? onionSkinOpacity : 1;

  const totalStock = Object.values(activeProduct.stockBySize || {}).reduce((sum, n) => sum + n, 0);

  // ── Studio Layer Resolution ────────────────────────────────────────────────
  // Layer 0: Static Base Model (only rendered in Bare Base mode or Admin Calibrate mode,
  // since activeStageSrc already renders the complete seamless model wearing the active piece)
  const baseModelLayerSrc: string | null = (() => {
    if (isFootwearStage) return null;
    if (activeAngle === 'back') return null;
    if (!showBareOption && !isLookbookCalibrating) return null;
    if (activeGender === 'women') return DEFAULT_FEMALE_BASE_MODEL_URL;
    if (isPantsStage || showBareOption) return DEFAULT_SHIRTLESS_BASE_MODEL_URL;
    return baseModelUrl || DEFAULT_BASE_MODEL_URL;
  })();

  // Layer 1: Active Garment / Seamless Studio Model Fit
  const activeStageSrc: string | null = (() => {
    if (showBareOption && !isFootwearStage) return null;

    if (isFootwearStage) {
      if (activeAngle === 'side') {
        return activeProduct.threeQuarterFrontUrl || activeProduct.modelFrontUrl || activeProduct.frontCutoutUrl;
      }
      if (activeAngle === 'back') {
        return activeProduct.heelBackUrl || activeProduct.backCutoutUrl || activeProduct.frontCutoutUrl;
      }
      return activeProduct.lateralSideUrl || activeProduct.lookbookCutoutUrl || activeProduct.frontCutoutUrl;
    }

    if (activeAngle === 'back') {
      return activeProduct.backCutoutUrl || activeProduct.modelBackUrl || activeProduct.frontCutoutUrl;
    }

    // In calibration mode, show the isolated garment cutout so admin can onion-skin against Layer 0
    if (isLookbookCalibrating) {
      return activeProduct.lookbookCutoutUrl || activeProduct.frontCutoutUrl;
    }

    // Default front studio view: use the pixel-aligned seamless model fit (with fallback to cutout)
    return (
      activeProduct.modelFrontUrl ||
      activeProduct.lookbookCutoutUrl ||
      activeProduct.frontCutoutUrl
    );
  })();

  // Framing classes:
  // - Upper body (HOODIES / TSHIRTS) on front view uses a close-up 3/4 studio crop (head to hem/hands)
  //   for maximum garment & logo clarity.
  // - Pants (PANTS) on front view zooms in close on the lower body (from lower abs/waist to cuffs,
  //   matching the close-up pants reference shots) so every seam, pocket, and waistband detail is sharp.
  const stageZoomClass = (() => {
    if (isFootwearStage) return 'scale-[1.15] origin-center';
    if (activeAngle === 'back') return 'scale-[1.12] origin-center';
    if (showBareOption) return 'scale-[1.15] origin-center';
    if (isUpperBodyStage) return 'scale-[1.48] origin-top -translate-y-[4%]';
    if (isPantsStage) return 'scale-[1.68] origin-bottom translate-y-[4%]';
    return 'scale-100 origin-center';
  })();

  return (
    <section
      id="lookbook"
      ref={sectionRef}
      className="min-h-[92vh] bg-[#FFFFFF] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between py-10 lg:py-0 border-b border-neutral-100 select-none"
    >
      {/* ── Left Column: Lookbook Controls & Active Piece Metadata ────────── */}
      <div className="w-full lg:w-[34%] px-6 sm:px-12 lg:pl-14 lg:pr-6 z-20 flex flex-col items-start justify-center">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono-tech uppercase tracking-[0.22em] text-neutral-400 mb-2">
          <span>CATEGORY LOOKBOOK // {currentCatConfig?.label || activeCategory}</span>
          <span className="text-black font-semibold">
            {String(safeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight leading-[0.95] text-[#0A0A0A]">
          THE NOCTA
          <br />
          COLLECTION
        </h2>

        <p className="text-xs text-neutral-500 mt-2.5 leading-relaxed max-w-[300px]">
          {activeGender === 'women'
            ? `Girl Style — Swiping strictly through ${currentCatConfig?.label || activeCategory} on our female studio model.`
            : isPantsStage
              ? 'Athletic Pants Fit — Shirtless model, pants isolated for max fit clarity. Swipe to cycle pairs.'
              : isFootwearStage
                ? 'Footwear Studio — Multi-angle sneaker inspection stage.'
                : `Men's Studio Fit — Swipe or use arrows to cycle ${currentCatConfig?.label || activeCategory} on the model.`}
        </p>

        {/* STEP 1: Gender Selector */}
        <div className="mt-5 w-full max-w-[310px]">
          <div className="text-[9px] font-mono-tech uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
            1. SELECT MODEL DIVISION
          </div>
          <div className="inline-flex w-full rounded-full p-1 bg-neutral-100 border border-neutral-200">
            <button
              type="button"
              onClick={() => selectGenderAndCategory('men', 'HOODIES')}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-[10px] font-mono-tech uppercase tracking-wider transition cursor-pointer ${
                activeGender === 'men'
                  ? 'bg-[#0A0A0A] text-white font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <UserCheck className="w-3 h-3" />
              Men (Boys)
            </button>
            <button
              type="button"
              onClick={() => selectGenderAndCategory('women', 'HOODIES')}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-[10px] font-mono-tech uppercase tracking-wider transition cursor-pointer ${
                activeGender === 'women'
                  ? 'bg-[#0A0A0A] text-white font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Girl Style (Women)
            </button>
          </div>
        </div>

        {/* STEP 2: Category Tabs */}
        <div className="mt-4 w-full max-w-[310px]">
          <div className="text-[9px] font-mono-tech uppercase tracking-[0.2em] text-neutral-400 mb-1.5">
            2. SELECT CATEGORY TO SWIPE ({genderCategories.length} SERIES)
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {genderCategories.map((cat) => {
              const isSelected = cat.id === activeCategory;
              return (
                <button
                  key={`${cat.gender}-${cat.id}`}
                  type="button"
                  onClick={() => selectGenderAndCategory(activeGender, cat.id)}
                  className={`py-2 px-3 text-left border text-[10px] font-mono-tech uppercase tracking-wider transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] font-bold'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                >
                  <span className="truncate">{cat.label}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Garment Info + CTA */}
        <div className="mt-6 pt-5 border-t border-neutral-100 w-full max-w-[310px]">
          <div className="flex items-center justify-between text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400">
            <span>ACTIVE {activeCategory} PIECE</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <Package className="w-3 h-3" />
              {totalStock} IN STORAGE
            </span>
          </div>
          <div className="mt-1 text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
            {activeProduct.title}
          </div>
          <div className="mt-0.5 text-xs text-neutral-500 font-mono-tech">
            {activeProduct.priceFormatted} • {activeProduct.code}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => openProductDetail(activeProduct.id)}
              className="bg-[#0A0A0A] text-white rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Inspect &amp; Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={scrollToDropGrid}
              className="border border-neutral-300 rounded-full px-4 py-2 text-[11px] uppercase tracking-widest font-medium text-[#0A0A0A] hover:border-black transition cursor-pointer"
            >
              Grid View
            </button>

            {/* Bare / Shirtless toggle for Men non-footwear */}
            {activeGender === 'men' && !isFootwearStage && total > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveAngle('front');
                  setShowBareOption((p) => !p);
                }}
                className={`text-[10px] font-mono-tech uppercase tracking-wider px-3 py-1.5 border rounded-full transition cursor-pointer ${
                  showBareOption
                    ? 'bg-black text-white border-black'
                    : 'border-neutral-300 text-neutral-600 hover:border-black'
                }`}
              >
                {showBareOption ? '← Back to Fits' : 'Bare Base'}
              </button>
            )}

            {isCalibrateMode && (
              <button
                type="button"
                onClick={() => setCalibrationTargetMode('lookbook')}
                className={`inline-flex items-center gap-1 text-[10px] font-mono-tech px-2.5 py-1.5 rounded-full border cursor-pointer ${
                  calibrationTargetMode === 'lookbook'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-800 font-semibold'
                    : 'border-neutral-200 text-neutral-500 hover:border-black'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                Calibrate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Right / Center Studio Canvas Stage ────────────────────────────── */}
      <div className="relative w-full lg:w-[66%] h-[580px] sm:h-[680px] lg:h-[86vh] flex items-center justify-center px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[440px] sm:max-w-[500px] md:max-w-[540px] aspect-[4/5] rounded-2xl bg-[#F4F4F6] border border-neutral-200/80 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.08)] overflow-hidden flex items-center justify-center"
        >
          {/* Subtle studio radial backdrop lighting */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 38%, rgba(255,255,255,0.92) 0%, rgba(244,244,246,0.4) 58%, rgba(232,232,236,0.65) 100%)',
            }}
          />

          {/* Calibration grid overlay */}
          {isLookbookCalibrating && showCrosshairGrid && (
            <CrosshairGridOverlay
              activeCoords={
                lookbookCalibrationLayer === 'baseModel' ? baseModelCalibration : activeCoords
              }
              label={
                lookbookCalibrationLayer === 'baseModel'
                  ? 'BASE MODEL LAYER'
                  : `LOOKBOOK // ${activeProduct.shortTitle}`
              }
            />
          )}

          {/* ── Top Studio Bar: Division Badge + View Angle Switcher ── */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs border border-neutral-200/80 text-[9px] font-mono-tech uppercase tracking-[0.18em] text-neutral-600 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                {showBareOption
                  ? 'BASE MODEL // SHIRTLESS'
                  : isPantsStage
                    ? 'ATHLETIC FIT // PANTS'
                    : isFootwearStage
                      ? 'PEDESTAL // FOOTWEAR'
                      : `${activeGender.toUpperCase()} STUDIO // ${activeCategory}`}
              </span>
            </div>

            {!showBareOption && (
              <div className="pointer-events-auto inline-flex items-center gap-0.5 bg-white/95 backdrop-blur-xs rounded-full border border-neutral-200/90 p-0.5 shadow-2xs">
                {(isFootwearStage
                  ? ([
                      { id: 'front', label: 'SIDE' },
                      { id: 'side', label: '3/4' },
                      { id: 'back', label: 'HEEL' },
                    ] as const)
                  : ([
                      { id: 'front', label: 'FRONT' },
                      { id: 'back', label: 'BACK' },
                    ] as const)
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveAngle(tab.id)}
                    className={`px-2.5 py-1 rounded-full text-[9px] font-mono-tech uppercase tracking-wider transition cursor-pointer ${
                      activeAngle === tab.id
                        ? 'bg-[#0A0A0A] text-white font-semibold'
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── LAYER 0: Static Studio Base Model (z-10) ── */}
          {baseModelLayerSrc && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-transform duration-200 ease-out"
              style={{
                transform: `translate3d(${baseModelCalibration.x}px, ${baseModelCalibration.y}px, 0) scale(${baseModelCalibration.scale}) rotate(${baseModelCalibration.rotation}deg)`,
              }}
            >
              <img
                src={baseModelLayerSrc}
                alt="NOCTA Studio Base Model"
                className={`w-full h-full object-contain select-none transition-transform duration-300 ease-out ${stageZoomClass}`}
                draggable={false}
              />
            </div>
          )}

          {/* ── LAYER 1: Active Garment / Seamless Studio Model Fit (z-20) ── */}
          <AnimatePresence mode="popLayout" initial={false}>
            {activeStageSrc && (
              <motion.div
                key={`stage-${activeProduct.id}-${activeAngle}-${showBareOption ? 'bare' : 'fit'}`}
                initial={{ opacity: 0, x: 90 }}
                animate={{ opacity: effectiveGarmentOpacity, x: 0 }}
                exit={{ opacity: 0, x: -90 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.85 }}
                className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
              >
                <div
                  className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
                  style={{
                    transform: `translate3d(${activeCoords.x}px, ${activeCoords.y}px, 0) scale(${activeCoords.scale}) rotate(${activeCoords.rotation}deg)`,
                  }}
                >
                  <img
                    src={activeStageSrc}
                    alt={activeProduct.title}
                    className={`w-full h-full object-contain select-none transition-transform duration-300 ease-out ${stageZoomClass}`}
                    draggable={false}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Top Soft Studio Fade for Close-Up Pants View (matches studio lower-body reference) ── */}
          {isPantsStage && !showBareOption && activeAngle === 'front' && (
            <div
              className="absolute top-0 left-0 right-0 h-24 z-22 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to bottom, #F4F4F6 0%, rgba(244,244,246,0.85) 38%, rgba(244,244,246,0) 100%)',
              }}
            />
          )}

          {/* ── Interactive Drag Surface (z-25) ── */}
          <motion.div
            key="garment-drag-surface"
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
            onDoubleClick={toggleAngle}
            className="absolute inset-0 z-25 cursor-grab active:cursor-grabbing"
          />

          {/* ── Left / Right Studio Cycle Arrows (z-30) ── */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Piece in Category"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs border border-neutral-200/90 flex items-center justify-center text-[#0A0A0A] hover:bg-black hover:text-white hover:border-black transition shadow-sm cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Piece in Category"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs border border-neutral-200/90 flex items-center justify-center text-[#0A0A0A] hover:bg-black hover:text-white hover:border-black transition shadow-sm cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* ── Single Clean Floating Bottom Studio Bar (z-30) ── */}
          <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between gap-3 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-neutral-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-[10px] font-mono-tech font-bold uppercase tracking-wider text-[#0A0A0A] truncate">
                {activeProduct.shortTitle}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-[10px] font-mono-tech text-neutral-600 shrink-0">
                {activeProduct.priceFormatted}
              </span>
            </div>

            {/* Pagination Dots */}
            <div className="hidden sm:flex items-center gap-1.5 shrink-0">
              {categoryProducts.map((prod, idx) => {
                const isActive = idx === safeIndex;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => setLookbookIndex(idx)}
                    aria-label={`Select ${prod.title}`}
                    title={prod.title}
                    className={`transition-all cursor-pointer rounded-full ${
                      isActive
                        ? 'w-2 h-2 bg-[#0A0A0A] scale-110'
                        : 'w-1.5 h-1.5 bg-neutral-300 hover:bg-neutral-500'
                    }`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => openProductDetail(activeProduct.id)}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0A0A0A] text-white text-[9px] font-mono-tech font-semibold uppercase tracking-widest hover:bg-neutral-800 transition cursor-pointer"
            >
              <span>Inspect</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
