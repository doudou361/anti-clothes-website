// High-resolution SVG studio cutout generator for NOCTA / STUDIO
// Every canvas shares a locked 800x1000 studio coordinate system:
// - Center X: 400
// - Collar / Neck Base Y: 235
// - Shoulder Span: X 205 to 595
// - Hem Line: Y 735 (Outerwear/Hoodies) / Y 720 (Tee)
// This guarantees 1:1 alignment across the Homepage Lookbook Slider, Drop 02 Hover Flip Grid, and PDP Morph & Turn Stage.

function svgToDataUrl(svgString: string): string {
  const cleaned = svgString.trim().replace(/\s+/g, ' ');
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

// Shared studio model anatomy (Front View)
function getModelFrontAnatomy(includeBaseShirt = true): string {
  return `
    <g id="model-front-body">
      <ellipse cx="400" cy="955" rx="145" ry="18" fill="rgba(0,0,0,0.08)" />
      <path d="M278 710 L522 710 L538 960 L414 960 L400 815 L386 960 L262 960 Z" fill="#121316" />
      <path d="M278 710 L400 725 L400 815 L386 960 L262 960 Z" fill="url(#pantsLeftGrad)" />
      <path d="M400 725 L522 710 L538 960 L414 960 L400 815 Z" fill="url(#pantsRightGrad)" />
      <line x1="400" y1="720" x2="400" y2="808" stroke="#26282E" stroke-width="2" />
      <path d="M268 835 L335 842 L335 935 L264 930 Z" fill="#17191D" stroke="#282B32" stroke-width="1.5" />
      <path d="M532 835 L465 842 L465 935 L536 930 Z" fill="#15171B" stroke="#282B32" stroke-width="1.5" />
      <g id="hand-left">
        <path d="M182 708 C176 735, 178 768, 186 786 C192 798, 208 802, 216 792 C224 780, 224 756, 220 738 L216 708 Z" fill="url(#skinGrad)" />
        <path d="M214 745 C222 752, 226 768, 220 778" stroke="#5A3E2E" stroke-width="1.8" fill="none" opacity="0.55" />
        <path d="M192 762 L195 790 M202 764 L205 791" stroke="#5A3E2E" stroke-width="1.4" opacity="0.45" />
      </g>
      <g id="hand-right">
        <path d="M618 708 C624 735, 622 768, 614 786 C608 798, 592 802, 584 792 C576 780, 576 756, 580 738 L584 708 Z" fill="url(#skinGrad)" />
        <path d="M586 745 C578 752, 574 768, 580 778" stroke="#5A3E2E" stroke-width="1.8" fill="none" opacity="0.55" />
        <path d="M608 762 L605 790 M598 764 L595 791" stroke="#5A3E2E" stroke-width="1.4" opacity="0.45" />
      </g>
      ${
        includeBaseShirt
          ? `
      <path d="M235 280 C205 395, 192 545, 182 715 L222 715 C235 565, 255 430, 272 325 Z" fill="url(#skinGrad)" />
      <path d="M565 280 C595 395, 608 545, 618 715 L578 715 C565 565, 545 430, 528 325 Z" fill="url(#skinGrad)" />
      <path d="M265 252 C310 245, 355 242, 400 242 C445 242, 490 245, 535 252 L555 315 L522 714 L278 714 L245 315 Z" fill="#18191C" />
      <path d="M265 252 Q400 272 535 252" fill="none" stroke="#2A2C32" stroke-width="2" />
      <text x="400" y="345" text-anchor="middle" fill="#3A3D45" font-family="Inter, sans-serif" font-size="10" font-weight="700" letter-spacing="4">NOCTA BASE // 00</text>
      `
          : ''
      }
      <path d="M362 178 L354 246 C375 262, 425 262, 446 246 L438 178 Z" fill="url(#neckGrad)" />
      <path d="M363 185 Q400 216 437 185 L439 202 Q400 228 361 202 Z" fill="rgba(25, 15, 10, 0.36)" />
      <path d="M358 242 Q382 252 395 248 M442 242 Q418 252 405 248" stroke="rgba(255,255,255,0.14)" stroke-width="2" fill="none" />
      <path d="M342 118 C334 118, 332 142, 344 148 Z" fill="#7D5A46" />
      <path d="M458 118 C466 118, 468 142, 456 148 Z" fill="#6E4E3B" />
      <path d="M344 92 C344 52, 456 52, 456 92 C458 132, 452 162, 434 184 C418 200, 410 203, 400 203 C390 203, 382 200, 366 184 C348 162, 342 132, 344 92 Z" fill="url(#faceGrad)" />
      <path d="M344 98 C343 55, 457 55, 456 98 C452 82, 434 74, 400 74 C366 74, 348 82, 344 98 Z" fill="#181514" />
      <path d="M344 98 C345 62, 455 62, 456 98" fill="none" stroke="#181514" stroke-width="3" opacity="0.6" />
      <path d="M362 112 Q376 108 389 113" stroke="#1E1917" stroke-width="3.2" stroke-linecap="round" fill="none" />
      <path d="M438 112 Q424 108 411 113" stroke="#1E1917" stroke-width="3.2" stroke-linecap="round" fill="none" />
      <ellipse cx="376" cy="122" rx="6.5" ry="2.8" fill="#1E1917" />
      <ellipse cx="424" cy="122" rx="6.5" ry="2.8" fill="#1E1917" />
      <circle cx="375" cy="121.5" r="1" fill="#FFFFFF" opacity="0.7" />
      <circle cx="423" cy="121.5" r="1" fill="#FFFFFF" opacity="0.7" />
      <path d="M400 116 L398 146 L406 149" stroke="#5A3E2E" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.75" />
      <path d="M393 150 Q400 154 407 150" stroke="#4D3325" stroke-width="2" fill="none" opacity="0.7" />
      <path d="M384 167 Q400 164 416 167" stroke="#4A2F23" stroke-width="2.2" fill="none" />
      <path d="M387 168 Q400 175 413 168" fill="rgba(74, 47, 35, 0.35)" />
      <path d="M353 128 Q356 152 370 172" stroke="rgba(255,255,255,0.16)" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </g>
  `;
}

function getModelBackAnatomy(): string {
  return `
    <g id="model-back-body">
      <ellipse cx="400" cy="955" rx="145" ry="18" fill="rgba(0,0,0,0.08)" />
      <path d="M278 710 L522 710 L538 960 L414 960 L400 822 L386 960 L262 960 Z" fill="#121316" />
      <path d="M278 710 L400 725 L400 822 L386 960 L262 960 Z" fill="url(#pantsLeftGrad)" />
      <path d="M400 725 L522 710 L538 960 L414 960 L400 822 Z" fill="url(#pantsRightGrad)" />
      <line x1="400" y1="715" x2="400" y2="822" stroke="#26282E" stroke-width="2.2" />
      <rect x="305" y="752" width="68" height="10" rx="2" fill="#1C1E24" stroke="#2B2E37" stroke-width="1" />
      <rect x="427" y="752" width="68" height="10" rx="2" fill="#1C1E24" stroke="#2B2E37" stroke-width="1" />
      <path d="M268 835 L335 842 L335 935 L264 930 Z" fill="#17191D" stroke="#282B32" stroke-width="1.5" />
      <path d="M532 835 L465 842 L465 935 L536 930 Z" fill="#15171B" stroke="#282B32" stroke-width="1.5" />
      <path d="M182 708 C176 735, 178 768, 186 786 C192 798, 208 802, 216 792 C224 780, 224 756, 220 738 L216 708 Z" fill="url(#skinGrad)" />
      <path d="M618 708 C624 735, 622 768, 614 786 C608 798, 592 802, 584 792 C576 780, 576 756, 580 738 L584 708 Z" fill="url(#skinGrad)" />
      <path d="M358 170 L350 245 L450 245 L442 170 Z" fill="url(#neckGrad)" />
      <path d="M342 118 C334 118, 332 142, 344 148 Z" fill="#7D5A46" />
      <path d="M458 118 C466 118, 468 142, 456 148 Z" fill="#6E4E3B" />
      <path d="M344 92 C344 52, 456 52, 456 92 C458 134, 448 168, 438 182 L362 182 C352 168, 342 134, 344 92 Z" fill="url(#faceGrad)" />
      <path d="M344 96 C344 52, 456 52, 456 96 C457 128, 450 148, 442 156 C420 162, 380 162, 358 156 C350 148, 343 128, 344 96 Z" fill="url(#hairFadeGrad)" />
      <line x1="400" y1="168" x2="400" y2="225" stroke="rgba(40,22,12,0.25)" stroke-width="3" stroke-linecap="round" />
    </g>
  `;
}

const SHARED_MODEL_DEFS = `
  <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#9A725A" />
    <stop offset="55%" stop-color="#825C46" />
    <stop offset="100%" stop-color="#644432" />
  </linearGradient>
  <linearGradient id="faceGrad" x1="15%" y1="10%" x2="85%" y2="90%">
    <stop offset="0%" stop-color="#A47B63" />
    <stop offset="50%" stop-color="#88614A" />
    <stop offset="100%" stop-color="#694836" />
  </linearGradient>
  <linearGradient id="neckGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#6D4B38" />
    <stop offset="45%" stop-color="#8B644D" />
    <stop offset="100%" stop-color="#5E3F2E" />
  </linearGradient>
  <linearGradient id="hairFadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#141211" />
    <stop offset="68%" stop-color="#221D1A" />
    <stop offset="100%" stop-color="#7D5A46" />
  </linearGradient>
  <linearGradient id="pantsLeftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#1E2026" />
    <stop offset="100%" stop-color="#101114" />
  </linearGradient>
  <linearGradient id="pantsRightGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#0E0F12" />
    <stop offset="100%" stop-color="#1B1D22" />
  </linearGradient>
  <filter id="garmentDropShadow" x="-12%" y="-10%" width="124%" height="124%">
    <feDropShadow dx="0" dy="14" stdDeviation="14" flood-color="#000000" flood-opacity="0.16" />
  </filter>
`;

function noctaStars(cx: number, cy: number, scale = 1, color = '#FFFFFF'): string {
  return `
    <g transform="translate(${cx}, ${cy}) scale(${scale})">
      <path d="M0 -14 L3 -3 L14 0 L3 3 L0 14 L-3 3 L-14 0 L-3 -3 Z" fill="${color}" />
      <path d="M-16 8 L-14 14 L-8 16 L-14 18 L-16 24 L-18 18 L-24 16 L-18 14 Z" fill="${color}" />
      <path d="M16 8 L18 14 L24 16 L18 18 L16 24 L14 18 L8 16 L14 14 Z" fill="${color}" />
    </g>
  `;
}

// ============================================================================
// PIPED HOODIE BLACK YELLOW
// ============================================================================
function pipedHoodieBlackYellowGarment(view: 'front' | 'back', isGhostCutout: boolean): string {
  const defs = `
    <linearGradient id="hoodieBlackGrad" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#23252A" />
      <stop offset="45%" stop-color="#141518" />
      <stop offset="85%" stop-color="#0D0E10" />
      <stop offset="100%" stop-color="#08090A" />
    </linearGradient>
    <linearGradient id="hoodieSleeveShade" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1A1B1E" />
      <stop offset="100%" stop-color="#0C0D0F" />
    </linearGradient>
  `;

  return `
    <defs>${defs}</defs>
    <g filter="url(#garmentDropShadow)">
      ${
        isGhostCutout && view === 'front'
          ? `<path d="M368 215 Q400 245 432 215 L428 265 Q400 280 372 265 Z" fill="#0E0F12" />`
          : ''
      }
      <path d="
        M295 238 C260 248, 218 268, 185 305 C158 338, 145 408, 140 510
        C136 588, 140 650, 148 698 L208 702 C218 632, 228 558, 238 452
        L240 735 C320 750, 480 750, 560 735 L562 452 C572 558, 582 632, 592 702
        L652 698 C660 650, 664 588, 660 510 C655 408, 642 338, 615 305
        C582 268, 540 248, 505 238 Q400 260 295 238 Z
      " fill="url(#hoodieBlackGrad)" />
      <path d="M295 238 C260 248, 218 268, 185 305 L140 510 L208 510 C218 415, 248 320, 295 275 Z" fill="url(#hoodieSleeveShade)" />
      <path d="M505 238 C540 248, 582 268, 615 305 L660 510 L592 510 C582 415, 552 320, 505 275 Z" fill="url(#hoodieSleeveShade)" />
      <path d="M290 240 C258 250, 215 270, 182 307" fill="none" stroke="#FACC15" stroke-width="3.5" stroke-linecap="round" />
      <path d="M510 240 C542 250, 585 270, 618 307" fill="none" stroke="#FACC15" stroke-width="3.5" stroke-linecap="round" />
      <path d="M305 535 L305 670 Q400 680 495 670 L495 535 Q400 525 305 535 Z" fill="none" stroke="#FACC15" stroke-width="2.2" />
      <line x1="400" y1="528" x2="400" y2="682" stroke="#FACC15" stroke-width="1.5" />
      <path d="M295 238 C296 195, 312 158, 340 138 C362 121, 390 115, 400 115 C410 115, 438 121, 460 138 C488 158, 504 195, 505 238 Q400 258 295 238 Z" fill="url(#hoodieBlackGrad)" />
      <path d="M300 240 C302 194, 316 156, 342 136 C363 119, 392 114, 400 114 C408 114, 437 119, 458 136 C484 156, 498 194, 500 240" fill="none" stroke="#FACC15" stroke-width="2" opacity="0.55" />
      ${
        view === 'front'
          ? `
        <path d="M306 537 L306 668 Q400 678 494 668 L494 537 Q400 527 306 537 Z" fill="#111316" opacity="0.85" />
        ${noctaStars(355, 295, 0.65, '#FACC15')}
        <text x="432" y="304" text-anchor="middle" fill="#FACC15" font-family="Inter, sans-serif" font-size="9.5" font-weight="900" letter-spacing="2">NOCTA</text>
        <path d="M240 728 L560 728 L558 752 L242 752 Z" fill="#111316" />
        <path d="M148 694 L208 698 L210 720 L146 716 Z" fill="#111316" />
        <path d="M652 694 L592 698 L590 720 L654 716 Z" fill="#111316" />
      `
          : `
        <circle cx="400" cy="435" r="58" fill="rgba(17,17,17,0.2)" stroke="#FACC15" stroke-width="1.5" />
        ${noctaStars(400, 425, 1.9, '#FACC15')}
        <text x="400" y="520" text-anchor="middle" fill="#FACC15" font-family="Inter, sans-serif" font-size="11.5" font-weight="900" letter-spacing="5">DEEP TRIP // 02</text>
        <path d="M240 728 L560 728 L558 752 L242 752 Z" fill="#111316" />
        <path d="M148 694 L208 698 L210 720 L146 716 Z" fill="#111316" />
        <path d="M652 694 L592 698 L590 720 L654 716 Z" fill="#111316" />
      `
      }
    </g>
  `;
}

// ============================================================================
// HALF-ZIP CAMO ANORAK
// ============================================================================
function halfZipCamoGarment(view: 'front' | 'back', isGhostCutout: boolean): string {
  const defs = `
    <linearGradient id="anorakBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3D4A36" />
      <stop offset="45%" stop-color="#2E3A28" />
      <stop offset="100%" stop-color="#1E2A1A" />
    </linearGradient>
  `;
  return `
    <defs>${defs}</defs>
    <g filter="url(#garmentDropShadow)">
      ${isGhostCutout && view === 'front' ? `<path d="M368 218 Q400 248 432 218 L428 265 Q400 282 372 265 Z" fill="#1E2A1A" />` : ''}
      <path d="M300 238 C262 248, 220 268, 188 308 C162 342, 148 415, 144 512 C140 592, 144 652, 152 702 L212 706 C222 634, 232 558, 242 452 L244 738 C322 754, 478 754, 556 738 L558 452 C568 558, 578 634, 588 706 L648 702 C656 652, 660 592, 656 512 C652 415, 638 342, 612 308 C580 268, 538 248, 500 238 Q400 258 300 238 Z" fill="url(#anorakBase)" />
      <ellipse cx="340" cy="310" rx="32" ry="22" fill="#253020" opacity="0.7" />
      <ellipse cx="460" cy="310" rx="28" ry="18" fill="#1A2518" opacity="0.6" />
      <ellipse cx="390" cy="420" rx="40" ry="25" fill="#2E3A28" opacity="0.5" />
      <ellipse cx="310" cy="530" rx="28" ry="18" fill="#1E2A1A" opacity="0.65" />
      <ellipse cx="490" cy="530" rx="32" ry="20" fill="#253020" opacity="0.55" />
      <path d="M340 235 Q400 260 460 235 L455 295 Q400 315 345 295 Z" fill="#253020" />
      <line x1="400" y1="240" x2="400" y2="298" stroke="#1A1A1A" stroke-width="4" />
      <rect x="395" y="244" width="10" height="20" rx="2" fill="#111" stroke="#555" stroke-width="0.5" />
      ${
        view === 'front'
          ? `${noctaStars(350, 305, 0.62, '#4ADE80')}<text x="432" y="315" text-anchor="middle" fill="#4ADE80" font-family="Inter, sans-serif" font-size="9" font-weight="900" letter-spacing="2">CAMO</text><rect x="425" y="330" width="65" height="52" rx="3" fill="#1A2518" stroke="#2E3A28" stroke-width="1.5" />`
          : `${noctaStars(400, 415, 1.8, '#4ADE80')}<text x="400" y="505" text-anchor="middle" fill="#4ADE80" font-family="Inter, sans-serif" font-size="11" font-weight="900" letter-spacing="4">ARCHIVE // 02</text>`
      }
    </g>
  `;
}

// ============================================================================
// GLACIER BLUE ANORAK HOODIE
// ============================================================================
function glacierBlueAnorakGarment(view: 'front' | 'back', isGhostCutout: boolean): string {
  const defs = `
    <linearGradient id="glacierBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7EC8E3" />
      <stop offset="45%" stop-color="#5EB1D8" />
      <stop offset="100%" stop-color="#3A92BE" />
    </linearGradient>
  `;
  return `
    <defs>${defs}</defs>
    <g filter="url(#garmentDropShadow)">
      ${isGhostCutout && view === 'front' ? `<path d="M368 215 Q400 244 432 215 L428 264 Q400 280 372 264 Z" fill="#3A92BE" />` : ''}
      <path d="M295 238 C258 248, 215 268, 182 306 C155 340, 142 412, 138 512 C134 590, 138 652, 146 700 L206 704 C216 632, 226 556, 236 450 L238 736 C318 752, 482 752, 562 736 L564 450 C574 556, 584 632, 594 704 L654 700 C662 652, 666 590, 662 512 C658 412, 645 340, 618 306 C585 268, 542 248, 505 238 Q400 258 295 238 Z" fill="url(#glacierBody)" />
      <path d="M290 240 C258 250, 215 270, 182 308" fill="none" stroke="#111111" stroke-width="4" stroke-linecap="round" />
      <path d="M510 240 C542 250, 585 270, 618 308" fill="none" stroke="#111111" stroke-width="4" stroke-linecap="round" />
      <path d="M295 238 C296 192, 312 154, 340 134 C362 117, 390 112, 400 112 C410 112, 438 117, 460 134 C488 154, 504 192, 505 238 Q400 256 295 238 Z" fill="url(#glacierBody)" />
      <path d="M306 535 L306 668 Q400 678 494 668 L494 535 Q400 525 306 535 Z" fill="#4FA0C8" opacity="0.85" stroke="#111111" stroke-width="1.8" />
      ${
        view === 'front'
          ? `${noctaStars(352, 292, 0.64, '#111111')}<text x="432" y="302" text-anchor="middle" fill="#111111" font-family="Inter, sans-serif" font-size="9.5" font-weight="900" letter-spacing="2">NOCTA</text><path d="M238 728 L562 728 L560 750 L240 750 Z" fill="#4FA0C8" />`
          : `<circle cx="400" cy="432" r="56" fill="rgba(17,17,17,0.15)" stroke="#111111" stroke-width="2" />${noctaStars(400, 422, 1.85, '#111111')}<text x="400" y="518" text-anchor="middle" fill="#111111" font-family="Inter, sans-serif" font-size="11" font-weight="900" letter-spacing="5">GLACIER // 02</text><path d="M238 728 L562 728 L560 750 L240 750 Z" fill="#4FA0C8" />`
      }
    </g>
  `;
}

// ============================================================================
// CARDINAL STOCK HOODIE
// ============================================================================
function cardinalStockHoodieGarment(view: 'front' | 'back', isGhostCutout: boolean): string {
  const defs = `
    <linearGradient id="cardinalBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1F24" />
      <stop offset="50%" stop-color="#121316" />
      <stop offset="100%" stop-color="#0A0B0D" />
    </linearGradient>
  `;
  return `
    <defs>${defs}</defs>
    <g filter="url(#garmentDropShadow)">
      ${isGhostCutout && view === 'front' ? `<path d="M368 215 Q400 244 432 215 L428 264 Q400 280 372 264 Z" fill="#0A0B0D" />` : ''}
      <path d="M295 238 C258 248, 215 268, 182 306 C155 340, 142 412, 138 512 C134 590, 138 652, 146 700 L206 704 C216 632, 226 556, 236 450 L238 736 C318 752, 482 752, 562 736 L564 450 C574 556, 584 632, 594 704 L654 700 C662 652, 666 590, 662 512 C658 412, 645 340, 618 306 C585 268, 542 248, 505 238 Q400 258 295 238 Z" fill="url(#cardinalBody)" />
      <path d="M295 238 C296 192, 312 154, 340 134 C362 117, 390 112, 400 112 C410 112, 438 117, 460 134 C488 154, 504 192, 505 238 Q400 256 295 238 Z" fill="url(#cardinalBody)" />
      <path d="M292 240 C259 250, 216 270, 183 308 L210 308 C238 278, 272 260, 305 252 Z" fill="#C41E3A" />
      <path d="M508 240 C541 250, 584 270, 617 308 L590 308 C562 278, 528 260, 495 252 Z" fill="#C41E3A" />
      <path d="M308 535 L308 668 Q400 678 492 668 L492 535 Q400 525 308 535 Z" fill="#0D0E11" stroke="#C41E3A" stroke-width="1.5" />
      <line x1="400" y1="528" x2="400" y2="680" stroke="#C41E3A" stroke-width="1.5" />
      ${
        view === 'front'
          ? `${noctaStars(352, 292, 0.64, '#C41E3A')}<text x="432" y="302" text-anchor="middle" fill="#C41E3A" font-family="Inter, sans-serif" font-size="9.5" font-weight="900" letter-spacing="2">NOCTA</text><path d="M238 728 L562 728 L560 750 L240 750 Z" fill="#0D0E11" />`
          : `<circle cx="400" cy="432" r="56" fill="rgba(196,30,58,0.15)" stroke="#C41E3A" stroke-width="2" />${noctaStars(400, 422, 1.85, '#C41E3A')}<text x="400" y="518" text-anchor="middle" fill="#C41E3A" font-family="Inter, sans-serif" font-size="11" font-weight="900" letter-spacing="4">CARDINAL // 02</text><path d="M238 728 L562 728 L560 750 L240 750 Z" fill="#0D0E11" />`
      }
    </g>
  `;
}

// ============================================================================
// GRAPHIC TACTICAL TEE
// ============================================================================
function graphicTacticalTeeGarment(view: 'front' | 'back', isGhostCutout: boolean): string {
  const defs = `
    <linearGradient id="teeBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1D1F24" />
      <stop offset="50%" stop-color="#14151A" />
      <stop offset="100%" stop-color="#0D0E12" />
    </linearGradient>
  `;
  return `
    <defs>${defs}</defs>
    <g filter="url(#garmentDropShadow)">
      ${isGhostCutout && view === 'front' ? `<path d="M372 220 Q400 246 428 220 L424 262 Q400 278 376 262 Z" fill="#0D0E12" />` : ''}
      <path d="M305 248 C272 255, 235 270, 205 302 C188 320, 180 345, 178 378 L192 378 C194 350, 206 326, 222 310 L228 715 L572 715 L578 310 C594 326, 606 350, 608 378 L622 378 C620 345, 612 320, 595 302 C565 270, 528 255, 495 248 Q400 264 305 248 Z" fill="url(#teeBodyGrad)" />
      <path d="M346 235 Q400 258 454 235 L454 258 Q400 278 346 258 Z" fill="#111318" />
      <path d="M346 237 Q400 260 454 237" fill="none" stroke="#22242A" stroke-width="2" />
      ${
        view === 'front'
          ? `${noctaStars(362, 302, 0.72, '#F59E0B')}<text x="438" y="312" text-anchor="middle" fill="#FFFFFF" font-family="Inter, sans-serif" font-size="10" font-weight="900" letter-spacing="2.5">NOCTA</text><path d="M302 250 C272 258, 234 273, 205 304" fill="none" stroke="#1D4ED8" stroke-width="3.5" stroke-linecap="round" /><path d="M498 250 C528 258, 566 273, 595 304" fill="none" stroke="#1D4ED8" stroke-width="3.5" stroke-linecap="round" /><path d="M228 706 L572 706 L570 724 L230 724 Z" fill="#111318" />`
          : `<rect x="296" y="295" width="208" height="260" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" /><circle cx="400" cy="405" r="68" fill="none" stroke="#FFFFFF" stroke-width="1.8" /><circle cx="400" cy="405" r="42" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1" stroke-dasharray="4 4" /><line x1="316" y1="405" x2="484" y2="405" stroke="rgba(255,255,255,0.35)" stroke-width="1" /><line x1="400" y1="321" x2="400" y2="489" stroke="rgba(255,255,255,0.35)" stroke-width="1" />${noctaStars(400, 398, 1.55, '#F59E0B')}<text x="400" y="512" text-anchor="middle" fill="#FFFFFF" font-family="Inter, sans-serif" font-size="15" font-weight="900" letter-spacing="6">DROP 02 // SYS</text><text x="400" y="534" text-anchor="middle" fill="#F59E0B" font-family="JetBrains Mono, monospace" font-size="8.5" font-weight="600" letter-spacing="3">NOCTURNAL CALIBRATION UNIT</text><path d="M228 706 L572 706 L570 724 L230 724 Z" fill="#111318" />`
      }
    </g>
  `;
}

function buildStudioSvg(innerContent: string): string {
  return svgToDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" fill="none">
      <defs>${SHARED_MODEL_DEFS}</defs>
      ${innerContent}
    </svg>
  `);
}

