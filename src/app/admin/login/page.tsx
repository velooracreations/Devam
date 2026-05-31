"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Lock, QrCode } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [authCode, setAuthCode] = useState("");

  const handleLoginStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@example.com" && password === "admin123") {
      setStep(2);
    } else {
      alert("Invalid credentials. Try admin@example.com / admin123");
    }
  };

  const handleLoginStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    // MOCK 2FA Verification (Accepts 123456)
    if (authCode === "123456") {
      document.cookie = "admin_session=true; path=/;";
      router.push("/admin");
    } else {
      alert("Invalid authenticator code. Try 123456");
    }
  };

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
          Authorized personnel only.
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
                  placeholder="admin@example.com"
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[var(--color-devam-red)] focus:ring-[var(--color-devam-red)] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
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
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-[var(--color-devam-red)]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code from your Authenticator app.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 text-center">Authenticator Code</label>
                <div className="mt-2 relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none block w-full px-3 py-4 text-center text-2xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[var(--color-devam-red)] focus:border-[var(--color-devam-red)]"
                    placeholder="------"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                >
                  Verify Code
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
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
