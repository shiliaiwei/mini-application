import { TelegramUser, TelegramWebApp } from "@/types/telegram";

export interface AddressDetails {
  street: string;
  unit?: string;
  city: string;
  stateProvince?: string;
  postalCode?: string;
  country: string;
}

export interface OtherAddressDetails extends AddressDetails {
  label: string;
}

export type GenderOption =
  | "male"
  | "female"
  | "non_binary"
  | "prefer_not_to_say"
  | "custom";

export interface UserSettings {
  // 1. Profile Picture
  photoUrl: string;
  photoSource: "telegram" | "custom" | "preset";

  // 2. Name
  firstName: string;
  lastName: string;
  displayName: string;
  nickname?: string;

  // 3. Gender
  gender: GenderOption;
  customGender?: string;

  // 4. Email
  email: string;
  emailVerified: boolean;

  // 5. Phone
  phone: string;
  phoneVerified: boolean;
  phoneSource: "telegram" | "manual";

  // 6. Birthday
  birthday: string; // YYYY-MM-DD
  showBirthdayYear: boolean;

  // 7. Security Question & Answer (Manual Input)
  securityQuestion?: string;
  securityAnswer?: string;

  // 8. Language
  language: string; // "en" | "km" | "zh" | "ru"

  // 9. Addresses: Home (manual) & Work (auto map pin)
  homeAddress: AddressDetails;
  workAddress: AddressDetails;

  // Preferences & Meta
  telegramCloudSync: boolean;
  hapticFeedback: boolean;
  soundEffects: boolean;
  updatedAt: string;
}

const STORAGE_KEY = "shi_user_settings_v2";

export const DEFAULT_USER_SETTINGS: UserSettings = {
  photoUrl: "",
  photoSource: "telegram",
  firstName: "",
  lastName: "",
  displayName: "",
  nickname: "",
  gender: "prefer_not_to_say",
  customGender: "",
  email: "",
  emailVerified: false,
  phone: "",
  phoneVerified: false,
  phoneSource: "manual",
  birthday: "",
  showBirthdayYear: true,
  securityQuestion: "What is your secret recovery codeword?",
  securityAnswer: "",
  language: "en",
  homeAddress: {
    street: "",
    unit: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "Cambodia",
  },
  workAddress: {
    street: "",
    unit: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "Cambodia",
  },
  telegramCloudSync: true,
  hapticFeedback: true,
  soundEffects: true,
  updatedAt: new Date().toISOString(),
};

/**
 * Initializes default user settings based on current Telegram user object
 */
export function createInitialSettings(user: TelegramUser | null): UserSettings {
  const base = { ...DEFAULT_USER_SETTINGS };
  if (!user) return base;

  const fName = user.first_name || "";
  const lName = user.last_name || "";
  const dName = [fName, lName].filter(Boolean).join(" ") || user.username || "";
  const nName = user.username ? (user.username.startsWith("@") ? user.username : `@${user.username}`) : "";

  const resolvedPhoto =
    user.photo_url ||
    (user.id && user.id > 0 ? `/api/player/avatar?telegram_id=${user.id}` : "");

  return {
    ...base,
    photoUrl: resolvedPhoto,
    photoSource: resolvedPhoto ? "telegram" : "preset",
    firstName: fName,
    lastName: lName,
    displayName: dName,
    nickname: nName,
    language: user.language_code ? (["en", "km", "zh", "ru"].includes(user.language_code) ? user.language_code : "en") : "en",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Synchronously loads cached preferences from localStorage (non-sensitive display settings only)
 */
export function loadCachedUserSettings(user: TelegramUser | null): UserSettings {
  const initial = createInitialSettings(user);
  if (typeof window === "undefined") {
    return initial;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const effectiveFirstName = user?.first_name || parsed.firstName || initial.firstName;
        const effectiveLastName = user?.last_name || parsed.lastName || initial.lastName;
        const effectiveDisplayName =
          parsed.displayName ||
          [effectiveFirstName, effectiveLastName].filter(Boolean).join(" ") ||
          user?.username ||
          initial.displayName;
        const effectiveNickname = user?.username
          ? (user.username.startsWith("@") ? user.username : `@${user.username}`)
          : (parsed.nickname || initial.nickname);
        const effectivePhoto =
          user?.photo_url ||
          (user?.id && user.id > 0 ? `/api/player/avatar?telegram_id=${user.id}` : (parsed.photoUrl || initial.photoUrl));

        return {
          ...initial,
          ...parsed,
          firstName: effectiveFirstName,
          lastName: effectiveLastName,
          displayName: effectiveDisplayName,
          nickname: effectiveNickname,
          photoUrl: effectivePhoto,
          photoSource: effectivePhoto ? "telegram" : (parsed.photoSource || initial.photoSource),
          homeAddress: { ...DEFAULT_USER_SETTINGS.homeAddress, ...(parsed.homeAddress || {}) },
          workAddress: { ...DEFAULT_USER_SETTINGS.workAddress, ...(parsed.workAddress || {}) },
          securityQuestion: parsed.securityQuestion || initial.securityQuestion,
          securityAnswer: parsed.securityAnswer || initial.securityAnswer,
          updatedAt: parsed.updatedAt || initial.updatedAt,
        };
      }
    }
  } catch {}

  return initial;
}

