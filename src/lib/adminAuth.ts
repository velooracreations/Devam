export const DEFAULT_ADMIN_EMAILS = [
  "thedevam2024@gmail.com",
  "info@thedevam.com",
  "admin@thedevam.com",
  "admin@example.com"
];

export const DEFAULT_ADMIN_PASSWORD = "Devam@#2024";

export const MASTER_RECOVERY_KEY = "DEVAM-MASTER-RECOVERY-2026";
export const MASTER_ADMIN_EMAIL = "master@thedevam.com";

export function getAdminEmails(): string[] {
  if (typeof window === "undefined") return DEFAULT_ADMIN_EMAILS;
  try {
    const saved = localStorage.getItem("devam_admin_emails");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading admin emails", e);
  }
  return DEFAULT_ADMIN_EMAILS;
}

export function addAdminEmail(email: string): boolean {
  if (typeof window === "undefined") return false;
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) return false;

  const current = getAdminEmails();
  if (!current.includes(cleanEmail)) {
    const updated = [...current, cleanEmail];
    localStorage.setItem("devam_admin_emails", JSON.stringify(updated));
    return true;
  }
  return false;
}

export function removeAdminEmail(email: string): boolean {
  if (typeof window === "undefined") return false;
  const cleanEmail = email.trim().toLowerCase();
  const current = getAdminEmails();
  if (current.length <= 1) return false; // keep at least 1 admin

  const updated = current.filter((e) => e !== cleanEmail);
  localStorage.setItem("devam_admin_emails", JSON.stringify(updated));
  return true;
}

export function getAdminPassword(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PASSWORD;
  try {
    const saved = localStorage.getItem("devam_admin_password");
    if (saved) return saved;
  } catch (e) {
    console.error("Error reading admin password", e);
  }
  return DEFAULT_ADMIN_PASSWORD;
}

export function setAdminPassword(newPassword: string): boolean {
  if (typeof window === "undefined") return false;
  if (!newPassword || newPassword.length < 4) return false;
  localStorage.setItem("devam_admin_password", newPassword);
  return true;
}

interface LockoutState {
  attempts: number;
  lockUntil: number | null; // Epoch timestamp in ms
}

const LOCKOUT_KEY = "devam_admin_lockout";

function getLockoutState(): LockoutState {
  if (typeof window === "undefined") return { attempts: 0, lockUntil: null };
  try {
    const saved = localStorage.getItem(LOCKOUT_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Error reading lockout state", e);
  }
  return { attempts: 0, lockUntil: null };
}

function setLockoutState(state: LockoutState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving lockout state", e);
  }
}

export function resetLockoutState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOCKOUT_KEY);
}

export function getRemainingLockoutSeconds(): number {
  const state = getLockoutState();
  if (!state.lockUntil) return 0;
  const now = Date.now();
  if (now >= state.lockUntil) {
    return 0;
  }
  return Math.ceil((state.lockUntil - now) / 1000);
}

/**
 * Returns lockout duration in milliseconds based on attempt count:
 * - Attempts 1 to 5: No lockout (0 ms)
 * - 6th failed attempt: 1 min (60,000 ms)
 * - 7th failed attempt: 15 min (900,000 ms)
 * - 8th failed attempt: 1 hr (3,600,000 ms)
 * - 9th+ failed attempt: 24 hr (86,400,000 ms)
 */
function getLockoutDurationMs(failedCount: number): number {
  if (failedCount <= 5) return 0;
  if (failedCount === 6) return 1 * 60 * 1000;          // 1 Minute
  if (failedCount === 7) return 15 * 60 * 1000;         // 15 Minutes
  if (failedCount === 8) return 60 * 60 * 1000;         // 1 Hour
  return 24 * 60 * 60 * 1000;                            // 24 Hours
}

export function recordFailedAttempt(): { remainingSec: number; attempts: number } {
  const current = getLockoutState();
  const now = Date.now();
  
  // If previously locked but lock period expired, keep attempt count or increment
  const newAttempts = current.attempts + 1;
  const lockMs = getLockoutDurationMs(newAttempts);
  const lockUntil = lockMs > 0 ? now + lockMs : null;

  const newState: LockoutState = {
    attempts: newAttempts,
    lockUntil
  };

  setLockoutState(newState);

  return {
    remainingSec: lockMs > 0 ? Math.ceil(lockMs / 1000) : 0,
    attempts: newAttempts
  };
}

export function verifyAdminCredentials(email: string, pass: string): { success: boolean; error?: string; remainingSec?: number; attempts?: number } {
  const remSec = getRemainingLockoutSeconds();
  if (remSec > 0) {
    const currentState = getLockoutState();
    return {
      success: false,
      error: `Too many failed attempts. Account locked. Please wait ${formatDuration(remSec)}.`,
      remainingSec: remSec,
      attempts: currentState.attempts
    };
  }

  // Check master key bypass / master login
  if (pass === MASTER_RECOVERY_KEY) {
    resetLockoutState();
    return { success: true };
  }

  const allowed = getAdminEmails();
  const validPass = getAdminPassword();
  const cleanEmail = email.trim().toLowerCase();

  const isValid = allowed.includes(cleanEmail) && pass === validPass;

  if (isValid) {
    resetLockoutState();
    return { success: true };
  } else {
    const failInfo = recordFailedAttempt();
    if (failInfo.remainingSec > 0) {
      return {
        success: false,
        error: `Too many wrong entries (${failInfo.attempts} times). Account locked! Please wait ${formatDuration(failInfo.remainingSec)}.`,
        remainingSec: failInfo.remainingSec,
        attempts: failInfo.attempts
      };
    }
    return {
      success: false,
      error: `Invalid credentials. (${failInfo.attempts}/5 allowed attempts before lockout)`,
      attempts: failInfo.attempts
    };
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  if (seconds < 3600) {
    const mins = Math.ceil(seconds / 60);
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }
  const hrs = Math.ceil(seconds / 3600);
  return `${hrs} hour${hrs !== 1 ? 's' : ''}`;
}

export function recoverAdminAccount(masterKey: string, newPassword: string): boolean {
  if (masterKey.trim() !== MASTER_RECOVERY_KEY) return false;
  const ok = setAdminPassword(newPassword);
  if (ok) resetLockoutState();
  return ok;
}
