import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Ruler,
  ShieldCheck,
  Crosshair,
  RotateCcw,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { PdpSlideIndex, SizeOption } from '../types/store';
import { CrosshairGridOverlay } from './CrosshairGridOverlay';

const APPAREL_SLIDE_META: Array<{
  index: PdpSlideIndex;
  code: string;
  label: string;
  shortLabel: string;
}> = [
  { index: 0, code: '01', label: 'SLIDE 0 // FLOATING CUTOUT', shortLabel: 'Cutout' },
  { index: 1, code: '02', label: 'SLIDE 1 // ON-MODEL FRONT', shortLabel: 'Model Front' },
  { index: 2, code: '03', label: 'SLIDE 2 // ON-MODEL BACK', shortLabel: 'Model Back' },
];

const SHOE_SLIDE_META: Array<{
  index: PdpSlideIndex;
  code: string;
  label: string;
  shortLabel: string;
}> = [
  { index: 0, code: '01', label: 'SLIDE 0 // LATERAL SIDE PROFILE', shortLabel: 'SIDE PROFILE' },
  { index: 1, code: '02', label: 'SLIDE 1 // 3/4 FRONT VIEW', shortLabel: '3/4 FRONT' },
  { index: 2, code: '03', label: 'SLIDE 2 // HEEL BACK VIEW', shortLabel: 'HEEL BACK' },
  { index: 3, code: '04', label: 'SLIDE 3 // TOP-DOWN VIEW', shortLabel: 'TOP VIEW' },
];

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProduct,
    openProductDetail,
    backToStore,
    pdpSlideIndex,
    setPdpSlideIndex,
    addToCart,
    setIsSizeGuideOpen,
    isCalibrateMode,
    calibrationTargetMode,
    setCalibrationTargetMode,
    onionSkinOpacity,
    showCrosshairGrid,
    showReferenceGhost,
  } = useStore();

  const isShoe = selectedProduct.category === 'SHOES';
  const slideMeta = isShoe ? SHOE_SLIDE_META : APPAREL_SLIDE_META;
  const totalSlides = slideMeta.length;
  const currentSlide = slideMeta[pdpSlideIndex] || slideMeta[0];

  const [selectedSize, setSelectedSize] = useState<SizeOption>(
    selectedProduct?.sizes?.[0] || 'M'
  );
  const [selectedColorway, setSelectedColorway] = useState<string>(
    selectedProduct?.colorways?.[0]?.name || 'Default'
  );
  const [cutoutFlipBack, setCutoutFlipBack] = useState<boolean>(false);

  // Sync default colorway and sizes when product changes
  useEffect(() => {
    setSelectedColorway(selectedProduct?.colorways?.[0]?.name || 'Default');
    setCutoutFlipBack(false);
    if (selectedProduct?.sizes?.length > 0 && !selectedProduct.sizes.includes(selectedSize)) {
      setSelectedSize(selectedProduct.sizes[0]);
    }
    const maxSlides = selectedProduct?.category === 'SHOES' ? 4 : 3;
    if (pdpSlideIndex >= maxSlides) {
      setPdpSlideIndex(0);
    }
  }, [selectedProduct, selectedSize, pdpSlideIndex, setPdpSlideIndex]);

  const handlePrevSlide = useCallback(() => {
    setPdpSlideIndex((prev) => ((prev - 1 + totalSlides) % totalSlides) as PdpSlideIndex);
  }, [setPdpSlideIndex, totalSlides]);

  const handleNextSlide = useCallback(() => {
    setPdpSlideIndex((prev) => ((prev + 1) % totalSlides) as PdpSlideIndex);
  }, [setPdpSlideIndex, totalSlides]);

  // Keyboard arrow navigation for the Morph & Turn stage
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        handleNextSlide();
      } else if (e.key === 'ArrowLeft') {
        handlePrevSlide();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNextSlide, handlePrevSlide]);

  // Resolve active image URL & saved calibration for current slide (0, 1, 2, or 3)
  const getSlideData = (slideIdx: PdpSlideIndex) => {
    if (isShoe) {
      if (slideIdx === 0) {
        return {
          url: selectedProduct.lateralSideUrl || selectedProduct.frontCutoutUrl,
          coords: selectedProduct.calibration.pdpSlide0,
          alt: `${selectedProduct.title} Outer Lateral Side Profile`,
        };
      }
      if (slideIdx === 1) {
        return {
          url: selectedProduct.threeQuarterFrontUrl || selectedProduct.modelFrontUrl,
          coords: selectedProduct.calibration.pdpSlide1,
          alt: `${selectedProduct.title} 3/4 Front Angled View`,
        };
      }
      if (slideIdx === 2) {
        return {
          url: selectedProduct.heelBackUrl || selectedProduct.modelBackUrl,
          coords: selectedProduct.calibration.pdpSlide2,
          alt: `${selectedProduct.title} Heel Back View`,
        };
      }
      return {
        url:
          selectedProduct.topDownUrl ||
          selectedProduct.backCutoutUrl ||
          selectedProduct.frontCutoutUrl,
        coords: selectedProduct.calibration.pdpSlide3 || selectedProduct.calibration.pdpSlide0,
        alt: `${selectedProduct.title} Top View`,
      };
    }

    if (slideIdx === 0) {
      return {
        url: cutoutFlipBack
          ? selectedProduct.backCutoutUrl
          : selectedProduct.frontCutoutUrl,
        coords: selectedProduct.calibration.pdpSlide0,
        alt: `${selectedProduct.title} Floating Garment Cutout`,
      };
    }
    if (slideIdx === 1) {
      return {
        url: selectedProduct.modelFrontUrl,
        coords: selectedProduct.calibration.pdpSlide1,
        alt: `${selectedProduct.title} On-Model Front View`,
      };
    }
    return {
      url: selectedProduct.modelBackUrl,
      coords: selectedProduct.calibration.pdpSlide2,
      alt: `${selectedProduct.title} On-Model Back View`,
    };
  };

  const activeSlideData = getSlideData(pdpSlideIndex);
  const referenceSlideData = getSlideData(0);
  const isPdpCalibrating = isCalibrateMode && calibrationTargetMode === 'pdp';
  const effectiveOpacity = isPdpCalibrating ? onionSkinOpacity : 1;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FFFFFF] text-[#0A0A0A]">
      {/* Main Asymmetric 3-Column PDP Stage */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-8">
          {/* LEFT COLUMN (lg:w-3/12 — Editorial Info & Specs) */}
          <div className="w-full lg:w-3/12 flex flex-col items-start order-2 lg:order-1">
            <button
              type="button"
              onClick={() => backToStore('drop-02')}
              className="inline-flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-[#0A0A0A] transition cursor-pointer mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Drop 02</span>
            </button>

            <div className="text-[10px] font-mono-tech uppercase tracking-[0.22em] text-neutral-400">
              {selectedProduct.collection} // {selectedProduct.code}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mt-1 uppercase">
              {selectedProduct.title}
            </h1>

            <p className="text-[11px] font-mono-tech text-neutral-400 mt-1">
              {selectedProduct.subtitle}
            </p>

            {/* Narrative Paragraph */}
            <p className="text-xs text-neutral-600 leading-relaxed mt-4">
              {selectedProduct.narrative}
            </p>

            {/* Bulleted Technical Specs */}
            <div className="mt-5 w-full pt-4 border-t border-neutral-100">
              <div className="text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400 mb-2">
                TECHNICAL SPECIFICATIONS
              </div>
              <ul className="text-xs text-neutral-600 space-y-1.5 mt-2 list-disc pl-4 leading-relaxed">
                {selectedProduct.specs.map((spec, idx) => (
                  <li key={idx}>{spec}</li>
                ))}
              </ul>
            </div>

            {/* Sizing Reference */}
            <div className="mt-5 pt-4 border-t border-neutral-100 w-full flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium text-neutral-800">
                {selectedProduct.sizingReference}
              </span>
              <span className="text-[10px] font-mono-tech uppercase tracking-wider text-neutral-400">
                STANDARD BOXY FIT
              </span>
            </div>
          </div>

          {/* CENTER COLUMN (lg:w-6/12 — The "Morph & Turn" Gallery) */}
          <div className="w-full lg:w-6/12 flex flex-col items-center order-1 lg:order-2">
            {/* Top Stage Status Bar */}
            <div className="w-full max-w-[540px] flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2 text-[10px] font-mono-tech uppercase tracking-widest text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A]" />
                <span>{currentSlide.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {!isShoe && pdpSlideIndex === 0 && (
                  <button
                    type="button"
                    onClick={() => setCutoutFlipBack((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-[10px] font-mono-tech uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-neutral-200 hover:border-black text-neutral-600 hover:text-black transition cursor-pointer"
                    title="Flip floating ghost cutout between Front and Back"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>{cutoutFlipBack ? 'Cutout: Back' : 'Cutout: Front'}</span>
                  </button>
                )}

                {isCalibrateMode && (
                  <button
                    type="button"
                    onClick={() => setCalibrationTargetMode('pdp')}
                    className={`inline-flex items-center gap-1 text-[10px] font-mono-tech px-2 py-0.5 rounded border cursor-pointer ${
                      calibrationTargetMode === 'pdp'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-800 font-semibold'
                        : 'border-neutral-200 text-neutral-500 hover:border-black'
                    }`}
                  >
                    <Crosshair className="w-3 h-3" />
                    Calibrate Slide {pdpSlideIndex}
                  </button>
                )}
              </div>
            </div>

            {/* Large Central Stage (aspect-[4/5] relative flex items-center justify-center overflow-hidden bg-white) */}
            <div className="w-full max-w-[540px] aspect-[4/5] relative flex items-center justify-center overflow-hidden bg-[#FFFFFF] select-none">
              {/* Grounded Studio Pedestal Floor Shadow for Footwear */}
              {isShoe && (
                <div className="absolute bottom-10 w-72 h-7 bg-neutral-200/55 rounded-[100%] blur-md pointer-events-none" />
              )}

              {/* Red Shoulder/Centerline Crosshair Alignment Grid when Calibrate Mode is active */}
              {isPdpCalibrating && showCrosshairGrid && (
                <CrosshairGridOverlay
                  activeCoords={activeSlideData.coords}
                  label={`PDP SLIDE ${pdpSlideIndex} // ${currentSlide.shortLabel.toUpperCase()}`}
                />
              )}

              {/* Optional Ghost Reference Layer (Slide 0 Floating Cutout at 28% opacity) to align Slide 1 & Slide 2 1:1 */}
              {isPdpCalibrating && showReferenceGhost && pdpSlideIndex !== 0 && (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none opacity-30 saturate-0"
                  style={{
                    transform: `translate3d(${referenceSlideData.coords.x}px, ${referenceSlideData.coords.y}px, 0) scale(${referenceSlideData.coords.scale}) rotate(${referenceSlideData.coords.rotation}deg)`,
                  }}
                >
                  <img
                    src={referenceSlideData.url}
                    alt="Slide 0 Reference Ghost"
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </div>
              )}

              {/* LOCKED-POSITION CROSS-FADE (AnimatePresence opacity cross-dissolve over 450ms ease-in-out) */}
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={`${selectedProduct.id}-slide-${pdpSlideIndex}-${cutoutFlipBack ? 'back' : 'front'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: effectiveOpacity }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className="absolute inset-0 z-20 flex items-center justify-center"
                >
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
                    style={{
                      transform: `translate3d(${activeSlideData.coords.x}px, ${activeSlideData.coords.y}px, 0) scale(${activeSlideData.coords.scale}) rotate(${activeSlideData.coords.rotation}deg)`,
                    }}
                  >
                    <img
                      src={activeSlideData.url}
                      alt={activeSlideData.alt}
                      className="w-full h-full object-contain select-none"
                      draggable={false}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Left < and Right > Chevron Arrows on the edges of the stage */}
              <button
                type="button"
                onClick={handlePrevSlide}
                aria-label="Previous Morph View"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 border border-neutral-200 flex items-center justify-center text-[#0A0A0A] hover:bg-black hover:text-white hover:border-black transition cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleNextSlide}
                aria-label="Next Morph View"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 border border-neutral-200 flex items-center justify-center text-[#0A0A0A] hover:bg-black hover:text-white hover:border-black transition cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3-Stage / 4-Angle Sequence Selector Pills Under Stage */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 bg-neutral-50 p-1 rounded-full border border-neutral-200">
              {slideMeta.map((slide) => {
                const isActive = pdpSlideIndex === slide.index;
                return (
                  <button
                    key={slide.index}
                    type="button"
                    onClick={() => setPdpSlideIndex(slide.index)}
                    className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono-tech uppercase tracking-wider transition cursor-pointer ${
                      isActive
                        ? 'bg-[#0A0A0A] text-white font-semibold shadow-xs'
                        : 'text-neutral-500 hover:text-[#0A0A0A]'
                    }`}
                  >
                    {slide.shortLabel}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-neutral-400 mt-2 font-mono-tech text-center">
              {isShoe
                ? 'Select angle pill or click < > to inspect 4-angle footwear details on pedestal'
                : 'Click < or > to morph floating cutout onto model & turn 180°'}
            </p>
          </div>

          {/* RIGHT COLUMN (lg:w-3/12 — Purchase Controls) */}
          <div className="w-full lg:w-3/12 flex flex-col order-3">
            {/* Price + Taxes Included Caption */}
            <div className="pb-5 border-b border-neutral-100">
              <div className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
                {selectedProduct.priceFormatted}
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                Taxes included. Express global courier dispatch.
              </p>
            </div>

            {/* Colorway Thumbnail Switcher (Mini Square Previews) */}
            <div className="py-5 border-b border-neutral-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] uppercase tracking-widest font-semibold text-neutral-900">
                  Colorway
                </span>
                <span className="text-[11px] text-neutral-500 font-mono-tech">
                  {selectedColorway}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2.5">
                {selectedProduct.colorways.map((cw) => {
                  const isSelected = selectedColorway === cw.name;
                  const linkedProd = products.find((p) => p.id === cw.linkedProductId);
                  return (
                    <button
                      key={cw.id}
                      type="button"
                      onClick={() => {
                        setSelectedColorway(cw.name);
                        if (cw.linkedProductId && cw.linkedProductId !== selectedProduct.id) {
                          openProductDetail(cw.linkedProductId);
                        }
                      }}
                      title={cw.name}
                      className={`group relative w-12 h-14 bg-neutral-50 border flex flex-col items-center justify-center p-1 transition cursor-pointer ${
                        isSelected
                          ? 'border-2 border-[#0A0A0A] shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      {linkedProd ? (
                        <img
                          src={linkedProd.frontCutoutUrl}
                          alt={cw.name}
                          className="w-full h-9 object-contain"
                          draggable={false}
                        />
                      ) : (
                        <span
                          className="w-6 h-6 rounded-xs border border-black/10"
                          style={{ backgroundColor: cw.hex }}
                        />
                      )}
                      <span className="mt-0.5 flex items-center gap-0.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: cw.hex }}
                        />
                        {cw.secondaryHex && (
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: cw.secondaryHex }}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector (S, M, L, XL rectangular bordered pills) */}
            <div className="py-5 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest font-semibold text-neutral-900">
                  Select Size
                </span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-[#0A0A0A] underline underline-offset-4 cursor-pointer"
                >
                  <Ruler className="w-3 h-3" />
                  <span>Size guide</span>
                </button>
              </div>

              <div
                className={`grid ${
                  selectedProduct.sizes.length > 5 ? 'grid-cols-4 sm:grid-cols-7' : 'grid-cols-4'
                } gap-2 mt-3`}
              >
                {selectedProduct.sizes.map((size) => {
                  const active = selectedSize === size;
                  const stockCount = selectedProduct.stockBySize?.[size] ?? 10;
                  const outOfStock = stockCount <= 0;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 flex flex-col items-center justify-center text-xs font-mono-tech font-semibold uppercase tracking-widest border transition cursor-pointer ${
                        outOfStock
                          ? 'bg-neutral-100 text-neutral-300 border-neutral-200 line-through cursor-not-allowed'
                          : active
                            ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                            : 'bg-white text-[#0A0A0A] border-neutral-200 hover:border-[#0A0A0A]'
                      }`}
                    >
                      <span>{size}</span>
                      <span
                        className={`text-[8px] font-normal ${
                          active ? 'text-neutral-300' : 'text-neutral-400'
                        }`}
                      >
                        {outOfStock ? 'OUT' : `${stockCount} left`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary CTA: Full-width solid black button */}
            <div className="pt-6">
              {(() => {
                const availForSelected = selectedProduct.stockBySize?.[selectedSize] ?? 10;
                return (
                  <>
                    <button
                      type="button"
                      disabled={availForSelected <= 0}
                      onClick={() =>
                        addToCart(selectedProduct.id, selectedSize, selectedColorway)
                      }
                      className="w-full h-12 bg-[#0A0A0A] disabled:bg-neutral-300 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>
                        {availForSelected <= 0
                          ? `SIZE ${selectedSize} SOLD OUT`
                          : `ADD TO CART • ${selectedProduct.priceFormatted}`}
                      </span>
                    </button>

                    <div className="mt-4 flex items-center justify-between text-[10px] font-mono-tech text-neutral-400 uppercase tracking-wider">
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
                        SERIALIZED DROP 02 AUTHENTICITY
                      </span>
                      <span className="text-emerald-700 font-semibold">
                        {availForSelected} UNITS IN STORAGE (SIZE {selectedSize})
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Bottom Cross-Sell Strip: Complete Drop 02 Archive */}
        <div className="mt-20 pt-12 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A0A0A]">
              OTHER PIECES IN DROP 02
            </h2>
            <button
              type="button"
              onClick={() => backToStore('drop-02')}
              className="text-[11px] uppercase tracking-widest text-neutral-500 hover:text-black underline underline-offset-4 cursor-pointer"
            >
              View Full Grid
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {products
              .filter((p) => p.id !== selectedProduct.id)
              .map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => openProductDetail(prod.id)}
                  className="group cursor-pointer flex flex-col items-center"
                >
                  <div className="w-full aspect-[4/5] bg-neutral-50/60 group-hover:bg-neutral-100/70 transition flex items-center justify-center p-3 relative overflow-hidden">
                    <img
                      src={prod.frontCutoutUrl}
                      alt={prod.title}
                      className="w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
                      draggable={false}
                    />
                    <img
                      src={prod.backCutoutUrl}
                      alt={`${prod.title} Back`}
                      className="absolute inset-0 w-full h-full object-contain p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      draggable={false}
                    />
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-900 mt-2.5 text-center">
                    {prod.shortTitle}
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">
                    {prod.priceFormatted}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