/**
 * Safely checks whether Telegram WebApp supports the CloudStorage API (requires Bot API 6.9+).
 * Prevents "[Telegram.WebApp] CloudStorage is not supported in version 6.0" runtime console error.
 */
export function isCloudStorageSupported(tgApp: TelegramWebApp | null | undefined): boolean {
  if (!tgApp) return false;
  if (!tgApp.CloudStorage || typeof tgApp.CloudStorage.getItem !== "function") {
    return false;
  }

  // Official Telegram WebApp method
  if (typeof tgApp.isVersionAtLeast === "function") {
    try {
      return tgApp.isVersionAtLeast("6.9");
    } catch {
      return false;
    }
  }

  // Fallback version string parsing (e.g., "6.0", "6.9", "7.0")
  if (tgApp.version && typeof tgApp.version === "string") {
    try {
      const parts = tgApp.version.split(".").map(Number);
      const major = parts[0] || 0;
      const minor = parts[1] || 0;
      if (major > 6) return true;
      if (major === 6 && minor >= 9) return true;
      return false;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Asynchronously checks and syncs settings from Telegram CloudStorage
 */
export function loadTelegramCloudSettings(
  tgApp: TelegramWebApp | null | undefined,
  callback: (settings: UserSettings) => void
): void {
  if (!isCloudStorageSupported(tgApp)) {
    return;
  }

  try {
    tgApp?.CloudStorage?.getItem(STORAGE_KEY, (err, val) => {
      if (!err && val && typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === "object") {
            const merged: UserSettings = {
              ...DEFAULT_USER_SETTINGS,
              ...parsed,
              homeAddress: { ...DEFAULT_USER_SETTINGS.homeAddress, ...(parsed.homeAddress || {}) },
              workAddress: { ...DEFAULT_USER_SETTINGS.workAddress, ...(parsed.workAddress || {}) },
            };
            callback(merged);
          }
        } catch {}
      }
    });
  } catch {}
}

/**
 * Persists settings to localStorage and Telegram CloudStorage.
 * Sensitive PII (addresses, phone, email) is strictly stored in Telegram CloudStorage only.
 */
export function saveUserSettings(
  settings: UserSettings,
  tgApp: TelegramWebApp | null | undefined
): void {
  const updated: UserSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  const str = JSON.stringify(updated);

  // 1. In client-side localStorage, strictly store non-sensitive display preferences only
  if (typeof window !== "undefined") {
    try {
      const nonSensitivePrefs = {
        photoUrl: updated.photoUrl,
        photoSource: updated.photoSource,
        displayName: updated.displayName,
        language: updated.language,
        telegramCloudSync: updated.telegramCloudSync,
        hapticFeedback: updated.hapticFeedback,
        soundEffects: updated.soundEffects,
        updatedAt: updated.updatedAt,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nonSensitivePrefs));
    } catch {}
  }

  // 2. Full profile with verified addresses is securely stored in Telegram CloudStorage if supported
  if (isCloudStorageSupported(tgApp) && settings.telegramCloudSync) {
    try {
      tgApp?.CloudStorage?.setItem(STORAGE_KEY, str, (err) => {
        if (err) {
          console.warn("Telegram CloudStorage sync error:", err);
        }
      });
    } catch (e) {
      console.warn("Telegram CloudStorage setItem exception:", e);
    }
  }
}

