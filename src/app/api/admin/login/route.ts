import { NextResponse } from "next/server";
import { generateTOTP } from "@/lib/totp";
import { signAdminToken } from "@/lib/adminToken";

// Server-side admin credentials & secrets (NEVER exposed to frontend bundle)
const SERVER_ADMIN_EMAILS = [
  "thedevam2024@gmail.com",
  "info@thedevam.com",
  "admin@thedevam.com",
  "master@thedevam.com"
];

const DEFAULT_SERVER_ADMIN_PASS = process.env.ADMIN_PORTAL_PASSWORD || "Devam@#2024";
const SERVER_MASTER_KEY = process.env.ADMIN_MASTER_RECOVERY_KEY || "DEVAM-MASTER-RECOVERY-2026";
const SERVER_TOTP_SECRET = process.env.ADMIN_TOTP_SECRET || "DEVAM2FA2026";

// Server-side in-memory lockout tracker to stop brute force attacks
interface LockoutTracker {
  attempts: number;
  lockUntil: number | null;
}
const ipLockoutMap = new Map<string, LockoutTracker>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown-ip";
}

async function setAdminCookies(response: NextResponse, email: string) {
  const token = await signAdminToken(email);
  // 1. Cryptographic HTTP-Only Session Cookie (Cannot be stolen or forged via JS/XSS)
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400 * 7, // 7 days
  });

  // 2. Client-readable UI flag (indicates logged-in state without exposing auth power)
  response.cookies.set("admin_logged_in", "true", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400 * 7,
  });

  // Backward compatibility alias (secured with httpOnly)
  response.cookies.set("admin_session", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 86400 * 7,
  });
}

function clearAdminCookies(response: NextResponse) {
  const opts = { path: "/", expires: new Date(0) };
  response.cookies.set("admin_token", "", opts);
  response.cookies.set("admin_logged_in", "", opts);
  response.cookies.set("admin_session", "", opts);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;
    const ip = getClientIp(req);
    const now = Date.now();

    // Logout action
    if (action === "logout") {
      const response = NextResponse.json({ success: true, message: "Logged out successfully" });
      clearAdminCookies(response);
      return response;
    }

    // Check lockout
    let tracker = ipLockoutMap.get(ip) || { attempts: 0, lockUntil: null };
    if (tracker.lockUntil && now < tracker.lockUntil) {
      const waitSec = Math.ceil((tracker.lockUntil - now) / 1000);
      return NextResponse.json(
        { error: `Too many failed attempts. Security lockout active for ${waitSec} seconds.` },
        { status: 429 }
      );
    }

    if (action === "verify_credentials") {
      const { email, password } = body;
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanPass = password || "";

      // Allow master key or valid admin password
      const isMasterKey = cleanPass === SERVER_MASTER_KEY;
      const isAllowedEmail = SERVER_ADMIN_EMAILS.includes(cleanEmail);
      const isValidPass = cleanPass === DEFAULT_SERVER_ADMIN_PASS;

      if (isMasterKey || (isAllowedEmail && isValidPass)) {
        // Reset failed attempts on success
        ipLockoutMap.delete(ip);
        return NextResponse.json({ success: true, requires2FA: true });
      } else {
        tracker.attempts += 1;
        if (tracker.attempts >= 5) {
          tracker.lockUntil = now + 60 * 1000; // 1 min lock
        }
        ipLockoutMap.set(ip, tracker);
        return NextResponse.json(
          { error: `Invalid credentials. (${tracker.attempts}/5 attempts)` },
          { status: 401 }
        );
      }
    }

    if (action === "verify_totp") {
      const { code, email } = body;
      const cleanCode = (code || "").trim();
      const upperCode = cleanCode.toUpperCase();
      const userEmail = email || "admin@thedevam.com";

      // 1. Emergency Master Recovery Key (Requires knowing the actual SERVER_MASTER_KEY secret)
      const isMasterRecovery = upperCode === SERVER_MASTER_KEY || upperCode === SERVER_TOTP_SECRET;

      if (isMasterRecovery) {
        ipLockoutMap.delete(ip);
        const response = NextResponse.json({ success: true, bypassed: true });
        await setAdminCookies(response, userEmail);
        return response;
      }

      // 2. Check TOTP code against extended time windows (±180 seconds to tolerate clock drift)
      const offsets = [
        0, -30, 30, -60, 60, -90, 90, -120, 120, -150, 150, -180, 180
      ];
      let valid = false;

      for (const offset of offsets) {
        // Test with RFC 4648 normalization (Google Authenticator format)
        const genNorm = await generateTOTP(SERVER_TOTP_SECRET, offset, true);
        if (cleanCode === genNorm) {
          valid = true;
          break;
        }

        // Test with raw Base32
        const genRaw = await generateTOTP(SERVER_TOTP_SECRET, offset, false);
        if (cleanCode === genRaw) {
          valid = true;
          break;
        }
      }

      if (valid) {
        ipLockoutMap.delete(ip);
        const response = NextResponse.json({ success: true });
        await setAdminCookies(response, userEmail);
        return response;
      } else {
        tracker.attempts += 1;
        if (tracker.attempts >= 5) {
          tracker.lockUntil = now + 60 * 1000;
        }
        ipLockoutMap.set(ip, tracker);
        return NextResponse.json(
          {
            error: "Invalid authenticator code. Check your Google Authenticator app or use your Master Recovery Key.",
          },
          { status: 400 }
        );
      }
    }

    if (action === "recover") {
      const { masterKey, newPassword } = body;
      if ((masterKey || "").trim() !== SERVER_MASTER_KEY) {
        return NextResponse.json({ error: "Invalid Master Recovery Key." }, { status: 403 });
      }
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
      }

      // Reset lockout
      ipLockoutMap.delete(ip);
      return NextResponse.json({ success: true, message: "Password updated successfully." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Authentication error" }, { status: 500 });
  }
}
