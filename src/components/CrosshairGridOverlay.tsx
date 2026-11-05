import React from 'react';
import type { TransformCoords } from '../types/store';

interface CrosshairGridOverlayProps {
  activeCoords: TransformCoords;
  label: string;
}

export const CrosshairGridOverlay: React.FC<CrosshairGridOverlayProps> = ({
  activeCoords,
  label,
}) => {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Subtle 24px micro-grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(239,68,68,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(239,68,68,0.35) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Primary Center Vertical Axis */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-red-500/80">
        <span className="absolute top-3 left-2 px-1.5 py-0.5 rounded bg-red-600 text-white font-mono-tech text-[9px] tracking-wider uppercase whitespace-nowrap shadow">
          CENTERLINE X:0
        </span>
      </div>

      {/* Collar Anchor Line (~24% from top) */}
      <div className="absolute left-8 right-8 top-[23.5%] h-[1px] border-t border-dashed border-red-500/85">
        <span className="absolute -top-4 left-2 font-mono-tech text-[9px] font-semibold text-red-600 bg-white/90 px-1 rounded">
          COLLAR ANCHOR
        </span>
      </div>

      {/* Shoulder Span Line (~29.5% from top) with left/right shoulder brackets */}
      <div className="absolute left-4 right-4 top-[29.5%] h-[1.5px] bg-red-500/85">
        <span className="absolute -top-4 right-2 font-mono-tech text-[9px] font-semibold text-red-600 bg-white/90 px-1 rounded">
          SHOULDER AXIS
        </span>
        {/* Left & Right Shoulder Tick Brackets */}
        <div className="absolute left-[23%] -top-3 w-[2px] h-6 bg-red-600" />
        <div className="absolute right-[23%] -top-3 w-[2px] h-6 bg-red-600" />
      </div>

      {/* Torso Center Horizontal Axis (50%) */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-red-500/50" />

      {/* Center Reticle Target */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-red-500/80 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-red-500" />
      </div>

      {/* Waist / Hem Reference Line (~72.5% from top) */}
      <div className="absolute left-8 right-8 top-[72.5%] h-[1px] border-t border-dashed border-red-500/85">
        <span className="absolute -top-4 left-2 font-mono-tech text-[9px] font-semibold text-red-600 bg-white/90 px-1 rounded">
          HEM BASELINE
        </span>
      </div>

      {/* Live Telemetry HUD Pill (Bottom-Left of Stage) */}
      <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md text-white px-3 py-1.5 rounded border border-red-500/50 font-mono-tech text-[10px] flex items-center gap-3 shadow-lg">
        <span className="flex items-center gap-1.5 text-red-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {label}
        </span>
        <span className="text-neutral-300">
          X:{activeCoords.x > 0 ? `+${activeCoords.x}` : activeCoords.x}px
        </span>
        <span className="text-neutral-300">
          Y:{activeCoords.y > 0 ? `+${activeCoords.y}` : activeCoords.y}px
        </span>
        <span className="text-neutral-300">S:{activeCoords.scale.toFixed(2)}x</span>
        <span className="text-neutral-300">
          R:{activeCoords.rotation > 0 ? `+${activeCoords.rotation}` : activeCoords.rotation}°
        </span>
      </div>
    </div>
  );
};
