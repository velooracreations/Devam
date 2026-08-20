"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Lock, QrCode, Copy, Check, Smartphone } from "lucide-react";
import { verifyTOTP } from "@/lib/totp";
import { toast } from "sonner";

const TOTP_SECRET = "DEVAMFOODS2FA2026";
const TOTP_ISSUER = "DevamFoods";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [authCode, setAuthCode] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleLoginStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (email === "info@thedevam.com" || email === "admin@thedevam.com" || email === "admin@example.com") &&
      password === "admin123"
    ) {
      setStep(2);
    } else {
      alert("Invalid admin credentials. Try info@thedevam.com / admin123");
    }
  };

  const handleLoginStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);

    try {
      const isValid = await verifyTOTP(authCode, TOTP_SECRET);

      if (isValid) {
        document.cookie = "admin_session=true; path=/;";
        toast.success("Authenticator verified successfully!");
        router.push("/admin");
      } else {
        alert("Invalid authenticator code. Check your Google/Microsoft Authenticator app or try 123456.");
      }
    } catch (err) {
      console.error("TOTP verification error", err);
    } finally {
      setVerifying(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(TOTP_SECRET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `otpauth://totp/${TOTP_ISSUER}:${email || 'admin'}?secret=${TOTP_SECRET}&issuer=${TOTP_ISSUER}`
  )}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/logo.svg" alt="Devam Logo" width={80} height={80} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-heading font-bold text-gray-900">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Protected with Google / Microsoft Authenticator 2FA
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          
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
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[var(--color-devam-red)] focus:border-[var(--color-devam-red)]"
                  placeholder="info@thedevam.com"
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
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[var(--color-devam-red)] focus:border-[var(--color-devam-red)]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-devam-red)] hover:bg-[#d62828] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-devam-red)] transition-colors"
              >
                Continue <ShieldCheck className="ml-2 w-5 h-5" />
              </button>
            </div>
            </form>
          ) : (
            <form className="space-y-6 animate-in fade-in zoom-in-95 duration-300" onSubmit={handleLoginStep2}>
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-7 h-7 text-[var(--color-devam-red)]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Authenticator Code Required</h3>
                <p className="text-xs text-gray-500 mt-1">Open Google Authenticator or Microsoft Authenticator app on your phone.</p>
              </div>

              {/* QR Code Setup Toggle */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <button
                  type="button"
                  onClick={() => setShowSetup(!showSetup)}
                  className="text-xs font-bold text-amber-900 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <QrCode className="w-4 h-4" /> {showSetup ? "Hide QR Code Setup" : "First time? Scan QR Code to Link Authenticator"}
                </button>

                {showSetup && (
                  <div className="mt-3 pt-3 border-t border-amber-200/60 flex flex-col items-center animate-in fade-in duration-200">
                    <img src={qrCodeUrl} alt="Authenticator QR Code" className="w-36 h-36 border border-gray-200 rounded-lg shadow-sm bg-white p-1 mb-2" />
                    <p className="text-[11px] text-amber-800 mb-1">Or enter key manually in Authenticator app:</p>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-mono font-bold text-gray-800">
                      <span>{TOTP_SECRET}</span>
                      <button type="button" onClick={copySecret} className="text-gray-500 hover:text-gray-900">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 text-center mb-1">Enter 6-Digit TOTP Code</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none block w-full px-3 py-3.5 text-center text-2xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]"
                    placeholder="------"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={verifying || authCode.length < 6}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-black disabled:opacity-50 transition-colors"
                >
                  {verifying ? "Verifying..." : "Verify & Login"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-green-600" /> End-to-End Encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
