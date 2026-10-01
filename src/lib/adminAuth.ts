export const DEFAULT_ADMIN_EMAILS = [
  "thedevam2024@gmail.com",
  "info@thedevam.com",
  "admin@thedevam.com",
  "admin@example.com"
];

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
  if (current.length <= 1) return false;

  const updated = current.filter((e) => e !== cleanEmail);
  localStorage.setItem("devam_admin_emails", JSON.stringify(updated));
  return true;
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