function buildCompositeModelView(
  garmentFn: (view: 'front' | 'back', isGhostCutout: boolean) => string,
  view: 'front' | 'back',
  exposeForearms = false
): string {
  const modelBase = view === 'front' ? getModelFrontAnatomy(exposeForearms) : getModelBackAnatomy();
  const garment = garmentFn(view, false);
  return buildStudioSvg(`${modelBase}${garment}`);
}

export const DEFAULT_BASE_MODEL_URL = '/cutouts/base-model-men-top.png?v=8';
export const DEFAULT_SHIRTLESS_BASE_MODEL_URL = '/cutouts/base-model-men-shirtless.png?v=8';
export const DEFAULT_FEMALE_BASE_MODEL_URL = '/cutouts/base-model-women-top.png?v=8';
/** Fallback until user drops /cutouts/default-black-joggers-front.png etc. */
export const DEFAULT_BLACK_JOGGERS_FRONT_URL = '/cutouts/default-black-joggers-front.png?v=8';
export const DEFAULT_BLACK_JOGGERS_SIDE_URL = '/cutouts/default-black-joggers-side.png?v=8';
export const DEFAULT_BLACK_JOGGERS_BACK_URL = '/cutouts/default-black-joggers-back.png?v=8';

export const GARMENT_VISUAL_ASSETS = {
  pipedHoodie: {
    frontCutoutUrl: buildStudioSvg(pipedHoodieBlackYellowGarment('front', true)),
    backCutoutUrl: buildStudioSvg(pipedHoodieBlackYellowGarment('back', true)),
    modelFrontUrl: buildCompositeModelView(pipedHoodieBlackYellowGarment, 'front', false),
    modelBackUrl: buildCompositeModelView(pipedHoodieBlackYellowGarment, 'back', false),
  },
  halfZipCamo: {
    frontCutoutUrl: buildStudioSvg(halfZipCamoGarment('front', true)),
    backCutoutUrl: buildStudioSvg(halfZipCamoGarment('back', true)),
    modelFrontUrl: buildCompositeModelView(halfZipCamoGarment, 'front', false),
    modelBackUrl: buildCompositeModelView(halfZipCamoGarment, 'back', false),
  },
  glacierAnorak: {
    frontCutoutUrl: buildStudioSvg(glacierBlueAnorakGarment('front', true)),
    backCutoutUrl: buildStudioSvg(glacierBlueAnorakGarment('back', true)),
    modelFrontUrl: buildCompositeModelView(glacierBlueAnorakGarment, 'front', false),
    modelBackUrl: buildCompositeModelView(glacierBlueAnorakGarment, 'back', false),
  },
  cardinalHoodie: {
    frontCutoutUrl: buildStudioSvg(cardinalStockHoodieGarment('front', true)),
    backCutoutUrl: buildStudioSvg(cardinalStockHoodieGarment('back', true)),
    modelFrontUrl: buildCompositeModelView(cardinalStockHoodieGarment, 'front', false),
    modelBackUrl: buildCompositeModelView(cardinalStockHoodieGarment, 'back', false),
  },
  tacticalTee: {
    frontCutoutUrl: buildStudioSvg(graphicTacticalTeeGarment('front', true)),
    backCutoutUrl: buildStudioSvg(graphicTacticalTeeGarment('back', true)),
    modelFrontUrl: buildCompositeModelView(graphicTacticalTeeGarment, 'front', true),
    modelBackUrl: buildCompositeModelView(graphicTacticalTeeGarment, 'back', true),
  },
};
