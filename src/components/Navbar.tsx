import React, { useState } from 'react';
import { Search, User, ShoppingBag, Settings, Menu, X, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Navbar: React.FC = () => {
  const {
    activeView,
    backToStore,
    selectGenderAndCategory,
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
    isAdminAuthenticated,
    setIsAdminPortalOpen,
    isCalibrateMode,
    setIsCalibrateMode,
    setCalibrationTargetMode,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId?: string) => {
    setMobileMenuOpen(false);
    backToStore(sectionId);
  };

  const handleCategoryJump = (gender: 'men' | 'women', catId: string) => {
    setMobileMenuOpen(false);
    selectGenderAndCategory(gender, catId);
    backToStore('lookbook');
  };

  const handleToggleCalibrate = () => {
    const nextState = !isCalibrateMode;
    setIsCalibrateMode(nextState);
    if (nextState) {
      setCalibrationTargetMode(activeView === 'pdp' ? 'pdp' : 'lookbook');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-neutral-100 transition-colors">
      <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
        {/* Left: Organized Category Links */}
        <div className="flex items-center gap-6 lg:gap-7">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 -ml-1.5 text-neutral-900 hover:text-neutral-500 transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <nav className="hidden md:flex items-center gap-5 lg:gap-6">
            <button
              type="button"
              onClick={() => handleCategoryJump('men', 'HOODIES')}
              className="text-xs uppercase tracking-widest font-medium text-[#0A0A0A] hover:text-neutral-500 transition cursor-pointer"
            >
              Hoodies
            </button>
            <button
              type="button"
              onClick={() => handleCategoryJump('men', 'TSHIRTS')}
              className="text-xs uppercase tracking-widest font-medium text-[#0A0A0A] hover:text-neutral-500 transition cursor-pointer"
            >
              T-Shirts
            </button>
            <button
              type="button"
              onClick={() => handleCategoryJump('men', 'PANTS')}
              className="text-xs uppercase tracking-widest font-medium text-[#0A0A0A] hover:text-neutral-500 transition cursor-pointer"
            >
              Pants
            </button>
            <button
              type="button"
              onClick={() => handleCategoryJump('women', 'HOODIES')}
              className="text-xs uppercase tracking-widest font-medium text-[#0A0A0A] hover:text-neutral-500 transition cursor-pointer"
            >
              Girl Style
            </button>
            <button
              type="button"
              onClick={() => handleCategoryJump('men', 'SHOES')}
              className="text-xs uppercase tracking-widest font-medium text-[#0A0A0A] hover:text-neutral-500 transition cursor-pointer"
            >
              Shoes
            </button>
          </nav>
        </div>

        {/* Center: Minimalist Geometric Brand Emblem / Logo */}
        <button
          type="button"
          onClick={() => handleNavClick()}
          className="group flex items-center gap-2.5 cursor-pointer focus:outline-none"
        >
          <svg
            className="w-5 h-5 text-[#0A0A0A] transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 32 32"
            fill="none"
          >
            <path
              d="M16 2L18.2 11.8L28 14L18.2 16.2L16 26L13.8 16.2L4 14L13.8 11.8L16 2Z"
              fill="currentColor"
            />
            <circle cx="8" cy="24" r="1.8" fill="currentColor" />
            <circle cx="24" cy="24" r="1.8" fill="currentColor" />
          </svg>
          <span className="font-display text-sm sm:text-base font-bold tracking-[0.22em] uppercase text-[#0A0A0A]">
            NOCTA <span className="font-light text-neutral-300">/</span> STUDIO
          </span>
        </button>

        {/* Right: Search, Client Admin Login/Portal, Cart Badge & Protected Calibrate Mode */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-[#0A0A0A] hover:text-neutral-500 transition cursor-pointer"
            aria-label="Search Catalog"
            title="Search Catalog"
          >
            <Search className="w-4 h-4 stroke-[1.75]" />
          </button>

          {/* Client Admin Account / Upload Portal Trigger */}
          <button
            type="button"
            onClick={() => setIsAdminPortalOpen(true)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-mono-tech uppercase tracking-wider transition cursor-pointer border ${
              isAdminAuthenticated
                ? 'bg-emerald-950 text-white border-emerald-800'
                : 'bg-white text-[#0A0A0A] border-neutral-200 hover:border-black'
            }`}
            title="Client Admin Login & Product Upload Portal"
          >
            {isAdminAuthenticated ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Admin Studio</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 stroke-[1.75]" />
                <span className="hidden sm:inline">Client Login</span>
              </>
            )}
          </button>

          {/* Cart Drawer Trigger with Item Count Badge */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-[#0A0A0A] hover:text-neutral-500 transition cursor-pointer flex items-center gap-1.5"
            aria-label="Shopping Bag"
            title="Open Bag"
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.75]" />
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#0A0A0A] text-white text-[10px] font-mono-tech font-semibold leading-none">
              {cartCount}
            </span>
          </button>

          {/* ⚙️ Calibrate Mode Toggle Pill (Only visible to Authenticated Admin!) */}
          {isAdminAuthenticated && (
            <button
              type="button"
              onClick={handleToggleCalibrate}
              title="Toggle Admin Cutout Calibration Studio (Shift + C)"
              className={`ml-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-mono-tech tracking-wider uppercase transition-all cursor-pointer border ${
                isCalibrateMode
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-[0_0_0_3px_rgba(245,158,11,0.3)]'
                  : 'bg-neutral-50 text-[#0A0A0A] border-neutral-200 hover:border-black hover:bg-white'
              }`}
            >
              <Settings
                className={`w-3.5 h-3.5 ${
                  isCalibrateMode ? 'text-amber-400 animate-spin' : 'text-neutral-600'
                }`}
                style={{ animationDuration: '6s' }}
              />
              <span className="hidden lg:inline">Calibrate</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-6 py-5 space-y-3 shadow-lg">
          <button
            type="button"
            onClick={() => handleCategoryJump('men', 'HOODIES')}
            className="block w-full text-left text-xs uppercase tracking-widest font-semibold py-1.5 text-[#0A0A0A]"
          >
            Men // Hoodies
          </button>
          <button
            type="button"
            onClick={() => handleCategoryJump('men', 'TSHIRTS')}
            className="block w-full text-left text-xs uppercase tracking-widest font-semibold py-1.5 text-[#0A0A0A]"
          >
            Men // T-Shirts
          </button>
          <button
            type="button"
            onClick={() => handleCategoryJump('men', 'PANTS')}
            className="block w-full text-left text-xs uppercase tracking-widest font-semibold py-1.5 text-[#0A0A0A]"
          >
            Men // Pants (Shirtless Model)
          </button>
          <button
            type="button"
            onClick={() => handleCategoryJump('women', 'HOODIES')}
            className="block w-full text-left text-xs uppercase tracking-widest font-semibold py-1.5 text-[#0A0A0A]"
          >
            Girl Style // Hoodies &amp; Tees
          </button>
          <button
            type="button"
            onClick={() => handleCategoryJump('men', 'SHOES')}
            className="block w-full text-left text-xs uppercase tracking-widest font-semibold py-1.5 text-[#0A0A0A]"
          >
            Footwear // Sport Shoes
          </button>
        </div>
      )}
    </header>
  );
};
