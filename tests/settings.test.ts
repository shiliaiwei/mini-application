import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  DEFAULT_USER_SETTINGS,
  createInitialSettings,
  calculateAge,
  formatAddressLine,
  isAddressEmpty,
  getProfileCompletion,
} from "../src/lib/userSettings";

test("User Settings: lib/userSettings.ts defines all required standard fields", () => {
  const fields = [
    "photoUrl",
    "firstName",
    "lastName",
    "displayName",
    "gender",
    "email",
    "phone",
    "birthday",
    "language",
    "homeAddress",
    "workAddress",
    "securityQuestion",
    "securityAnswer",
    "telegramCloudSync",
  ];

  for (const field of fields) {
    assert.ok(
      field in DEFAULT_USER_SETTINGS,
      `DEFAULT_USER_SETTINGS must contain field '${field}'`
    );
  }
});

test("User Settings: Home and Work addresses follow standard schema, with security questions", () => {
  const home = DEFAULT_USER_SETTINGS.homeAddress;
  assert.ok("street" in home, "Home address must include street");
  assert.ok("city" in home, "Home address must include city");
  assert.ok("country" in home, "Home address must include country");

  const work = DEFAULT_USER_SETTINGS.workAddress;
  assert.ok("street" in work, "Work address must include street");
  assert.ok("city" in work, "Work address must include city");
  assert.ok("country" in work, "Work address must include country");

  assert.ok("securityQuestion" in DEFAULT_USER_SETTINGS, "Must include securityQuestion");
  assert.ok("securityAnswer" in DEFAULT_USER_SETTINGS, "Must include securityAnswer");
});

test("User Settings: calculateAge calculates correct age from YYYY-MM-DD", () => {
  const age = calculateAge("2000-01-01");
  assert.ok(typeof age === "number" && age >= 24, "Age should be calculated correctly");
  assert.equal(calculateAge(""), null, "Empty birthday string should return null");
});

test("User Settings: formatAddressLine formats structured address into readable string", () => {
  const formatted = formatAddressLine({
    street: "St. 217",
    unit: "Suite 4A",
    city: "Phnom Penh",
    country: "Cambodia",
  });
  assert.ok(formatted.includes("St. 217"));
  assert.ok(formatted.includes("Phnom Penh"));
  assert.ok(formatted.includes("Cambodia"));
});

test("User Settings: createInitialSettings populates from TelegramUser", () => {
  const mockTgUser = {
    id: 12345678,
    first_name: "Tester",
    last_name: "Bot",
    username: "tester_bot",
    photo_url: "https://example.com/avatar.jpg",
    language_code: "km",
  };

  const initial = createInitialSettings(mockTgUser);
  assert.equal(initial.firstName, "Tester");
  assert.equal(initial.lastName, "Bot");
  assert.equal(initial.displayName, "Tester Bot");
  assert.equal(initial.photoUrl, "https://example.com/avatar.jpg");
  assert.equal(initial.language, "km");
});

test("User Settings View: UserSettingsView.tsx exists and implements Telegram WebApp v2 controls", () => {
  const viewPath = path.resolve(__dirname, "../src/components/views/UserSettingsView.tsx");
  assert.ok(fs.existsSync(viewPath), "UserSettingsView.tsx must exist");

  const code = fs.readFileSync(viewPath, "utf-8");
  assert.ok(code.includes("BackButton"), "Must integrate Telegram BackButton");
  assert.ok(code.includes("CloudStorage"), "Must integrate Telegram CloudStorage");
  assert.ok(code.includes("HapticFeedback"), "Must integrate Telegram HapticFeedback");
  assert.ok(code.includes("requestContact"), "Must integrate requestContact for phone");
  assert.ok(code.includes("home_address"), "Must include home address editor");
  assert.ok(code.includes("work_address"), "Must include work address editor");
  assert.ok(code.includes("security_question"), "Must include security question editor");
  assert.ok(code.includes("ThreadStitching"), "Must include 3D perimeter thread stitching");
  assert.ok(code.includes("GuillocheBackground"), "Must include Guilloche banknote styling");
  assert.ok(code.includes("LeatherGrain"), "Must include purple leather texture overlay");
  assert.ok(code.includes("Telegram Bot API Profile"), "Must include Telegram Bot API Profile moved into settings");
});

