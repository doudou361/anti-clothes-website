import React, { useState } from 'react';
import {
  X,
  Lock,
  Plus,
  Trash2,
  Upload,
  Layers,
  Sparkles,
  Copy,
  Check,
  Sliders,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { BaseModelPoseType, Product, SizeOption } from '../types/store';
import { DEFAULT_COORDS } from '../data/initialProducts';

/**
 * Automatically strips near-white (#FFFFFF) studio backgrounds in-browser
 * when the client uploads a JPG or non-transparent PNG directly from Gemini.
 */
function processUploadedFileToPngDataUrl(
  file: File,
  autoStripWhiteBg: boolean
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const srcDataUrl = reader.result as string;
      if (!autoStripWhiteBg) {
        resolve(srcDataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 1500;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(srcDataUrl);
          return;
        }
        // Fit proportionally inside 84% of 1200x1500
        const maxW = 1200 * 0.84;
        const maxH = 1500 * 0.84;
        const scale = Math.min(maxW / img.width, maxH / img.height);
        const dw = Math.round(img.width * scale);
        const dh = Math.round(img.height * scale);
        const dx = Math.floor((1200 - dw) / 2);
        const dy = Math.floor((1500 - dh) / 2);

        ctx.drawImage(img, dx, dy, dw, dh);
        const imgData = ctx.getImageData(0, 0, 1200, 1500);
        const data = imgData.data;

        // Strip near-white background pixels (R>242, G>242, B>242) connected to outer border
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 244 && g > 244 && b > 244) {
            data[i + 3] = 0;
          } else if (r > 234 && g > 234 && b > 234) {
            // Soft feather on near-white edge
            const avg = (r + g + b) / 3;
            data[i + 3] = Math.round(((245 - avg) / 11) * 255);
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(srcDataUrl);
      img.src = srcDataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ClientAdminPortalModal: React.FC = () => {
  const {
    isAdminAuthenticated,
    isAdminPortalOpen,
    setIsAdminPortalOpen,
    loginAdmin,
    logoutAdmin,
    products,
    categories,
    addCategory,
    deleteCategory,
    addCustomProduct,
    deleteProduct,
    updateProductStock,
    setIsCalibrateMode,
  } = useStore();

  // Login Form State
  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Dashboard Tab
  const [activeTab, setActiveTab] = useState<'upload' | 'inventory' | 'prompts'>('upload');

  // New Product Form State
  const [prodGender, setProdGender] = useState<'men' | 'women'>('men');
  const [prodCategory, setProdCategory] = useState<string>('HOODIES');
  const [prodTitle, setProdTitle] = useState('');
  const [prodSubtitle] = useState('520GSM Heavyweight Studio Capsule');
  const [prodCode, setProdCode] = useState('NCT-CUST-01');
  const [prodPrice, setProdPrice] = useState<number>(220);
  const [colorName, setColorName] = useState('Obsidian / Custom');
  const [colorHex, setColorHex] = useState('#141518');
  const [secondaryHex, setSecondaryHex] = useState('#FACC15');
  const [stockS, setStockS] = useState<number>(15);
  const [stockM, setStockM] = useState<number>(25);
  const [stockL, setStockL] = useState<number>(20);
  const [stockXL, setStockXL] = useState<number>(10);
  const [autoStripWhite, setAutoStripWhite] = useState<boolean>(true);

  const [frontUrl, setFrontUrl] = useState<string>('');
  const [backUrl, setBackUrl] = useState<string>('');
  const [modelFrontUrl, setModelFrontUrl] = useState<string>('');
  const [modelBackUrl, setModelBackUrl] = useState<string>('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');

  // New Category Form State
  const [newCatId, setNewCatId] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatGender, setNewCatGender] = useState<'men' | 'women'>('men');
  const [newCatModelType, setNewCatModelType] = useState<BaseModelPoseType>('male-torso');

  // Prompt Generator State
  const [promptType, setPromptType] = useState<
    'men-top' | 'men-pants' | 'women-top' | 'shoes'
  >('men-top');
  const [promptProductDesc, setPromptProductDesc] = useState(
    'heavyweight boxy pullover hoodie in Cobalt Blue with white seam piping and chest logo'
  );
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isAdminPortalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginAdmin(email, password);
    if (!ok) {
      setLoginError('Invalid credentials. Use admin / studio2026');
    } else {
      setLoginError('');
    }
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await processUploadedFileToPngDataUrl(file, autoStripWhite);
    setter(dataUrl);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim() || !frontUrl) {
      return;
    }
    const slug = `${prodTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const priceNum = Number(prodPrice) || 180;
    const newProduct: Product = {
      id: slug,
      code: prodCode.trim() || 'NCT-NEW-01',
      title: prodTitle.trim().toUpperCase(),
      shortTitle: prodTitle.trim().toUpperCase().slice(0, 22),
      subtitle: prodSubtitle.trim() || 'Custom Client Capsule Piece',
      price: priceNum,
      priceFormatted: `€${priceNum},00 EUR`,
      category: prodCategory,
      gender: prodGender,
      collection: prodGender === 'women' ? 'GIRL STYLE // CUSTOM' : 'DROP 02 // CUSTOM',
      narrative: `${prodTitle.trim()} — Custom studio release engineered for the NOCTA / STUDIO interactive lookbook.`,
      specs: [
        'Custom Client Brand Capsule Release',
        `Colorway: ${colorName}`,
        'Standardized 4:5 (1200x1500) transparent studio cutout alignment',
      ],
      sizingReference:
        prodGender === 'women'
          ? 'Female Model is 175cm and wears size S'
          : 'Model is 186cm and wears size M',
      colorways: [
        {
          id: `cw-${slug}`,
          name: colorName,
          hex: colorHex,
          secondaryHex,
          linkedProductId: slug,
        },
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      stockBySize: {
        S: Number(stockS) || 0,
        M: Number(stockM) || 0,
        L: Number(stockL) || 0,
        XL: Number(stockXL) || 0,
      },
      frontCutoutUrl: frontUrl,
      lookbookCutoutUrl: frontUrl,
      backCutoutUrl: backUrl || frontUrl,
      modelFrontUrl: modelFrontUrl || frontUrl,
      modelBackUrl: modelBackUrl || backUrl || frontUrl,
      calibration: {
        lookbook: { ...DEFAULT_COORDS },
        pdpSlide0: { ...DEFAULT_COORDS },
        pdpSlide1: { ...DEFAULT_COORDS },
        pdpSlide2: { ...DEFAULT_COORDS },
      },
    };

    addCustomProduct(newProduct);
    setUploadSuccessMsg(`"${newProduct.title}" added to ${prodGender.toUpperCase()} // ${prodCategory}!`);
    setProdTitle('');
    setFrontUrl('');
    setBackUrl('');
    setModelFrontUrl('');
    setModelBackUrl('');
    setTimeout(() => setUploadSuccessMsg(''), 4000);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId.trim() || !newCatLabel.trim()) return;
    addCategory({
      id: newCatId.trim().toUpperCase().replace(/\s+/g, '_'),
      label: newCatLabel.trim(),
      gender: newCatGender,
      baseModelType: newCatModelType,
    });
    setNewCatId('');
    setNewCatLabel('');
  };

  const generatedAiPrompt = (() => {
    if (promptType === 'men-top') {
      return `I am attaching two reference images:
1) base-model.jpg (the standing male studio model)
2) My physical product photo (${promptProductDesc})

Please generate 4 studio images on a pure solid #FFFFFF white background (4:5 vertical portrait ratio, no floor shadows):
1. product-front.jpg: Floating invisible-mannequin front view of my ${promptProductDesc} on a pure #FFFFFF white background (with the back collar tucked so it does not rise above the front neckline).
2. product-back.jpg: Floating invisible-mannequin rear (back) view of the exact same garment at the exact same scale on a pure #FFFFFF white background.
3. product-model-front.jpg: Edit base-model.jpg so this exact male model (keeping his exact head, hands, black pants, and head-to-calf framing) is wearing my ${promptProductDesc} on a pure #FFFFFF white background.
4. product-model-back.jpg: Rear view of the exact same male model from behind (head to mid-calf, same scale) wearing my ${promptProductDesc} on a pure #FFFFFF white background.`;
    }
    if (promptType === 'men-pants') {
      return `I am attaching two reference images:
1) base-model-shirtless.jpg (the standing shirtless athletic male model with defined chest and abs)
2) My physical pants photo (${promptProductDesc})

Please generate 4 studio images on a pure solid #FFFFFF white background (4:5 vertical portrait ratio):
1. pants-front.jpg: Floating ghost-mannequin front view of my ${promptProductDesc} on a pure #FFFFFF white background (no person).
2. pants-back.jpg: Floating ghost-mannequin rear (back) view of the exact same pants at the exact same scale on a pure #FFFFFF white background.
3. pants-model-front.jpg: Edit base-model-shirtless.jpg so this exact shirtless muscular male model (keeping his bare muscular chest/abs, face, arms, and head-to-calf framing) is wearing my ${promptProductDesc} on a pure #FFFFFF white background.
4. pants-model-back.jpg: Rear view of the exact same shirtless muscular male model from behind wearing my ${promptProductDesc} on a pure #FFFFFF white background.`;
    }
    if (promptType === 'women-top') {
      return `I am attaching two reference images:
1) base-model-female.jpg (the standing pretty female streetwear model)
2) My physical women's product photo (${promptProductDesc})

Please generate 4 studio images on a pure solid #FFFFFF white background (4:5 vertical portrait ratio):
1. girl-product-front.jpg: Floating invisible-mannequin front view of my ${promptProductDesc} on a pure #FFFFFF white background.
2. girl-product-back.jpg: Floating invisible-mannequin rear (back) view of the exact same garment at the exact same scale on a pure #FFFFFF white background.
3. girl-product-model-front.jpg: Edit base-model-female.jpg so this exact pretty female model (keeping her exact face, hair, hands, black pants, and head-to-calf framing) is wearing my ${promptProductDesc} on a pure #FFFFFF white background.
4. girl-product-model-back.jpg: Rear view of the exact same female model from behind wearing my ${promptProductDesc} on a pure #FFFFFF white background.`;
    }
    return `I am attaching my physical shoe/sneaker photo (${promptProductDesc}).
Please generate 4 studio angles of this EXACT SAME SHOE on a pure solid #FFFFFF white background (4:5 ratio, zero floor shadow, keeping identical materials, sole, and colors across all 4 shots):
1. shoe-front.jpg: Single shoe lateral side profile facing left, centered horizontally on a pure #FFFFFF white background.
2. shoe-back.jpg: 3/4 rear-lateral studio angle of the exact same shoe showing the heel counter and midsole at the exact same scale on a pure #FFFFFF white background.
3. shoe-model-front.jpg: 3/4 front-angled studio pair shot (two shoes side-by-side) of the exact same shoe on a pure #FFFFFF white background.
4. shoe-model-back.jpg: Dynamic floating two-shoe studio composition showing the top collar profile and the outsole tread pattern on a pure #FFFFFF white background.`;
  })();

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(generatedAiPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const genderCats = categories.filter((c) => c.gender === prodGender);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={() => setIsAdminPortalOpen(false)}
    >
      <div
        className="bg-white border border-neutral-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-[#0A0A0A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono-tech uppercase tracking-[0.2em] font-semibold">
              NOCTA // CLIENT ADMIN &amp; INVENTORY PORTAL
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAdminAuthenticated && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsCalibrateMode(true);
                    setIsAdminPortalOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono-tech uppercase tracking-wider bg-amber-400 text-black font-bold px-3 py-1 rounded-full hover:bg-amber-300 transition cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  Launch Calibration Sliders
                </button>
                <button
                  type="button"
                  onClick={logoutAdmin}
                  className="inline-flex items-center gap-1 text-[10px] font-mono-tech uppercase tracking-wider text-neutral-300 hover:text-white cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIsAdminPortalOpen(false)}
              className="text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =====================================================================
            VIEW 1: ADMIN LOGIN SCREEN (When Not Authenticated)
           ===================================================================== */}
        {!isAdminAuthenticated ? (
          <div className="p-8 max-w-md mx-auto">
            <div className="flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-neutral-400">
              <Lock className="w-3.5 h-3.5 text-black" />
              PROTECTED MERCHANT ACCESS
            </div>
            <h3 className="text-xl font-extrabold uppercase tracking-tight mt-2 text-[#0A0A0A]">
              Client Storefront Login
            </h3>
            <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
              Sign in to create new categories, upload product cutouts, manage colors &amp;
              sizes, and control warehouse storage stock. Regular visitors only see the public
              storefront.
            </p>

            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-[10px] font-mono-tech uppercase tracking-wider text-neutral-600 mb-1">
                  Admin Email or Username
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-neutral-300 px-3.5 py-2 text-xs focus:border-black focus:outline-none"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono-tech uppercase tracking-wider text-neutral-600 mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-neutral-300 px-3.5 py-2 text-xs focus:border-black focus:outline-none"
                  placeholder="Enter studio2026"
                />
              </div>

              {loginError && (
                <div className="text-xs text-red-600 font-medium">{loginError}</div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#0A0A0A] text-white text-xs uppercase tracking-widest font-bold py-2.5 hover:bg-neutral-800 transition cursor-pointer"
                >
                  Sign In to Admin Studio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin');
                    setPassword('studio2026');
                  }}
                  className="px-3 py-2.5 border border-neutral-300 text-[10px] font-mono-tech uppercase tracking-wider hover:border-black transition cursor-pointer"
                >
                  Auto-Fill Demo
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ===================================================================
              VIEW 2: AUTHENTICATED CLIENT STUDIO DASHBOARD
             =================================================================== */
          <div className="p-6">
            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 pb-4 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono-tech uppercase tracking-wider transition cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-[#0A0A0A] text-white font-bold'
                    : 'bg-neutral-100 text-neutral-600 hover:text-black'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                1. Upload New Product
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono-tech uppercase tracking-wider transition cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-[#0A0A0A] text-white font-bold'
                    : 'bg-neutral-100 text-neutral-600 hover:text-black'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                2. Categories &amp; Storage Stock ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('prompts')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono-tech uppercase tracking-wider transition cursor-pointer ${
                  activeTab === 'prompts'
                    ? 'bg-[#0A0A0A] text-white font-bold'
                    : 'bg-neutral-100 text-neutral-600 hover:text-black'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                3. AI Studio Prompt Generator
              </button>
            </div>

            {/* TAB 1: UPLOAD NEW PRODUCT */}
            {activeTab === 'upload' && (
              <form onSubmit={handleCreateProduct} className="space-y-6">
                {uploadSuccessMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold">
                    ✓ {uploadSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono-tech uppercase tracking-wider text-neutral-500 mb-1">
                      Target Model Division
                    </label>
                    <select
                      value={prodGender}
                      onChange={(e) => {
                        const g = e.target.value as 'men' | 'women';
                        setProdGender(g);
                        const firstCat = categories.find((c) => c.gender === g);
                        if (firstCat) setProdCategory(firstCat.id);
                      }}
                      className="w-full border border-neutral-300 px-3 py-2 text-xs font-semibold"
                    >
                      <option value="men">Men (Boys)</option>
                      <option value="women">Girl Style (Women)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono-tech uppercase tracking-wider text-neutral-500 mb-1">
                      Category Series
                    </label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full border border-neutral-300 px-3 py-2 text-xs font-semibold"
                    >
                      {genderCats.map((c) => (
                        <option key={`${c.gender}-${c.id}`} value={c.id}>
                          {c.label} ({c.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono-tech uppercase tracking-wider text-neutral-500 mb-1">
                      Price (EUR €)
                    </label>
                    <input
                      type="number"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full border border-neutral-300 px-3 py-2 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono-tech uppercase tracking-wider text-neutral-500 mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      placeholder="e.g. HEAVYWEIGHT PIPED HOODIE COBALT"
                      className="w-full border border-neutral-300 px-3 py-2 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono-tech uppercase tracking-wider text-neutral-500 mb-1">
                      SKU / Archive Code
                    </label>
                    <input
                      type="text"
                      value={prodCode}
                      onChange={(e) => setProdCode(e.target.value)}
                      className="w-full border border-neutral-300 px-3 py-2 text-xs font-mono-tech"
                    />
                  </div>
                </div>

                {/* Colorway & Warehouse Stock Per Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-neutral-50 border border-neutral-200">
                  <div>
                    <div className="text-[10px] font-mono-tech uppercase tracking-wider font-bold text-[#0A0A0A] mb-2">
                      COLORWAY DETAILS
                    </div>
                    <div className="space-y-2.5">
                      <input
                        type="text"
                        value={colorName}
                        onChange={(e) => setColorName(e.target.value)}
                        placeholder="Colorway Name (e.g. Cobalt Blue / White)"
                        className="w-full bg-white border border-neutral-300 px-3 py-1.5 text-xs"
                      />
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-xs">
                          <span>Primary Hex:</span>
                          <input
                            type="color"
                            value={colorHex}
                            onChange={(e) => setColorHex(e.target.value)}
                            className="w-7 h-7 cursor-pointer border border-neutral-300"
                          />
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <span>Accent Hex:</span>
                          <input
                            type="color"
                            value={secondaryHex}
                            onChange={(e) => setSecondaryHex(e.target.value)}
                            className="w-7 h-7 cursor-pointer border border-neutral-300"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono-tech uppercase tracking-wider font-bold text-[#0A0A0A] mb-2">
                      <span>STORAGE INVENTORY BY SIZE</span>
                      <span className="text-emerald-700">
                        TOTAL: {Number(stockS) + Number(stockM) + Number(stockL) + Number(stockXL)}{' '}
                        UNITS
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          ['S', stockS, setStockS],
                          ['M', stockM, setStockM],
                          ['L', stockL, setStockL],
                          ['XL', stockXL, setStockXL],
                        ] as const
                      ).map(([sz, val, setter]) => (
                        <div key={sz} className="bg-white border border-neutral-200 p-2 text-center">
                          <div className="text-[10px] font-mono-tech font-bold text-neutral-500">
                            SIZE {sz}
                          </div>
                          <input
                            type="number"
                            min={0}
                            value={val}
                            onChange={(e) => setter(Number(e.target.value))}
                            className="w-full text-center font-mono-tech text-xs font-bold mt-1 border-b border-neutral-300 focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4 Studio Image Upload Slots */}
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono-tech uppercase tracking-wider font-bold text-[#0A0A0A]">
                      UPLOAD 4 STUDIO VIEWS (FRONT CUTOUT REQUIRED, OTHERS OPTIONAL)
                    </span>
                    <label className="inline-flex items-center gap-1.5 text-xs text-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoStripWhite}
                        onChange={(e) => setAutoStripWhite(e.target.checked)}
                      />
                      <span>Auto-strip #FFFFFF white background on upload</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(
                      [
                        ['1. Front Cutout *', frontUrl, setFrontUrl],
                        ['2. Back Cutout', backUrl, setBackUrl],
                        ['3. On-Model Front', modelFrontUrl, setModelFrontUrl],
                        ['4. On-Model Back', modelBackUrl, setModelBackUrl],
                      ] as const
                    ).map(([label, currentUrl, setter]) => (
                      <label
                        key={label}
                        className="border-2 border-dashed border-neutral-300 hover:border-black p-3 flex flex-col items-center justify-center aspect-[4/5] cursor-pointer relative bg-neutral-50 transition"
                      >
                        {currentUrl ? (
                          <img
                            src={currentUrl}
                            alt={label}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
                            <span className="text-[10px] font-mono-tech uppercase tracking-wider text-neutral-600 block">
                              {label}
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileSelect(e, setter)}
                          className="hidden"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!prodTitle.trim() || !frontUrl}
                  className="w-full bg-[#0A0A0A] disabled:bg-neutral-300 text-white text-xs uppercase tracking-widest font-bold py-3 hover:bg-neutral-800 transition cursor-pointer"
                >
                  Publish Product to {prodGender.toUpperCase()} // {prodCategory}
                </button>
              </form>
            )}

            {/* TAB 2: MANAGE CATEGORIES & WAREHOUSE STOCK */}
            {activeTab === 'inventory' && (
              <div className="space-y-8">
                {/* Create New Category */}
                <div className="p-4 bg-neutral-50 border border-neutral-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-3">
                    + Create New Store Category
                  </div>
                  <form
                    onSubmit={handleCreateCategory}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-3"
                  >
                    <input
                      type="text"
                      value={newCatId}
                      onChange={(e) => setNewCatId(e.target.value)}
                      placeholder="ID (e.g. JACKETS)"
                      className="bg-white border border-neutral-300 px-3 py-2 text-xs font-mono-tech"
                      required
                    />
                    <input
                      type="text"
                      value={newCatLabel}
                      onChange={(e) => setNewCatLabel(e.target.value)}
                      placeholder="Display Label (e.g. Jackets)"
                      className="bg-white border border-neutral-300 px-3 py-2 text-xs"
                      required
                    />
                    <select
                      value={newCatGender}
                      onChange={(e) => setNewCatGender(e.target.value as 'men' | 'women')}
                      className="bg-white border border-neutral-300 px-3 py-2 text-xs"
                    >
                      <option value="men">Men (Boys)</option>
                      <option value="women">Girl Style (Women)</option>
                    </select>
                    <select
                      value={newCatModelType}
                      onChange={(e) =>
                        setNewCatModelType(e.target.value as BaseModelPoseType)
                      }
                      className="bg-white border border-neutral-300 px-3 py-2 text-xs"
                    >
                      <option value="male-torso">Male Model (Torso)</option>
                      <option value="male-shirtless-pants">
                        Shirtless Muscular Male (Pants)
                      </option>
                      <option value="female-torso">Pretty Female Model</option>
                      <option value="footwear">Footwear Stage (No Person)</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-[#0A0A0A] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-neutral-800 transition cursor-pointer inline-flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Category
                    </button>
                  </form>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <div
                        key={`${cat.gender}-${cat.id}`}
                        className="inline-flex items-center gap-2 bg-white border border-neutral-200 px-2.5 py-1 text-[10px] font-mono-tech uppercase"
                      >
                        <span>
                          {cat.gender.toUpperCase()} // <strong>{cat.label}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat.id, cat.gender)}
                          className="text-neutral-400 hover:text-red-600 cursor-pointer"
                          title="Remove Category"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Storage Stock Table */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                      Warehouse Storage Inventory ({products.length} Active Products)
                    </span>
                  </div>
                  <div className="border border-neutral-200 divide-y divide-neutral-200">
                    {products.map((prod) => {
                      const total = Object.values(prod.stockBySize || {}).reduce(
                        (s, n) => s + n,
                        0
                      );
                      return (
                        <div
                          key={prod.id}
                          className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-neutral-50"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.frontCutoutUrl}
                              alt={prod.title}
                              className="w-11 h-14 object-contain bg-neutral-100 p-1 border border-neutral-200"
                            />
                            <div>
                              <div className="text-[10px] font-mono-tech uppercase text-neutral-400">
                                {prod.gender.toUpperCase()} // {prod.category} • {prod.code}
                              </div>
                              <div className="text-xs font-bold uppercase text-[#0A0A0A]">
                                {prod.title}
                              </div>
                              <div className="text-[11px] text-neutral-500 font-mono-tech">
                                {prod.priceFormatted} •{' '}
                                <span className="text-emerald-700 font-semibold">
                                  {total} units total
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {(['S', 'M', 'L', 'XL'] as SizeOption[]).map((sz) => (
                              <div
                                key={sz}
                                className="flex flex-col items-center bg-neutral-50 border border-neutral-200 px-2 py-1"
                              >
                                <span className="text-[9px] font-mono-tech text-neutral-400">
                                  {sz}
                                </span>
                                <input
                                  type="number"
                                  min={0}
                                  value={prod.stockBySize?.[sz] ?? 0}
                                  onChange={(e) =>
                                    updateProductStock(prod.id, sz, Number(e.target.value))
                                  }
                                  className="w-11 text-center font-mono-tech text-xs font-bold bg-transparent focus:outline-none"
                                />
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => deleteProduct(prod.id)}
                              className="p-2 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AI STUDIO PROMPT GENERATOR */}
            {activeTab === 'prompts' && (
              <div className="space-y-5">
                <div className="p-4 bg-neutral-50 border border-neutral-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                    Client AI Studio Prompt Builder (Gemini / ChatGPT / Midjourney)
                  </div>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    When you or your client take a photo of a physical hoodie, t-shirt, pants,
                    or sport shoe, select its category below and copy the generated prompt into
                    Gemini along with your product photo and base model image.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-[10px] font-mono-tech uppercase tracking-wider text-neutral-500 mb-1">
                        1. Select Product Category Type
                      </label>
                      <select
                        value={promptType}
                        onChange={(e) =>
                          setPromptType(
                            e.target.value as
                              | 'men-top'
                              | 'men-pants'
                              | 'women-top'
                              | 'shoes'
                          )
                        }
                        className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs font-semibold"
                      >
                        <option value="men-top">
                          Men&apos;s Hoodie or T-Shirt (Uses base-model.jpg)
                        </option>
                        <option value="men-pants">
                          Men&apos;s Pants (Uses Shirtless Muscular base-model-shirtless.jpg)
                        </option>
                        <option value="women-top">
                          Girl Style Hoodie or T-Shirt (Uses Pretty Female base-model-female.jpg)
                        </option>
                        <option value="shoes">
                          Sport Shoes / Sneakers (4 Matching Angles of Same Shoe)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono-tech uppercase tracking-wider text-neutral-500 mb-1">
                        2. Describe Your Product Color &amp; Details
                      </label>
                      <input
                        type="text"
                        value={promptProductDesc}
                        onChange={(e) => setPromptProductDesc(e.target.value)}
                        className="w-full bg-white border border-neutral-300 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono-tech uppercase tracking-wider text-neutral-500">
                        READY-TO-PASTE GEMINI PROMPT
                      </span>
                      <button
                        type="button"
                        onClick={copyPromptToClipboard}
                        className="inline-flex items-center gap-1.5 bg-[#0A0A0A] text-white text-[10px] font-mono-tech uppercase tracking-wider px-3 py-1 rounded-full hover:bg-neutral-800 transition cursor-pointer"
                      >
                        {copiedPrompt ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Prompt
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="bg-white border border-neutral-300 p-3 text-[11px] font-mono-tech whitespace-pre-wrap leading-relaxed text-neutral-800">
                      {generatedAiPrompt}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
