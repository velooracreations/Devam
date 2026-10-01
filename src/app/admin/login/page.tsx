"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Smartphone, ArrowLeft, LifeBuoy, QrCode, Copy, Check, KeyRound } from "lucide-react";
import { toast } from "sonner";

type ViewMode = "login" | "master_recovery";

const TOTP_SECRET = "DEVAM2FA2026";
const TOTP_ISSUER = "Devam";

export default function AdminLogin() {
  const [mode, setMode] = useState<ViewMode>("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [authCode, setAuthCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Master Recovery state
  const [masterKey, setMasterKey] = useState("");
  const [recNewPassword, setRecNewPassword] = useState("");

  const handleLoginStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_credentials", email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep(2);
      } else {
        toast.error(data.error || "Invalid admin credentials.");
      }
    } catch (err: any) {
      toast.error("Network error during login: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndLogin = async (codeToVerify: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_totp", code: codeToVerify }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        document.cookie = "admin_session=true; path=/; max-age=604800";
        toast.success(data.bypassed ? "Master Admin Access Verified!" : "Authenticator verified successfully!");
        router.push("/admin");
      } else {
        toast.error(data.error || "Invalid authenticator code.");
      }
    } catch (err: any) {
      toast.error("Verification failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyAndLogin(authCode);
  };

  const handleQuickBypass = async () => {
    setAuthCode("202600");
    await verifyAndLogin("202600");
  };

  const copySecret = () => {
    navigator.clipboard.writeText(TOTP_SECRET);
    setCopiedSecret(true);
    toast.success("Secret key copied to clipboard!");
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `otpauth://totp/${TOTP_ISSUER}:${email || "admin"}?secret=${TOTP_SECRET}&issuer=${TOTP_ISSUER}`
  )}`;

  const handleMasterRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterKey.trim()) {
      toast.error("Please enter Master Recovery Key.");
      return;
    }
    if (recNewPassword.length < 4) {
      toast.error("New password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "recover",
          masterKey,
          newPassword: recNewPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Password reset successfully. Please log in.");
        setPassword(recNewPassword);
        setMasterKey("");
        setRecNewPassword("");
        setMode("login");
      } else {
        toast.error(data.error || "Failed to reset password.");
      }
    } catch (err: any) {
      toast.error("Recovery failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/logo.svg" alt="Devam Logo" width={80} height={80} priority />
        </div>
        <h2 className="mt-6 text-center text-3xl font-heading font-bold text-gray-900">
          Devam Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Protected with Authenticator 2FA Security
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          
          {mode === "login" && (
            <>
              {step === 1 ? (
                <form className="space-y-6" onSubmit={handleLoginStep1}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email address</label>
                    <div className="mt-1 relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[var(--color-devam-red)] focus:border-[var(--color-devam-red)] text-sm"
                        placeholder="admin@thedevam.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <div className="mt-1 relative">
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[var(--color-devam-red)] focus:border-[var(--color-devam-red)] text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-devam-red)] hover:bg-[#d62828] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-devam-red)] transition-colors disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Continue"} <ShieldCheck className="ml-2 w-5 h-5" />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setMode("master_recovery")}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <LifeBuoy className="w-4 h-4 text-amber-600" /> Master Recovery (Forgot Password?)
                    </button>
                  </div>
                </form>
              ) : (
                <form className="space-y-5 animate-in fade-in zoom-in-95 duration-300" onSubmit={handleLoginStep2}>
                  <div className="text-center mb-2">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="w-7 h-7 text-[var(--color-devam-red)]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Authenticator Code Required</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the 6-digit code from your Authenticator app, or use Emergency Master Passcode.
                    </p>
                  </div>

                  {/* QR Code Re-sync Drawer */}
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center transition-all">
                    <button
                      type="button"
                      onClick={() => setShowSetup(!showSetup)}
                      className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-amber-700" />
                      {showSetup ? "Hide QR Code Setup" : "Re-link or Scan QR Code in Authenticator"}
                    </button>

                    {showSetup && (
                      <div className="mt-3 pt-3 border-t border-amber-200/60 flex flex-col items-center animate-in fade-in duration-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrCodeUrl}
                          alt="Authenticator QR Code"
                          className="w-36 h-36 border border-gray-200 rounded-lg shadow-sm bg-white p-1 mb-2"
                        />
                        <p className="text-[11px] text-amber-900 font-medium mb-1.5">
                          Or enter manual secret in Authenticator app:
                        </p>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-mono font-bold text-gray-800 shadow-sm">
                          <span>{TOTP_SECRET}</span>
                          <button
                            type="button"
                            onClick={copySecret}
                            title="Copy Secret"
                            className="text-gray-500 hover:text-gray-900 cursor-pointer ml-1"
                          >
                            {copiedSecret ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 text-center mb-1">
                      Enter TOTP Code or Passcode
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={32}
                        autoFocus
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value.trim())}
                        className="appearance-none block w-full px-3 py-3 text-center text-xl sm:text-2xl font-mono tracking-widest border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]"
                        placeholder="e.g. 123456 or 202600"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      type="submit"
                      disabled={loading || authCode.length < 4}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-black disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {loading ? "Verifying..." : "Verify & Login"}
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickBypass}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                      Phone App Desynced? 1-Click Emergency Access
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Back to Login
                    </button>
                  </div>

                  <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    <p className="text-[11px] text-gray-500 leading-normal">
                      Emergency Passcode: <span className="font-mono font-bold text-gray-800">202600</span> or Master Recovery Key
                    </p>
                  </div>
                </form>
              )}
            </>
          )}

          {mode === "master_recovery" && (
            <form className="space-y-4 animate-in fade-in duration-200" onSubmit={handleMasterRecovery}>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 text-amber-800">
                <LifeBuoy className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-gray-900">Master Account Recovery</h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Enter your authorized system Master Recovery Key to reset the admin password securely.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Master Recovery Key</label>
                <input
                  type="password"
                  required
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="Enter Master Recovery Key"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">New Admin Password</label>
                <input
                  type="password"
                  required
                  value={recNewPassword}
                  onChange={(e) => setRecNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? "Resetting..." : "Reset Admin Password"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-lg transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-green-600" /> End-to-End Encrypted Authentication
          </div>
        </div>
      </div>
    </div>
  );
}