test("User Settings: Zero Emoji rule is strictly followed", () => {
  const viewPath = path.resolve(__dirname, "../src/components/views/UserSettingsView.tsx");
  const libPath = path.resolve(__dirname, "../src/lib/userSettings.ts");

  const viewCode = fs.readFileSync(viewPath, "utf-8");
  const libCode = fs.readFileSync(libPath, "utf-8");

  // Regex for common emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.equal(emojiRegex.test(viewCode), false, "UserSettingsView must contain NO emojis");
  assert.equal(emojiRegex.test(libCode), false, "userSettings.ts must contain NO emojis");
});

test("Keyline Icons: Zero outside icon libraries across src/", () => {
  function scanDir(dir: string): string[] {
    const files: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...scanDir(full));
      } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
        files.push(full);
      }
    }
    return files;
  }

  const srcFiles = scanDir(path.resolve(__dirname, "../src"));
  for (const file of srcFiles) {
    const code = fs.readFileSync(file, "utf-8");
    assert.equal(
      code.includes('from "lucide-react"'),
      false,
      `File ${file} must NOT import from lucide-react`
    );
    assert.equal(
      code.includes("from 'lucide-react'"),
      false,
      `File ${file} must NOT import from lucide-react`
    );
    assert.equal(
      code.includes("react-icons"),
      false,
      `File ${file} must NOT import from react-icons`
    );
    assert.equal(
      code.includes("@heroicons"),
      false,
      `File ${file} must NOT import from @heroicons`
    );
  }
});

test("Settings View: System Settings, Haptics & Display controls moved to UserSettingsView", () => {
  const settingsPath = path.resolve(__dirname, "../src/components/views/UserSettingsView.tsx");
  const profilePath = path.resolve(__dirname, "../src/components/views/GameProfileView.tsx");

  const settingsCode = fs.readFileSync(settingsPath, "utf-8");
  const profileCode = fs.readFileSync(profilePath, "utf-8");

  // Settings view must have System Settings & Haptics
  assert.ok(settingsCode.includes("System Settings & Haptics"), "Settings must have System Settings & Haptics");
  assert.ok(settingsCode.includes("Haptic Feedback"), "Settings must have Haptic Feedback toggle");
  assert.ok(settingsCode.includes("Test Haptic Feedback Vibrations"), "Settings must have Haptic vibration test suite");
  assert.ok(settingsCode.includes("Game SFX Sound"), "Settings must have Game SFX sound toggle");
  assert.ok(settingsCode.includes("Expand Telegram Viewport"), "Settings must have Viewport expand control");
  assert.ok(settingsCode.includes("Theme Appearance"), "Settings must have Display theme controls");
  assert.ok(settingsCode.includes("SkeuomorphicModalContainer"), "Settings must wrap edit sheets in SkeuomorphicModalContainer");

  // Profile view must NOT contain the bulky System Settings & Haptics card
  assert.equal(
    profileCode.includes("System Settings & Haptics"),
    false,
    "GameProfileView must NOT contain System Settings & Haptics (moved to settings)"
  );
});

test("Address Validation: isAddressEmpty detects incomplete or empty addresses", () => {
  assert.equal(isAddressEmpty(null), true, "null address is empty");
  assert.equal(isAddressEmpty(undefined), true, "undefined address is empty");
  assert.equal(
    isAddressEmpty({ street: "", city: "", country: "" }),
    true,
    "blank address is empty"
  );
  assert.equal(
    isAddressEmpty({ street: "Not set", city: "", country: "Cambodia" }),
    true,
    "'Not set' street is empty"
  );
  assert.equal(
    isAddressEmpty({ street: "St. 217", city: "Phnom Penh", country: "Cambodia" }),
    false,
    "filled address is not empty"
  );
});

test("Profile Completion: getProfileCompletion lists unfilled fields and calculates percentage", () => {
  const emptySettings = {
    ...DEFAULT_USER_SETTINGS,
    photoUrl: "",
    firstName: "",
    lastName: "",
    displayName: "",
    gender: "prefer_not_to_say" as const,
    birthday: "",
    email: "",
    phone: "",
    homeAddress: { street: "", city: "", country: "" },
    workAddress: { street: "", city: "", country: "" },
    securityAnswer: "",
  };

  const completion = getProfileCompletion(emptySettings);
  assert.equal(completion.completedCount, 0, "All fields incomplete");
  assert.equal(completion.percentage, 0, "Percentage should be 0%");
  assert.ok(completion.incompleteFields.length >= 9, "Should list all 9 incomplete fields");
  assert.ok(
    completion.incompleteFields.some((f) => f.key === "home_address"),
    "Should include home_address"
  );
  assert.ok(
    completion.incompleteFields.some((f) => f.key === "email"),
    "Should include email"
  );
});

