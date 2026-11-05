import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders,
  Crosshair,
  Eye,
  Upload,
  Copy,
  Check,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { PdpSlideIndex, ProductCalibration, TransformCoords } from '../types/store';
import { DEFAULT_COORDS } from '../data/initialProducts';

interface ImageSlotUploadCardProps {
  label: string;
  sublabel: string;
  currentUrl: string;
  onUpload: (dataUrl: string) => void;
  onReset: () => void;
}

const ImageSlotUploadCard: React.FC<ImageSlotUploadCardProps> = ({
  label,
  sublabel,
  currentUrl,
  onUpload,
  onReset,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`group relative rounded-lg border p-2 transition cursor-pointer flex items-center gap-2.5 ${
        isDragging
          ? 'border-amber-400 bg-amber-500/15'
          : 'border-white/12 bg-white/5 hover:border-white/30 hover:bg-white/10'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/webp,image/jpeg,image/svg+xml"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="w-11 h-12 rounded bg-white/95 flex items-center justify-center p-1 shrink-0 overflow-hidden">
        <img
          src={currentUrl}
          alt={label}
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-mono-tech font-semibold uppercase tracking-wider text-white truncate">
          {label}
        </div>
        <div className="text-[9px] text-neutral-400 truncate mt-0.5">{sublabel}</div>
        <div className="mt-1 inline-flex items-center gap-1 text-[9px] text-amber-400 font-mono-tech">
          <Upload className="w-2.5 h-2.5" />
          <span>Drop PNG/WebP or Click</span>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onReset();
        }}
        title="Revert slot to factory studio graphic"
        className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
      </button>
    </div>
  );
};

export const AdminCalibrationStudio: React.FC = () => {
  const {
    products,
    baseModelUrl,
    baseModelCalibration,
    activeView,
    selectedProduct,
    lookbookIndex,
    setLookbookIndex,
    pdpSlideIndex,
    setPdpSlideIndex,
    openProductDetail,
    backToStore,
    isCalibrateMode,
    setIsCalibrateMode,
    calibrationTargetMode,
    setCalibrationTargetMode,
    lookbookCalibrationLayer,
    setLookbookCalibrationLayer,
    onionSkinOpacity,
    setOnionSkinOpacity,
    showCrosshairGrid,
    setShowCrosshairGrid,
    showReferenceGhost,
    setShowReferenceGhost,
    updateProductCalibration,
    updateBaseModelCalibration,
    updateProductImage,
    resetProductImage,
    updateBaseModelImage,
    resetBaseModelImage,
    resetActiveCalibration,
    resetAllToDefaults,
    exportCalibrationJson,
  } = useStore();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'transforms' | 'uploads'>('transforms');
  const [copiedJson, setCopiedJson] = useState(false);

  if (!isCalibrateMode) return null;

  // Determine which product and coordinate slot we are actively editing
  const activeProduct =
    calibrationTargetMode === 'lookbook'
      ? products[lookbookIndex] || products[0]
      : selectedProduct;

  const activeSlotKey: keyof ProductCalibration =
    calibrationTargetMode === 'lookbook'
      ? 'lookbook'
      : pdpSlideIndex === 0
      ? 'pdpSlide0'
      : pdpSlideIndex === 1
      ? 'pdpSlide1'
      : pdpSlideIndex === 2
      ? 'pdpSlide2'
      : 'pdpSlide3';

  const isShoe = activeProduct?.category === 'SHOES';

  const activeCoords: TransformCoords =
    calibrationTargetMode === 'lookbook' && lookbookCalibrationLayer === 'baseModel'
      ? baseModelCalibration
      : activeProduct.calibration[activeSlotKey] ||
        activeProduct.calibration.pdpSlide0 ||
        DEFAULT_COORDS;

  const handleCoordChange = (patch: Partial<TransformCoords>) => {
    if (calibrationTargetMode === 'lookbook' && lookbookCalibrationLayer === 'baseModel') {
      updateBaseModelCalibration(patch);
    } else {
      updateProductCalibration(activeProduct.id, activeSlotKey, patch);
    }
  };

  const handleSwitchTargetMode = (mode: 'lookbook' | 'pdp') => {
    setCalibrationTargetMode(mode);
    if (mode === 'lookbook' && activeView !== 'home') {
      backToStore('lookbook');
    } else if (mode === 'pdp' && activeView !== 'pdp') {
      openProductDetail(activeProduct.id);
    }
  };

  const handleSelectProductInStudio = (productId: string) => {
    const idx = products.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      setLookbookIndex(idx);
    }
    if (calibrationTargetMode === 'pdp' || activeView === 'pdp') {
      openProductDetail(productId);
    }
  };

  const handleCopyJson = async () => {
    const json = exportCalibrationJson();
    try {
      await navigator.clipboard.writeText(json);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2400);
    } catch {
      // Fallback textarea copy
      const ta = document.createElement('textarea');
      ta.value = json;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2400);
    }
  };

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed top-20 right-4 z-50 w-[340px] sm:w-[375px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl bg-[#0A0A0C]/92 backdrop-blur-xl border border-white/15 text-white shadow-[0_24px_60px_rgba(0,0,0,0.55)] overflow-hidden select-none"
      >
        {/* Studio Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <div>
              <div className="text-[11px] font-mono-tech font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
                <span>CUTOUT CALIBRATION STUDIO</span>
              </div>
              <div className="text-[9px] font-mono-tech text-neutral-400">
                NO-PHOTOSHOP REAL-TIME ALIGNMENT • SHIFT+C
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title={isCollapsed ? 'Expand Studio' : 'Minimize Studio'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsCalibrateMode(false)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close Calibration Studio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="p-4 overflow-y-auto space-y-4 text-xs">
            {/* 1. TARGET SELECTOR (Homepage Lookbook Slider vs PDP Morph Gallery) */}
            <div>
              <label className="block text-[9px] font-mono-tech uppercase tracking-widest text-neutral-400 mb-1.5">
                1. Calibration Stage Target
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => handleSwitchTargetMode('lookbook')}
                  className={`py-1.5 px-2 rounded-md text-[10px] font-mono-tech uppercase tracking-wider transition cursor-pointer ${
                    calibrationTargetMode === 'lookbook'
                      ? 'bg-amber-400 text-[#0A0A0A] font-bold shadow'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  Lookbook Slider
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchTargetMode('pdp')}
                  className={`py-1.5 px-2 rounded-md text-[10px] font-mono-tech uppercase tracking-wider transition cursor-pointer ${
                    calibrationTargetMode === 'pdp'
                      ? 'bg-amber-400 text-[#0A0A0A] font-bold shadow'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  PDP Morph Gallery
                </button>
              </div>
            </div>

            {/* Product Selector + Sub-Layer Selector */}
            <div className="space-y-2.5 bg-white/[0.04] p-3 rounded-xl border border-white/10">
              <div>
                <label className="block text-[9px] font-mono-tech uppercase tracking-widest text-neutral-400 mb-1">
                  Active Garment Piece ({lookbookIndex + 1}/0{products.length})
                </label>
                <select
                  value={activeProduct.id}
                  onChange={(e) => handleSelectProductInStudio(e.target.value)}
                  className="w-full bg-[#141519] border border-white/15 rounded-lg px-2.5 py-1.5 text-[11px] font-mono-tech text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  {products.map((prod, idx) => (
                    <option key={prod.id} value={prod.id}>
                      0{idx + 1} — {prod.title}
                    </option>
                  ))}
                </select>
              </div>

              {calibrationTargetMode === 'lookbook' ? (
                <div>
                  <label className="block text-[9px] font-mono-tech uppercase tracking-widest text-neutral-400 mb-1">
                    Lookbook Layer to Align
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLookbookCalibrationLayer('garment')}
                      className={`py-1 px-2 rounded border text-[10px] font-mono-tech uppercase transition cursor-pointer ${
                        lookbookCalibrationLayer === 'garment'
                          ? 'bg-white text-black border-white font-semibold'
                          : 'border-white/15 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Garment Cutout
                    </button>
                    <button
                      type="button"
                      onClick={() => setLookbookCalibrationLayer('baseModel')}
                      className={`py-1 px-2 rounded border text-[10px] font-mono-tech uppercase transition cursor-pointer ${
                        lookbookCalibrationLayer === 'baseModel'
                          ? 'bg-white text-black border-white font-semibold'
                          : 'border-white/15 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Base Model
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[9px] font-mono-tech uppercase tracking-widest text-neutral-400 mb-1">
                    {isShoe ? 'Footwear Angle to Align (Floor Match)' : 'PDP Morph Slide to Align (1:1 Shoulder Match)'}
                  </label>
                  <div className={`grid ${isShoe ? 'grid-cols-4' : 'grid-cols-3'} gap-1`}>
                    {(isShoe
                      ? [
                          { idx: 0 as PdpSlideIndex, name: 'Lateral' },
                          { idx: 1 as PdpSlideIndex, name: '3/4 Front' },
                          { idx: 2 as PdpSlideIndex, name: 'Heel Back' },
                          { idx: 3 as PdpSlideIndex, name: 'Top Down' },
                        ]
                      : [
                          { idx: 0 as PdpSlideIndex, name: 'S0: Cutout' },
                          { idx: 1 as PdpSlideIndex, name: 'S1: Front' },
                          { idx: 2 as PdpSlideIndex, name: 'S2: Back' },
                        ]
                    ).map((s) => (
                      <button
                        key={s.idx}
                        type="button"
                        onClick={() => setPdpSlideIndex(s.idx)}
                        className={`py-1.5 px-1 rounded border text-[9px] font-mono-tech uppercase transition cursor-pointer text-center truncate ${
                          pdpSlideIndex === s.idx
                            ? 'bg-white text-black border-white font-semibold'
                            : 'border-white/15 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Studio Mode Tabs: Real-Time Sliders vs Drag & Drop Image Uploader */}
            <div className="flex border-b border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('transforms')}
                className={`flex-1 pb-2 text-[10px] font-mono-tech uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'transforms'
                    ? 'border-amber-400 text-amber-400 font-semibold'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Transforms &amp; Onion-Skin</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('uploads')}
                className={`flex-1 pb-2 text-[10px] font-mono-tech uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'uploads'
                    ? 'border-amber-400 text-amber-400 font-semibold'
                    : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>Custom PNG Uploader</span>
              </button>
            </div>

            {activeTab === 'transforms' ? (
              <>
                {/* 2. REAL-TIME TRANSFORM SLIDERS */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono-tech uppercase tracking-widest text-neutral-400">
                      2. Real-Time Transform Coordinates
                    </span>
                    <button
                      type="button"
                      onClick={resetActiveCalibration}
                      className="inline-flex items-center gap-1 text-[9px] font-mono-tech text-neutral-400 hover:text-amber-400 transition cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset Layer</span>
                    </button>
                  </div>

                  {/* X-Offset (-300px to +300px, step 1px) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono-tech">
                      <span className="text-neutral-300">X-Offset (Horizontal)</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleCoordChange({ x: Math.max(-300, activeCoords.x - 1) })
                          }
                          className="px-1.5 py-0.2 bg-white/10 rounded hover:bg-white/20 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-14 text-center text-amber-400 font-semibold">
                          {activeCoords.x > 0 ? `+${activeCoords.x}` : activeCoords.x}px
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCoordChange({ x: Math.min(300, activeCoords.x + 1) })
                          }
                          className="px-1.5 py-0.2 bg-white/10 rounded hover:bg-white/20 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={-300}
                      max={300}
                      step={1}
                      value={activeCoords.x}
                      onChange={(e) => handleCoordChange({ x: Number(e.target.value) })}
                      className="w-full calibration-slider"
                    />
                  </div>

                  {/* Y-Offset (-300px to +300px, step 1px) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono-tech">
                      <span className="text-neutral-300">Y-Offset (Vertical)</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleCoordChange({ y: Math.max(-300, activeCoords.y - 1) })
                          }
                          className="px-1.5 py-0.2 bg-white/10 rounded hover:bg-white/20 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-14 text-center text-amber-400 font-semibold">
                          {activeCoords.y > 0 ? `+${activeCoords.y}` : activeCoords.y}px
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCoordChange({ y: Math.min(300, activeCoords.y + 1) })
                          }
                          className="px-1.5 py-0.2 bg-white/10 rounded hover:bg-white/20 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={-300}
                      max={300}
                      step={1}
                      value={activeCoords.y}
                      onChange={(e) => handleCoordChange({ y: Number(e.target.value) })}
                      className="w-full calibration-slider"
                    />
                  </div>

                  {/* Scale (0.40 to 2.20, step 0.01) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono-tech">
                      <span className="text-neutral-300">Scale (Proportion)</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleCoordChange({
                              scale: Number(Math.max(0.4, activeCoords.scale - 0.01).toFixed(2)),
                            })
                          }
                          className="px-1.5 py-0.2 bg-white/10 rounded hover:bg-white/20 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-14 text-center text-amber-400 font-semibold">
                          {activeCoords.scale.toFixed(2)}x
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCoordChange({
                              scale: Number(Math.min(2.2, activeCoords.scale + 0.01).toFixed(2)),
                            })
                          }
                          className="px-1.5 py-0.2 bg-white/10 rounded hover:bg-white/20 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0.4}
                      max={2.2}
                      step={0.01}
                      value={activeCoords.scale}
                      onChange={(e) => handleCoordChange({ scale: Number(e.target.value) })}
                      className="w-full calibration-slider"
                    />
                  </div>

                  {/* Rotation (-15° to +15°, step 0.5°) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono-tech">
                      <span className="text-neutral-300">Rotation (Tilt)</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleCoordChange({
                              rotation: Math.max(-15, activeCoords.rotation - 0.5),
                            })
                          }
                          className="px-1.5 py-0.2 bg-white/10 rounded hover:bg-white/20 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-14 text-center text-amber-400 font-semibold">
                          {activeCoords.rotation > 0
                            ? `+${activeCoords.rotation}`
                            : activeCoords.rotation}
                          °
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCoordChange({
                              rotation: Math.min(15, activeCoords.rotation + 0.5),
                            })
                          }
                          className="px-1.5 py-0.2 bg-white/10 rounded hover:bg-white/20 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={-15}
                      max={15}
                      step={0.5}
                      value={activeCoords.rotation}
                      onChange={(e) => handleCoordChange({ rotation: Number(e.target.value) })}
                      className="w-full calibration-slider"
                    />
                  </div>
                </div>

                {/* 3. ONION-SKIN ALIGNMENT AID & CROSSHAIR GRID */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono-tech uppercase tracking-widest text-neutral-400">
                      3. Onion-Skin Alignment Aid
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setOnionSkinOpacity((prev) => (prev === 0.5 ? 1.0 : 0.5))
                      }
                      className={`px-2 py-0.5 rounded text-[9px] font-mono-tech uppercase transition cursor-pointer ${
                        onionSkinOpacity === 0.5
                          ? 'bg-amber-400 text-black font-bold'
                          : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                      }`}
                    >
                      {onionSkinOpacity === 0.5 ? '50% Onion-Skin ON' : 'Set 50% Opacity'}
                    </button>
                  </div>

                  {/* Opacity Slider */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono-tech">
                      <span className="text-neutral-300 flex items-center gap-1.5">
                        <Eye className="w-3 h-3 text-amber-400" />
                        Active Layer Opacity
                      </span>
                      <span className="text-amber-400 font-semibold">
                        {Math.round(onionSkinOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.15}
                      max={1.0}
                      step={0.05}
                      value={onionSkinOpacity}
                      onChange={(e) => setOnionSkinOpacity(Number(e.target.value))}
                      className="w-full calibration-slider"
                    />
                  </div>

                  {/* Crosshair Grid + PDP Ghost Reference Toggles */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCrosshairGrid((prev) => !prev)}
                      className={`py-2 px-2.5 rounded-lg border text-[10px] font-mono-tech uppercase flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        showCrosshairGrid
                          ? 'border-red-500/80 bg-red-500/20 text-red-300 font-semibold'
                          : 'border-white/15 bg-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Red Crosshair</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowReferenceGhost((prev) => !prev)}
                      className={`py-2 px-2.5 rounded-lg border text-[10px] font-mono-tech uppercase flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        showReferenceGhost
                          ? 'border-amber-400/80 bg-amber-400/20 text-amber-300 font-semibold'
                          : 'border-white/15 bg-white/5 text-neutral-400 hover:text-white'
                      }`}
                      title="Show Slide 0 Cutout ghost behind Slide 1 & Slide 2 in PDP"
                    >
                      <Layers className="w-3 h-3" />
                      <span>S0 Ghost Ref</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* 4. CUSTOM IMAGE UPLOADER (DRAG & DROP) */
              <div className="space-y-3">
                <div className="text-[9px] font-mono-tech uppercase tracking-widest text-neutral-400">
                  4. Drag &amp; Drop Custom Cutouts (Auto-Saved)
                </div>

                {/* Base Standing Model Uploader */}
                <ImageSlotUploadCard
                  label="Base Standing Model"
                  sublabel="Lookbook Center Stage (Hips to Head)"
                  currentUrl={baseModelUrl}
                  onUpload={(dataUrl) => updateBaseModelImage(dataUrl)}
                  onReset={resetBaseModelImage}
                />

                <div className="pt-1 text-[9px] font-mono-tech uppercase tracking-widest text-amber-400">
                  Slots for: {activeProduct.shortTitle}
                </div>

                <div className="space-y-2">
                  <ImageSlotUploadCard
                    label="1. frontCutout"
                    sublabel="Lookbook Slider + Grid Default + PDP S0"
                    currentUrl={activeProduct.frontCutoutUrl}
                    onUpload={(url) =>
                      updateProductImage(activeProduct.id, 'frontCutoutUrl', url)
                    }
                    onReset={() => resetProductImage(activeProduct.id, 'frontCutoutUrl')}
                  />
                  <ImageSlotUploadCard
                    label="2. backCutout"
                    sublabel="Drop 02 Grid Hover Flip + PDP S0 Rear"
                    currentUrl={activeProduct.backCutoutUrl}
                    onUpload={(url) =>
                      updateProductImage(activeProduct.id, 'backCutoutUrl', url)
                    }
                    onReset={() => resetProductImage(activeProduct.id, 'backCutoutUrl')}
                  />
                  <ImageSlotUploadCard
                    label="3. modelFront"
                    sublabel="PDP Morph Stage — Slide 1 (On-Model Front)"
                    currentUrl={activeProduct.modelFrontUrl}
                    onUpload={(url) =>
                      updateProductImage(activeProduct.id, 'modelFrontUrl', url)
                    }
                    onReset={() => resetProductImage(activeProduct.id, 'modelFrontUrl')}
                  />
                  <ImageSlotUploadCard
                    label="4. modelBack"
                    sublabel="PDP Morph Stage — Slide 2 (On-Model Back)"
                    currentUrl={activeProduct.modelBackUrl}
                    onUpload={(url) =>
                      updateProductImage(activeProduct.id, 'modelBackUrl', url)
                    }
                    onReset={() => resetProductImage(activeProduct.id, 'modelBackUrl')}
                  />
                </div>
              </div>
            )}

            {/* 5. SAVE & EXPORT CONFIG */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[9px] font-mono-tech text-neutral-400">
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <Sparkles className="w-2.5 h-2.5" />
                  Auto-saved to localStorage
                </span>
                <button
                  type="button"
                  onClick={resetAllToDefaults}
                  className="inline-flex items-center gap-1 text-neutral-400 hover:text-red-400 transition cursor-pointer"
                  title="Reset all products and images to factory demo state"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Factory Reset All</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopyJson}
                className={`w-full py-2.5 px-4 rounded-xl font-mono-tech text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                  copiedJson
                    ? 'bg-emerald-500 text-black'
                    : 'bg-white text-[#0A0A0A] hover:bg-amber-400'
                }`}
              >
                {copiedJson ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied Calibration JSON!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Calibration JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
};
