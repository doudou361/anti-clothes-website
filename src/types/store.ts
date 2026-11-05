export type SizeOption =
  | 'XS'
  | 'S'
  | 'M'
  | 'L'
  | 'XL'
  | '38'
  | '39'
  | '40'
  | '41'
  | '42'
  | '43'
  | '44'
  | '45';

export interface TransformCoords {
  x: number;        // -300 to +300 px
  y: number;        // -300 to +300 px
  scale: number;    // 0.40 to 2.20
  rotation: number; // -15 to +15 deg
}

export interface ProductCalibration {
  lookbook: TransformCoords;
  pdpSlide0: TransformCoords;
  pdpSlide1: TransformCoords;
  pdpSlide2: TransformCoords;
  pdpSlide3?: TransformCoords;
}

export interface ColorwayOption {
  id: string;
  name: string;
  hex: string;
  secondaryHex?: string;
  linkedProductId?: string;
}

export type BaseModelPoseType =
  | 'male-torso'
  | 'male-shirtless-pants'
  | 'female-torso'
  | 'footwear';

export interface StoreCategoryConfig {
  id: string;
  label: string;
  gender: 'men' | 'women';
  baseModelType: BaseModelPoseType;
}

export interface Product {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  price: number;
  priceFormatted: string;
  category: string; // e.g. 'HOODIES' | 'TSHIRTS' | 'PANTS' | 'SHOES' or custom client category
  gender: 'men' | 'women';
  division?: 'men' | 'women';
  collection: string;
  narrative: string;
  specs: string[];
  sizingReference: string;
  colorways: ColorwayOption[];
  sizes: SizeOption[];
  stockBySize: Partial<Record<SizeOption, number>>; // Inventory storage per size
  frontCutoutUrl: string;
  lookbookCutoutUrl?: string;
  backCutoutUrl: string;
  modelFrontUrl: string;
  modelBackUrl: string;
  // Dedicated 4-angle footwear studio URLs for 'SHOES' category
  lateralSideUrl?: string;
  threeQuarterFrontUrl?: string;
  heelBackUrl?: string;
  topDownUrl?: string;
  // 3-Layer paper-doll angle cutouts (optional — fallback to frontCutoutUrl)
  sideCutoutUrl?: string;
  calibration: ProductCalibration;
}

export interface CartItem {
  productId: string;
  size: SizeOption;
  colorwayName: string;
  quantity: number;
}

export type CalibrationTargetMode = 'lookbook' | 'pdp';
export type PdpSlideIndex = 0 | 1 | 2 | 3;
export type LookbookCalibrationLayer = 'garment' | 'baseModel';
