import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Product,
  TransformCoords,
  ProductCalibration,
  CartItem,
  SizeOption,
  CalibrationTargetMode,
  PdpSlideIndex,
  LookbookCalibrationLayer,
  StoreCategoryConfig,
} from '../types/store';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, DEFAULT_COORDS } from '../data/initialProducts';
import { DEFAULT_BASE_MODEL_URL } from '../data/garmentVisuals';

const STORAGE_KEYS = {
  CALIBRATION: 'nocta_studio_calibration_v8',
  CUSTOM_IMAGES: 'nocta_studio_custom_images_v8',
  BASE_MODEL_URL: 'nocta_studio_base_model_url_v8',
  BASE_MODEL_CALIB: 'nocta_studio_base_model_calib_v8',
  CART: 'nocta_studio_cart_v8',
  CATEGORIES: 'nocta_studio_categories_v8',
  CUSTOM_PRODUCTS: 'nocta_studio_custom_products_v8',
  DELETED_PRODUCT_IDS: 'nocta_studio_deleted_products_v8',
  STOCK_OVERRIDES: 'nocta_studio_stock_overrides_v8',
  ADMIN_AUTH: 'nocta_studio_admin_auth_v8',
};

interface CustomImagesMap {
  [productId: string]: {
    frontCutoutUrl?: string;
    backCutoutUrl?: string;
    modelFrontUrl?: string;
    modelBackUrl?: string;
  };
}

interface CalibrationMap {
  [productId: string]: ProductCalibration;
}

interface StockOverridesMap {
  [productId: string]: Record<SizeOption, number>;
}

interface StoreContextValue {
  // Products, Categories & Base Model
  products: Product[];
  categories: StoreCategoryConfig[];
  activeGender: 'men' | 'women';
  activeCategory: string;
  categoryProducts: Product[];
  selectGenderAndCategory: (gender: 'men' | 'women', categoryId?: string) => void;
  baseModelUrl: string;
  baseModelCalibration: TransformCoords;

  // Navigation & Active Selection
  activeView: 'home' | 'pdp';
  selectedProductId: string;
  selectedProduct: Product;
  lookbookIndex: number;
  setLookbookIndex: React.Dispatch<React.SetStateAction<number>>;
  pdpSlideIndex: PdpSlideIndex;
  setPdpSlideIndex: React.Dispatch<React.SetStateAction<PdpSlideIndex>>;
  openProductDetail: (productId: string) => void;
  backToStore: (scrollToSectionId?: string) => void;

  // Client Admin Portal & Authentication
  isAdminAuthenticated: boolean;
  isAdminPortalOpen: boolean;
  setIsAdminPortalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  loginAdmin: (email: string, password: string) => boolean;
  logoutAdmin: () => void;
  addCategory: (cat: StoreCategoryConfig) => void;
  deleteCategory: (id: string, gender: 'men' | 'women') => void;
  addCustomProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  updateProductStock: (productId: string, size: SizeOption, quantity: number) => void;

  // Admin Cutout Calibration Studio
  isCalibrateMode: boolean;
  setIsCalibrateMode: React.Dispatch<React.SetStateAction<boolean>>;
  calibrationTargetMode: CalibrationTargetMode;
  setCalibrationTargetMode: React.Dispatch<React.SetStateAction<CalibrationTargetMode>>;
  lookbookCalibrationLayer: LookbookCalibrationLayer;
  setLookbookCalibrationLayer: React.Dispatch<React.SetStateAction<LookbookCalibrationLayer>>;
  onionSkinOpacity: number;
  setOnionSkinOpacity: React.Dispatch<React.SetStateAction<number>>;
  showCrosshairGrid: boolean;
  setShowCrosshairGrid: React.Dispatch<React.SetStateAction<boolean>>;
  showReferenceGhost: boolean;
  setShowReferenceGhost: React.Dispatch<React.SetStateAction<boolean>>;

