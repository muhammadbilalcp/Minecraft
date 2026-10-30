export const OWNER_EMAILS = [
  "muhammadbilalcp@gmail.com",
  "mongolance080@gmail.com",
];

export interface PalaceSecurityConfig {
  gateMode: "private" | "open";
  whitelist: string[];
}

const STORAGE_KEY = "bilal_palace_security";
const USER_KEY = "bilal_current_user_email";

class OwnerAuthManager {
  private config: PalaceSecurityConfig;
  private currentUserEmail: string;

  constructor() {
    this.currentUserEmail =
      localStorage.getItem(USER_KEY) || "mongolance080@gmail.com";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.config = JSON.parse(saved);
      } catch (e) {
        this.config = { gateMode: "private", whitelist: [] };
      }
    } else {
      this.config = { gateMode: "private", whitelist: [] };
    }
  }

  getCurrentUser(): { email: string; isOwner: boolean } {
    return {
      email: this.currentUserEmail,
      isOwner: this.isOwner(this.currentUserEmail),
    };
  }

  setCurrentUser(email: string) {
    this.currentUserEmail = email.trim().toLowerCase();
    localStorage.setItem(USER_KEY, this.currentUserEmail);
    window.dispatchEvent(new CustomEvent("owner_auth_changed"));
  }

  isOwner(email?: string): boolean {
    const e = (email || this.currentUserEmail).trim().toLowerCase();
    return OWNER_EMAILS.includes(e);
  }

  canAccessPalace(email?: string): boolean {
    const e = (email || this.currentUserEmail).trim().toLowerCase();
    if (this.isOwner(e)) return true;
    if (this.config.gateMode === "open") return true;
    return this.config.whitelist.includes(e);
  }

  getSecurityConfig(): PalaceSecurityConfig {
    return { ...this.config };
  }

  setGateMode(mode: "private" | "open") {
    this.config.gateMode = mode;
    this.save();
    window.dispatchEvent(new CustomEvent("owner_auth_changed"));
  }

  addGuest(email: string): boolean {
    const clean = email.trim().toLowerCase();
    if (!clean || this.config.whitelist.includes(clean)) return false;
    this.config.whitelist.push(clean);
    this.save();
    window.dispatchEvent(new CustomEvent("owner_auth_changed"));
    return true;
  }

  removeGuest(email: string) {
    const clean = email.trim().toLowerCase();
    this.config.whitelist = this.config.whitelist.filter((g) => g !== clean);
    this.save();
    window.dispatchEvent(new CustomEvent("owner_auth_changed"));
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
  }
}

export const ownerAuth = new OwnerAuthManager();
