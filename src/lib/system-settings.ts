import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "system-settings.json");

export interface SystemSettings {
  isRegistrationClosed: boolean;
  isRanked: boolean;
  /** ISO date-time of the application deadline (used by the countdown). Optional. */
  registrationCloseAt?: string | null;
}

const DEFAULT_SETTINGS: SystemSettings = {
  isRegistrationClosed: false,
  isRanked: false,
  registrationCloseAt: null,
};

/**
 * Reads and parses the persistent JSON settings from the filesystem.
 */
export function getSystemSettings(): SystemSettings {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      return DEFAULT_SETTINGS;
    }
    const content = fs.readFileSync(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return {
      isRegistrationClosed: !!parsed.isRegistrationClosed,
      isRanked: !!parsed.isRanked,
      registrationCloseAt: parsed.registrationCloseAt ?? null,
    };
  } catch (error) {
    console.error("Error reading system settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Writes the updated system settings JSON back to the filesystem.
 */
export function saveSystemSettings(settings: SystemSettings): void {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing system settings:", error);
  }
}