  // Calibration Mutators
  updateProductCalibration: (
    productId: string,
    slot: keyof ProductCalibration,
    patch: Partial<TransformCoords>
  ) => void;
  updateBaseModelCalibration: (patch: Partial<TransformCoords>) => void;
  updateProductImage: (
    productId: string,
    slot: 'frontCutoutUrl' | 'backCutoutUrl' | 'modelFrontUrl' | 'modelBackUrl',
    dataUrl: string
  ) => void;
  resetProductImage: (
    productId: string,
    slot: 'frontCutoutUrl' | 'backCutoutUrl' | 'modelFrontUrl' | 'modelBackUrl'
  ) => void;
  updateBaseModelImage: (dataUrl: string) => void;
  resetBaseModelImage: () => void;
  resetActiveCalibration: () => void;
  resetAllToDefaults: () => void;
  exportCalibrationJson: () => string;

  // Cart & UI Drawers/Modals
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addToCart: (productId: string, size: SizeOption, colorwayName: string) => void;
  removeFromCart: (productId: string, size: SizeOption, colorwayName: string) => void;
  updateCartQuantity: (productId: string, size: SizeOption, colorwayName: string, delta: number) => void;
  clearCart: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`LocalStorage write warning for ${key}:`, err);
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Categories, Custom Products, Deleted IDs & Stock Overrides
  const [categories, setCategories] = useState<StoreCategoryConfig[]>(() => {
    const raw = safeReadJson<StoreCategoryConfig[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object' && raw[0] !== null && 'gender' in raw[0]) {
      return raw;
    }
    return INITIAL_CATEGORIES;
  });
  const [customProducts, setCustomProducts] = useState<Product[]>(() =>
    safeReadJson<Product[]>(STORAGE_KEYS.CUSTOM_PRODUCTS, [])
  );
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>(() =>
    safeReadJson<string[]>(STORAGE_KEYS.DELETED_PRODUCT_IDS, [])
  );
  const [stockOverrides, setStockOverrides] = useState<StockOverridesMap>(() =>
    safeReadJson<StockOverridesMap>(STORAGE_KEYS.STOCK_OVERRIDES, {})
  );

  // Active Gender & Category (strictly organizes Lookbook & Store)
  const [activeGender, setActiveGender] = useState<'men' | 'women'>('men');
  const [activeCategory, setActiveCategory] = useState<string>('HOODIES');

  // Admin Authentication
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() =>
    safeReadJson<boolean>(STORAGE_KEYS.ADMIN_AUTH, false)
  );
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState<boolean>(false);

  // Load persisted calibrations & custom images
  const [calibrationMap, setCalibrationMap] = useState<CalibrationMap>(() =>
    safeReadJson<CalibrationMap>(STORAGE_KEYS.CALIBRATION, {})
  );
  const [customImagesMap, setCustomImagesMap] = useState<CustomImagesMap>(() =>
    safeReadJson<CustomImagesMap>(STORAGE_KEYS.CUSTOM_IMAGES, {})
  );
  const [baseModelUrl, setBaseModelUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.BASE_MODEL_URL) || DEFAULT_BASE_MODEL_URL;
    } catch {
      return DEFAULT_BASE_MODEL_URL;
    }
  });
  const [baseModelCalibration, setBaseModelCalibration] = useState<TransformCoords>(() =>
    safeReadJson<TransformCoords>(STORAGE_KEYS.BASE_MODEL_CALIB, DEFAULT_COORDS)
  );

  // Navigation & Active Selection
  const [activeView, setActiveView] = useState<'home' | 'pdp'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>(INITIAL_PRODUCTS[0].id);
  const [lookbookIndex, setLookbookIndex] = useState<number>(0);
  const [pdpSlideIndex, setPdpSlideIndex] = useState<PdpSlideIndex>(0);

  // Admin Cutout Calibration Studio State
  const [isCalibrateMode, setIsCalibrateMode] = useState<boolean>(false);
  const [calibrationTargetMode, setCalibrationTargetMode] = useState<CalibrationTargetMode>('lookbook');
  const [lookbookCalibrationLayer, setLookbookCalibrationLayer] =
    useState<LookbookCalibrationLayer>('garment');
  const [onionSkinOpacity, setOnionSkinOpacity] = useState<number>(1.0);
  const [showCrosshairGrid, setShowCrosshairGrid] = useState<boolean>(true);
  const [showReferenceGhost, setShowReferenceGhost] = useState<boolean>(false);

  // Cart & Modals
  const [cart, setCart] = useState<CartItem[]>(() => {
    const raw = safeReadJson<CartItem[]>(STORAGE_KEYS.CART, []);
    if (Array.isArray(raw) && raw.length > 0) {
      const valid = raw.filter((item) =>
        INITIAL_PRODUCTS.some((p) => p.id === item.productId)
      );
      if (valid.length > 0) return valid;
    }
    return [
      {
        productId: 'piped-hoodie-black-yellow',
        size: 'M',
        colorwayName: 'Pitch Black / Tour Yellow',
        quantity: 1,
      },
    ];
  });
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);

  // Persist changes automatically
  useEffect(() => {
    safeWriteJson(STORAGE_KEYS.CALIBRATION, calibrationMap);
  }, [calibrationMap]);

  useEffect(() => {
    safeWriteJson(STORAGE_KEYS.CUSTOM_IMAGES, customImagesMap);
  }, [customImagesMap]);

  useEffect(() => {
    safeWriteJson(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    safeWriteJson(STORAGE_KEYS.CUSTOM_PRODUCTS, customProducts);
  }, [customProducts]);

  useEffect(() => {
    safeWriteJson(STORAGE_KEYS.DELETED_PRODUCT_IDS, deletedProductIds);
  }, [deletedProductIds]);

  useEffect(() => {
    safeWriteJson(STORAGE_KEYS.STOCK_OVERRIDES, stockOverrides);
  }, [stockOverrides]);

  useEffect(() => {
    safeWriteJson(STORAGE_KEYS.ADMIN_AUTH, isAdminAuthenticated);
  }, [isAdminAuthenticated]);

  useEffect(() => {
    try {
      if (baseModelUrl === DEFAULT_BASE_MODEL_URL) {
        localStorage.removeItem(STORAGE_KEYS.BASE_MODEL_URL);
      } else {
        localStorage.setItem(STORAGE_KEYS.BASE_MODEL_URL, baseModelUrl);
      }
    } catch (e) {
      console.warn('Could not persist custom baseModelUrl to localStorage:', e);
    }
  }, [baseModelUrl]);

  useEffect(() => {
    safeWriteJson(STORAGE_KEYS.BASE_MODEL_CALIB, baseModelCalibration);
  }, [baseModelCalibration]);

  useEffect(() => {
    safeWriteJson(STORAGE_KEYS.CART, cart);
  }, [cart]);

  // Global keyboard shortcut: Shift + C toggles Calibrate Mode (when Admin is logged in)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isInput) return;

      if (e.shiftKey && (e.key === 'C' || e.key === 'c') && isAdminAuthenticated) {
        e.preventDefault();
        setIsCalibrateMode((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminAuthenticated]);

  // Merge INITIAL_PRODUCTS + customProducts, excluding deletedProductIds
  const products = useMemo<Product[]>(() => {
    const combined = [
      ...INITIAL_PRODUCTS,
      ...(Array.isArray(customProducts) ? customProducts : []),
    ].filter((p) => !deletedProductIds.includes(p.id));
    const validBase = combined.length > 0 ? combined : INITIAL_PRODUCTS;
    return validBase.map((initProd) => {
      const savedCalib = calibrationMap[initProd.id];
      const savedImgs = customImagesMap[initProd.id];
      const savedStock = stockOverrides[initProd.id];
      const baseCalib = initProd.calibration || {
        lookbook: DEFAULT_COORDS,
        pdpSlide0: DEFAULT_COORDS,
        pdpSlide1: DEFAULT_COORDS,
        pdpSlide2: DEFAULT_COORDS,
      };
      return {
        ...initProd,
        stockBySize: savedStock || initProd.stockBySize || { S: 10, M: 10, L: 10, XL: 10 },
        frontCutoutUrl: savedImgs?.frontCutoutUrl || initProd.frontCutoutUrl,
        lookbookCutoutUrl:
          savedImgs?.frontCutoutUrl || initProd.lookbookCutoutUrl || initProd.frontCutoutUrl,
        backCutoutUrl: savedImgs?.backCutoutUrl || initProd.backCutoutUrl,
        modelFrontUrl: savedImgs?.modelFrontUrl || initProd.modelFrontUrl,
        modelBackUrl: savedImgs?.modelBackUrl || initProd.modelBackUrl,
        colorways:
          Array.isArray(initProd.colorways) && initProd.colorways.length > 0
            ? initProd.colorways
            : [{ id: 'default', name: 'Default', hex: '#0A0A0A', secondaryHex: '#FFFFFF' }],
        calibration: {
          lookbook: { ...(baseCalib.lookbook || DEFAULT_COORDS), ...(savedCalib?.lookbook || {}) },
          pdpSlide0: { ...(baseCalib.pdpSlide0 || DEFAULT_COORDS), ...(savedCalib?.pdpSlide0 || {}) },
          pdpSlide1: { ...(baseCalib.pdpSlide1 || DEFAULT_COORDS), ...(savedCalib?.pdpSlide1 || {}) },
          pdpSlide2: { ...(baseCalib.pdpSlide2 || DEFAULT_COORDS), ...(savedCalib?.pdpSlide2 || {}) },
          pdpSlide3: { ...(baseCalib.pdpSlide3 || baseCalib.pdpSlide0 || DEFAULT_COORDS), ...(savedCalib?.pdpSlide3 || {}) },
        },
      };
    });
  }, [calibrationMap, customImagesMap, customProducts, deletedProductIds, stockOverrides]);

  // Products strictly belonging to the active Gender & active Category
  const categoryProducts = useMemo<Product[]>(() => {
    return products.filter(
      (p) => p.gender === activeGender && p.category === activeCategory
    );
  }, [products, activeGender, activeCategory]);

  const selectGenderAndCategory = useCallback(
    (gender: 'men' | 'women', categoryId?: string) => {
      setActiveGender(gender);
      const genderCats = categories.filter((c) => c.gender === gender);
      const targetCat =
        categoryId && genderCats.some((c) => c.id === categoryId)
          ? categoryId
          : genderCats[0]?.id || 'HOODIES';
      setActiveCategory(targetCat);
      setLookbookIndex(0);
    },
    [categories]
  );

  // Admin Login / Logout & Catalog Mutators
  const loginAdmin = useCallback((email: string, password: string): boolean => {
    const normalized = email.trim().toLowerCase();
    if (
      (normalized === 'admin@nocta.studio' || normalized === 'admin') &&
      password.trim() === 'studio2026'
    ) {
      setIsAdminAuthenticated(true);
      setIsAdminPortalOpen(true);
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdminAuthenticated(false);
    setIsAdminPortalOpen(false);
    setIsCalibrateMode(false);
  }, []);

  const addCategory = useCallback((cat: StoreCategoryConfig) => {
    setCategories((prev) => {
      const exists = prev.some(
        (c) => c.id.toUpperCase() === cat.id.toUpperCase() && c.gender === cat.gender
      );
      if (exists) return prev;
      return [...prev, { ...cat, id: cat.id.toUpperCase() }];
    });
  }, []);

  const deleteCategory = useCallback((id: string, gender: 'men' | 'women') => {
    setCategories((prev) => prev.filter((c) => !(c.id === id && c.gender === gender)));
  }, []);

  const addCustomProduct = useCallback((product: Product) => {
    setCustomProducts((prev) => [product, ...prev.filter((p) => p.id !== product.id)]);
    setActiveGender(product.gender);
    setActiveCategory(product.category);
    setLookbookIndex(0);
  }, []);

  const deleteProduct = useCallback((productId: string) => {
    setCustomProducts((prev) => prev.filter((p) => p.id !== productId));
    setDeletedProductIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
  }, []);

  const updateProductStock = useCallback(
    (productId: string, size: SizeOption, quantity: number) => {
      const targetProd = products.find((p) => p.id === productId);
      const currentStock = targetProd?.stockBySize || { S: 10, M: 10, L: 10, XL: 10 };
      setStockOverrides((prev) => ({
        ...prev,
        [productId]: {
          ...currentStock,
          ...(prev[productId] || {}),
          [size]: Math.max(0, quantity),
        },
      }));
    },
    [products]
  );

  const selectedProduct = useMemo<Product>(() => {
    return products.find((p) => p.id === selectedProductId) || products[0] || INITIAL_PRODUCTS[0];
  }, [products, selectedProductId]);

  const openProductDetail = useCallback(
    (productId: string) => {
      const prod = products.find((p) => p.id === productId);
      if (prod) {
        setActiveGender(prod.gender);
        setActiveCategory(prod.category);
        const catItems = products.filter(
          (p) => p.gender === prod.gender && p.category === prod.category
        );
        const cIdx = catItems.findIndex((p) => p.id === productId);
        if (cIdx !== -1) {
          setLookbookIndex(cIdx);
        }
      }
      setSelectedProductId(productId);
      setPdpSlideIndex(0);
      setActiveView('pdp');
      setCalibrationTargetMode('pdp');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [products]
  );

  const backToStore = useCallback((scrollToSectionId?: string) => {
    setActiveView('home');
    setCalibrationTargetMode('lookbook');
    if (scrollToSectionId) {
      setTimeout(() => {
        const el = document.getElementById(scrollToSectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const updateProductCalibration = useCallback(
    (productId: string, slot: keyof ProductCalibration, patch: Partial<TransformCoords>) => {
      setCalibrationMap((prev) => {
        const existingProd =
          prev[productId] ||
          products.find((p) => p.id === productId)?.calibration || {
            lookbook: { ...DEFAULT_COORDS },
            pdpSlide0: { ...DEFAULT_COORDS },
            pdpSlide1: { ...DEFAULT_COORDS },
            pdpSlide2: { ...DEFAULT_COORDS },
            pdpSlide3: { ...DEFAULT_COORDS },
          };

        return {
          ...prev,
          [productId]: {
            ...existingProd,
            [slot]: {
              ...existingProd[slot],
              ...patch,
            },
          },
        };
      });
    },
    [products]
  );

  const updateBaseModelCalibration = useCallback((patch: Partial<TransformCoords>) => {
    setBaseModelCalibration((prev) => ({
      ...prev,
      ...patch,
    }));
  }, []);

  const updateProductImage = useCallback(
    (
      productId: string,
      slot: 'frontCutoutUrl' | 'backCutoutUrl' | 'modelFrontUrl' | 'modelBackUrl',
      dataUrl: string
    ) => {
      setCustomImagesMap((prev) => ({
        ...prev,
        [productId]: {
          ...(prev[productId] || {}),
          [slot]: dataUrl,
        },
      }));
    },
    []
  );

  const resetProductImage = useCallback(
    (
      productId: string,
      slot: 'frontCutoutUrl' | 'backCutoutUrl' | 'modelFrontUrl' | 'modelBackUrl'
    ) => {
      setCustomImagesMap((prev) => {
        if (!prev[productId]) return prev;
        const updated = { ...prev[productId] };
        delete updated[slot];
        return {
          ...prev,
          [productId]: updated,
        };
      });
    },
    []
  );

  const updateBaseModelImage = useCallback((dataUrl: string) => {
    setBaseModelUrl(dataUrl);
  }, []);

  const resetBaseModelImage = useCallback(() => {
    setBaseModelUrl(DEFAULT_BASE_MODEL_URL);
  }, []);

  const resetActiveCalibration = useCallback(() => {
    if (calibrationTargetMode === 'lookbook') {
      if (lookbookCalibrationLayer === 'baseModel') {
        setBaseModelCalibration({ ...DEFAULT_COORDS });
      } else {
        const activeProd = categoryProducts[lookbookIndex % categoryProducts.length] || products[0];
        updateProductCalibration(activeProd.id, 'lookbook', { ...DEFAULT_COORDS });
      }
    } else {
      const slotKey: keyof ProductCalibration =
        pdpSlideIndex === 0
          ? 'pdpSlide0'
          : pdpSlideIndex === 1
            ? 'pdpSlide1'
            : pdpSlideIndex === 2
              ? 'pdpSlide2'
              : 'pdpSlide3';
      updateProductCalibration(selectedProduct.id, slotKey, { ...DEFAULT_COORDS });
    }
  }, [
    calibrationTargetMode,
    categoryProducts,
    lookbookCalibrationLayer,
    lookbookIndex,
    pdpSlideIndex,
    products,
    selectedProduct.id,
    updateProductCalibration,
  ]);

  const resetAllToDefaults = useCallback(() => {
    setCalibrationMap({});
    setCustomImagesMap({});
    setCustomProducts([]);
    setDeletedProductIds([]);
    setStockOverrides({});
    setCategories(INITIAL_CATEGORIES);
    setBaseModelUrl(DEFAULT_BASE_MODEL_URL);
    setBaseModelCalibration({ ...DEFAULT_COORDS });
    Object.values(STORAGE_KEYS).forEach((k) => {
      if (k !== STORAGE_KEYS.ADMIN_AUTH) {
        localStorage.removeItem(k);
      }
    });
  }, []);

  const exportCalibrationJson = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      store: 'NOCTA / STUDIO — FS/26 & DROP 02',
      baseModelCalibration,
      categories,
      products: products.map((p) => ({
        id: p.id,
        code: p.code,
        title: p.title,
        category: p.category,
        gender: p.gender,
        price: p.priceFormatted,
        stockBySize: p.stockBySize,
        calibration: p.calibration,
      })),
    };
    return JSON.stringify(payload, null, 2);
  }, [baseModelCalibration, categories, products]);

  // Cart Actions (also decrements stock on addToCart)
  const addToCart = useCallback(
    (productId: string, size: SizeOption, colorwayName: string) => {
      const prod = products.find((p) => p.id === productId);
      const avail = prod?.stockBySize?.[size] ?? 10;
      if (avail <= 0) return;

      updateProductStock(productId, size, avail - 1);

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.productId === productId &&
            item.size === size &&
            item.colorwayName === colorwayName
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
          return updated;
        }
        return [...prev, { productId, size, colorwayName, quantity: 1 }];
      });
      setIsCartOpen(true);
    },
    [products, updateProductStock]
  );

  const removeFromCart = useCallback(
    (productId: string, size: SizeOption, colorwayName: string) => {
      setCart((prev) =>
        prev.filter(
          (item) =>
            !(
              item.productId === productId &&
              item.size === size &&
              item.colorwayName === colorwayName
            )
        )
      );
    },
    []
  );

  const updateCartQuantity = useCallback(
    (productId: string, size: SizeOption, colorwayName: string, delta: number) => {
      setCart((prev) =>
        prev
          .map((item) => {
            if (
              item.productId === productId &&
              item.size === size &&
              item.colorwayName === colorwayName
            ) {
              const nextQty = item.quantity + delta;
              return nextQty > 0 ? { ...item, quantity: nextQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[]
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const prod = products.find((p) => p.id === item.productId);
      return acc + (prod ? prod.price * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  const value: StoreContextValue = {
    products,
    categories,
    activeGender,
    activeCategory,
    categoryProducts,
    selectGenderAndCategory,
    baseModelUrl,
    baseModelCalibration,
    activeView,
    selectedProductId,
    selectedProduct,
    lookbookIndex,
    setLookbookIndex,
    pdpSlideIndex,
    setPdpSlideIndex,
    openProductDetail,
    backToStore,
    isAdminAuthenticated,
    isAdminPortalOpen,
    setIsAdminPortalOpen,
    loginAdmin,
    logoutAdmin,
    addCategory,
    deleteCategory,
    addCustomProduct,
    deleteProduct,
    updateProductStock,
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
    cart,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    isSearchOpen,
    setIsSearchOpen,
    isSizeGuideOpen,
    setIsSizeGuideOpen,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
