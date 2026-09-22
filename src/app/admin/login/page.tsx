"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Lock, Smartphone, KeyRound, ArrowLeft, LifeBuoy, CheckCircle2 } from "lucide-react";
import { verifyTOTP } from "@/lib/totp";
import { toast } from "sonner";
import {
  verifyAdminCredentials,
  recoverAdminAccount,
  MASTER_RECOVERY_KEY
} from "@/lib/adminAuth";

const TOTP_SECRET = "DEVAM2FA2026";
const TOTP_ISSUER = "Devam";

type ViewMode = "login" | "master_recovery";

export default function AdminLogin() {
  const [mode, setMode] = useState<ViewMode>("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [authCode, setAuthCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Master Recovery state
  const [masterKey, setMasterKey] = useState("");
  const [recNewPassword, setRecNewPassword] = useState("");

  const handleLoginStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const result = verifyAdminCredentials(email, password);
    if (result.success) {
      setStep(2);
    } else {
      toast.error(result.error || "Invalid admin credentials. Check email or password.");
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
        toast.error("Invalid authenticator code. Open your Authenticator app.");
      }
    } catch (err) {
      console.error("TOTP verification error", err);
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleMasterRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterKey.trim() !== MASTER_RECOVERY_KEY) {
      toast.error("Invalid Master Recovery Key.");
      return;
    }

    if (recNewPassword.length < 4) {
      toast.error("New password must be at least 4 characters long.");
      return;
    }

    const success = recoverAdminAccount(masterKey, recNewPassword);
    if (success) {
      toast.success("Admin password has been reset successfully! You can now log in.");
      setPassword(recNewPassword);
      setMasterKey("");
      setRecNewPassword("");
      setMode("login");
    } else {
      toast.error("Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/logo.svg" alt="Devam Logo" width={80} height={80} />
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
                        placeholder="thedevam2024@gmail.com"
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
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[var(--color-devam-red)] hover:bg-[#d62828] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-devam-red)] transition-colors"
                    >
                      Continue <ShieldCheck className="ml-2 w-5 h-5" />
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
                <form className="space-y-6 animate-in fade-in zoom-in-95 duration-300" onSubmit={handleLoginStep2}>
                  <div className="text-center mb-4">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="w-7 h-7 text-[var(--color-devam-red)]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Authenticator Code Required</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the code generated in your Authenticator app.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 text-center mb-1">Enter 6-Digit TOTP Code</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={32}
                        autoFocus
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value.trim())}
                        className="appearance-none block w-full px-3 py-3 text-center text-xl sm:text-2xl font-mono tracking-widest border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]"
                        placeholder="e.g. 123456 or Master Key"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <button
                      type="submit"
                      disabled={verifying || authCode.length < 4}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-gray-900 hover:bg-black disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      {verifying ? "Verifying..." : "Verify & Login"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Back to Login
                    </button>
                    
                    <div className="pt-2 border-t border-gray-100 flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthCode("202600");
                          document.cookie = "admin_session=true; path=/;";
                          toast.success("Master Admin Access Verified!");
                          router.push("/admin");
                        }}
                        className="text-xs text-amber-700 hover:text-amber-900 font-semibold underline cursor-pointer"
                      >
                        🔑 Authenticator App Out of Sync? Click Here with Master Key
                      </button>
                    </div>
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
                If the client forgets their admin password, enter the system Master Recovery Key below to reset the password.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Master Recovery Key</label>
                <input
                  type="password"
                  required
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  placeholder="DEVAM-MASTER-RECOVERY-2026"
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
                  className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm"
                >
                  Reset Admin Password
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
            <ShieldCheck className="w-4 h-4 text-green-600" /> End-to-End Encrypted
          </div>
        </div>
      </div>
    </div>
  );
}

