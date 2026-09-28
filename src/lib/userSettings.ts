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

  // 7. Language
  language: string; // "en" | "km" | "zh" | "ru"

  // 8. Addresses
  homeAddress: AddressDetails;
  workAddress: AddressDetails;
  otherAddress: OtherAddressDetails;

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
  firstName: "SREIVEY",
  lastName: "PRO",
  displayName: "SREIVEY PRO",
  nickname: "Weibot Master",
  gender: "prefer_not_to_say",
  customGender: "",
  email: "sreivey.pro@kesararamwithdigital.tech",
  emailVerified: true,
  phone: "+855 96 888 8888",
  phoneVerified: true,
  phoneSource: "telegram",
  birthday: "1998-08-18",
  showBirthdayYear: true,
  language: "en",
  homeAddress: {
    street: "St. 217, Monireth Blvd",
    unit: "Building 88, Suite 4A",
    city: "Phnom Penh",
    stateProvince: "Khan 7 Makara",
    postalCode: "12253",
    country: "Cambodia",
  },
  workAddress: {
    street: "Preah Sihanouk Blvd",
    unit: "Floor 16, Canadia Tower",
    city: "Phnom Penh",
    stateProvince: "Daun Penh",
    postalCode: "120211",
    country: "Cambodia",
  },
  otherAddress: {
    label: "Warehouse / Delivery Hub",
    street: "National Road 4, Phum Prey Chusak",
    unit: "Gate 2, LogiCenter",
    city: "Phnom Penh",
    stateProvince: "Kamboul",
    postalCode: "120902",
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

  const fName = user.first_name || base.firstName;
  const lName = user.last_name || "";
  const dName = [fName, lName].filter(Boolean).join(" ") || base.displayName;

  return {
    ...base,
    photoUrl: user.photo_url || base.photoUrl,
    photoSource: user.photo_url ? "telegram" : "preset",
    firstName: fName,
    lastName: lName,
    displayName: dName,
    language: user.language_code ? (["en", "km", "zh", "ru"].includes(user.language_code) ? user.language_code : "en") : "en",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Synchronously loads cached settings from localStorage
 */
export function loadCachedUserSettings(user: TelegramUser | null): UserSettings {
  if (typeof window === "undefined") {
    return createInitialSettings(user);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          ...createInitialSettings(user),
          ...parsed,
          homeAddress: { ...DEFAULT_USER_SETTINGS.homeAddress, ...(parsed.homeAddress || {}) },
          workAddress: { ...DEFAULT_USER_SETTINGS.workAddress, ...(parsed.workAddress || {}) },
          otherAddress: { ...DEFAULT_USER_SETTINGS.otherAddress, ...(parsed.otherAddress || {}) },
        };
      }
    }
  } catch {}

  return createInitialSettings(user);
}

/**
 * Asynchronously checks and syncs settings from Telegram CloudStorage
 */
export function loadTelegramCloudSettings(
  tgApp: TelegramWebApp | null,
  callback: (settings: UserSettings) => void
): void {
  if (!tgApp?.CloudStorage?.getItem) {
    return;
  }

  try {
    tgApp.CloudStorage.getItem(STORAGE_KEY, (err, val) => {
      if (!err && val && typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (parsed && typeof parsed === "object") {
            const merged: UserSettings = {
              ...DEFAULT_USER_SETTINGS,
              ...parsed,
              homeAddress: { ...DEFAULT_USER_SETTINGS.homeAddress, ...(parsed.homeAddress || {}) },
              workAddress: { ...DEFAULT_USER_SETTINGS.workAddress, ...(parsed.workAddress || {}) },
              otherAddress: { ...DEFAULT_USER_SETTINGS.otherAddress, ...(parsed.otherAddress || {}) },
            };
            // Cache to localStorage
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            callback(merged);
          }
        } catch {}
      }
    });
  } catch {}
}

/**
 * Persists settings to localStorage and Telegram CloudStorage
 */
export function saveUserSettings(
  settings: UserSettings,
  tgApp: TelegramWebApp | null
): void {
  const updated: UserSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  const str = JSON.stringify(updated);

  // 1. localStorage cache
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, str);
    } catch {}
  }

  // 2. Telegram CloudStorage
  if (tgApp?.CloudStorage?.setItem && settings.telegramCloudSync) {
    try {
      tgApp.CloudStorage.setItem(STORAGE_KEY, str, (err, ok) => {
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

  if (isAddressEmpty(settings.homeAddress)) {
    incompleteFields.push({
      key: "home_address",
      label: "Home Address",
      section: "addresses",
      actionText: "Pin home delivery location",
    });
  }

  if (isAddressEmpty(settings.workAddress)) {
    incompleteFields.push({
      key: "work_address",
      label: "Work Address",
      section: "addresses",
      actionText: "Pin office address",
    });
  }

  if (isAddressEmpty(settings.otherAddress)) {
    incompleteFields.push({
      key: "other_address",
      label: "Other Address",
      section: "addresses",
      actionText: "Pin secondary warehouse",
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