/**
 * Helper to calculate age from birthday string (YYYY-MM-DD)
 */
export function calculateAge(birthdayStr: string): number | null {
  if (!birthdayStr) return null;
  const birth = new Date(birthdayStr);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Helper to format address for single-line display
 */
export function formatAddressLine(addr?: AddressDetails): string {
  if (!addr || !addr.street) return "Not set";
  const parts = [
    addr.street,
    addr.unit,
    addr.city,
    addr.stateProvince,
    addr.country,
  ].filter(Boolean);
  return parts.join(", ");
}

/**
 * Checks whether an address has not been filled yet
 */
export function isAddressEmpty(addr?: AddressDetails | null): boolean {
  if (!addr) return true;
  return !addr.street || !addr.street.trim() || !addr.city || !addr.city.trim() || addr.street === "Not set";
}

export interface IncompleteField {
  key: string;
  label: string;
  section: "personal" | "contact" | "addresses";
  actionText: string;
}

/**
 * Computes profile completion progress and lists unfilled fields
 */
export function getProfileCompletion(settings: UserSettings): {
  completedCount: number;
  totalCount: number;
  percentage: number;
  incompleteFields: IncompleteField[];
} {
  const incompleteFields: IncompleteField[] = [];

  if (!settings.photoUrl) {
    incompleteFields.push({
      key: "photo",
      label: "Profile Photo",
      section: "personal",
      actionText: "Upload or choose photo",
    });
  }

  if (!settings.firstName?.trim() && !settings.displayName?.trim()) {
    incompleteFields.push({
      key: "name",
      label: "Full Name",
      section: "personal",
      actionText: "Enter full name",
    });
  }

  if (!settings.gender || settings.gender === "prefer_not_to_say") {
    incompleteFields.push({
      key: "gender",
      label: "Gender Identity",
      section: "personal",
      actionText: "Select gender",
    });
  }

  if (!settings.birthday?.trim()) {
    incompleteFields.push({
      key: "birthday",
      label: "Date of Birth",
      section: "personal",
      actionText: "Set birthday for verification",
    });
  }

  if (!settings.email?.trim()) {
    incompleteFields.push({
      key: "email",
      label: "Email Address",
      section: "contact",
      actionText: "Link recovery email",
    });
  }

  if (!settings.phone?.trim()) {
    incompleteFields.push({
      key: "phone",
      label: "Phone Number",
      section: "contact",
      actionText: "Add phone number",
    });
  }

  if (!settings.securityAnswer?.trim()) {
    incompleteFields.push({
      key: "security_answer",
      label: "Security Answer",
      section: "personal",
      actionText: "Set secret recovery codeword",
    });
  }

  if (isAddressEmpty(settings.homeAddress)) {
    incompleteFields.push({
      key: "home_address",
      label: "Home Address",
      section: "addresses",
      actionText: "Enter home address manually",
    });
  }

  if (isAddressEmpty(settings.workAddress)) {
    incompleteFields.push({
      key: "work_address",
      label: "Work Address",
      section: "addresses",
      actionText: "Pin work office on map",
    });
  }

  const totalCount = 9;
  const completedCount = totalCount - incompleteFields.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return {
    completedCount,
    totalCount,
    percentage,
    incompleteFields,
  };
}
