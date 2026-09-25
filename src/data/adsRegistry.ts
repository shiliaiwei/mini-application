import rawAds from "./ads_registry.json";

export interface AdItem {
  id: string;
  file: string;
  name_km: string;
  name_en: string;
  code: string;
  category_km: string;
  category_en: string;
  tag: string;
  badgeNumber: string;
  stars: number;
  description_km: string;
  description_en: string;
}

// Strict condition: only include ads that have authentic verified full names (both EN and KH)
export const ADS_REGISTRY: AdItem[] = (rawAds as AdItem[]).filter(
  (ad) => ad.file && ad.name_km && ad.name_en && ad.name_km.trim() !== "" && ad.name_en.trim() !== ""
);

/**
 * Get random ad guaranteed to differ from the currently displayed ad.
 */
export function getRandomNonRepeatingAd(currentId?: string): AdItem {
  if (ADS_REGISTRY.length === 0) {
    throw new Error("No ads found in registry");
  }
  if (ADS_REGISTRY.length === 1) {
    return ADS_REGISTRY[0];
  }
  const filtered = currentId
    ? ADS_REGISTRY.filter((a) => a.id !== currentId)
    : ADS_REGISTRY;
  const pool = filtered.length > 0 ? filtered : ADS_REGISTRY;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Retrieve specific ad by ID or file name
 */
export function getAdById(id: string): AdItem | undefined {
  return ADS_REGISTRY.find((a) => a.id === id || a.code === id || a.file === id);
}
