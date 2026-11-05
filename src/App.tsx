import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { LookbookSection } from './components/LookbookSection';
import { CategorySplitSection } from './components/CategorySplitSection';
import { DropGridSection } from './components/DropGridSection';
import { ProductDetailPage } from './components/ProductDetailPage';
import { AdminCalibrationStudio } from './components/AdminCalibrationStudio';
import { ClientAdminPortalModal } from './components/ClientAdminPortalModal';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { Footer } from './components/Footer';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class StoreErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Storefront unhandled error caught by ErrorBoundary:', error, errorInfo);
  }

  handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080A] text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full border border-white/15 bg-white/5 p-8 rounded-2xl backdrop-blur-md">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono-tech uppercase tracking-[0.25em] text-amber-400 mb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              NOCTA STUDIO // SYSTEM RECOVERY
            </div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-white">
              Studio Cache Re-alignment
            </h1>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              A previous session cache mismatch was detected. Click below to refresh and load the pristine Drop 02 storefront.
            </p>
            {this.state.error?.message && (
              <pre className="mt-4 p-3 bg-black/60 rounded text-[10px] font-mono-tech text-red-400 overflow-x-auto text-left whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="w-full bg-white text-black text-xs uppercase tracking-widest font-bold py-3 hover:bg-neutral-200 transition cursor-pointer rounded-full"
              >
                Reset Cache &amp; Open Storefront
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full border border-white/20 text-white text-xs uppercase tracking-widest font-medium py-2.5 hover:border-white transition cursor-pointer rounded-full"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const StorefrontContent: React.FC = () => {
  const { activeView } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF] text-[#0A0A0A]">
      <Navbar />

      <main className="flex-1">
        {activeView === 'home' ? (
          <>
            <HeroBanner />
            <LookbookSection />
            <CategorySplitSection />
            <DropGridSection />
          </>
        ) : (
          <ProductDetailPage />
        )}
      </main>

      <Footer />

      {/* Overlays, Modals & Built-In Admin Cutout Calibration Studio */}
      <AdminCalibrationStudio />
      <ClientAdminPortalModal />
      <CartDrawer />
      <SearchModal />
      <SizeGuideModal />
    </div>
  );
};

export function App() {
  return (
    <StoreErrorBoundary>
      <StoreProvider>
        <StorefrontContent />
      </StoreProvider>
    </StoreErrorBoundary>
  );
}

export default App;