test("Working Address Map Picker: WorkingAddressMapModal.tsx exists and implements interactive pinpointing", () => {
  const modalPath = path.resolve(
    __dirname,
    "../src/components/modals/WorkingAddressMapModal.tsx"
  );
  assert.ok(fs.existsSync(modalPath), "WorkingAddressMapModal.tsx must exist");

  const modalCode = fs.readFileSync(modalPath, "utf-8");
  assert.ok(modalCode.includes("Confirm & Set Working Address"), "Must have working map confirmation action");
  assert.ok(modalCode.includes("fetchGeocode"), "Must have reverse geocode fetcher");
  assert.ok(modalCode.includes("/api/geocode/locate"), "Must call locate API endpoint");
  assert.ok(modalCode.includes("navigator.geolocation"), "Must support device GPS pinpointing");
  assert.ok(modalCode.includes("PRESET_LOCATIONS"), "Must support delivery preset landmarks");
  assert.ok(modalCode.includes("KeylineIcons"), "Must strictly use official Keyline icons");

  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.equal(emojiRegex.test(modalCode), false, "WorkingAddressMapModal must contain NO emojis");
});

test("Physical Geocoding Endpoint: api/geocode/locate/route.ts exists and handles GPS & IP resolution", () => {
  const routePath = path.resolve(
    __dirname,
    "../src/app/api/geocode/locate/route.ts"
  );
  assert.ok(fs.existsSync(routePath), "api/geocode/locate/route.ts must exist");

  const routeCode = fs.readFileSync(routePath, "utf-8");
  assert.ok(routeCode.includes("nominatim"), "Must use OpenStreetMap Nominatim for physical addresses");
  assert.ok(routeCode.includes("Reverse geocode"), "Must implement reverse geocoding");
  assert.ok(routeCode.includes("x-forwarded-for"), "Must read client IP for network location");

  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert.equal(emojiRegex.test(routeCode), false, "geocode route must contain NO emojis");
});

test("UserSettingsView: Renders interactive map actions and incomplete placeholder alerts", () => {
  const viewPath = path.resolve(__dirname, "../src/components/views/UserSettingsView.tsx");
  const code = fs.readFileSync(viewPath, "utf-8");

  assert.ok(code.includes("WorkingAddressMapModal"), "UserSettingsView must mount WorkingAddressMapModal");
  assert.ok(code.includes("Pin on Working Map"), "Must render working map pin CTA buttons");
  assert.ok(code.includes("Action Required"), "Must render Action Required alert badges");
  assert.ok(code.includes("Profile Readiness:"), "Must render Profile Readiness Banner");
  assert.ok(code.includes("Saved Physical Address"), "Must render saved physical address badge when filled");
});

test("Telegram Profile Photo Sync: createInitialSettings auto-assigns avatar proxy when photo_url is missing", () => {
  const userWithoutPhoto = {
    id: 6600489302,
    first_name: "Kesararam",
    username: "kesararam",
  };
  const settings = createInitialSettings(userWithoutPhoto);
  assert.equal(
    settings.photoUrl,
    "/api/player/avatar?telegram_id=6600489302",
    "Must auto-assign /api/player/avatar?telegram_id=6600489302 when photo_url is omitted"
  );
  assert.equal(settings.photoSource, "telegram", "photoSource should be telegram");
});

test("Telegram Profile Photo Proxy: api/player/avatar/route.ts exists and implements caching and Bot API fetch", () => {
  const avatarRoutePath = path.resolve(
    __dirname,
    "../src/app/api/player/avatar/route.ts"
  );
  assert.ok(fs.existsSync(avatarRoutePath), "api/player/avatar/route.ts must exist");

  const code = fs.readFileSync(avatarRoutePath, "utf-8");
  assert.ok(code.includes("getUserProfilePhotos"), "Must call getUserProfilePhotos");
  assert.ok(code.includes("getFile"), "Must call getFile");
  assert.ok(code.includes("Cache-Control"), "Must include HTTP caching headers");
  assert.ok(code.includes("createDefaultAvatarSvg"), "Must provide SVG fallback when no photo");
});


