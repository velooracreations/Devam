"use client";

import { useState, useEffect } from "react";
import { Mail, Moon, Sun, Save, UserPlus, Trash2, KeyRound, Shield, QrCode, Copy, Check, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import {
  getAdminEmails,
  addAdminEmail,
  removeAdminEmail,
  setAdminPassword,
  getAdminPassword,
  MASTER_RECOVERY_KEY
} from "@/lib/adminAuth";

const TOTP_SECRET = "DEVAM2FA2026";
const TOTP_ISSUER = "Devam";

export default function AdminSettingsPage() {
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrEmail, setQrEmail] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setAdminEmails(getAdminEmails());
  }, []);

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const ok = addAdminEmail(newEmail);
    if (ok) {
      toast.success(`Added ${newEmail} to admin users.`);
      setAdminEmails(getAdminEmails());
      setQrEmail(newEmail);
      setShowQRModal(true);
      setNewEmail("");
    } else {
      toast.error("User already exists or email is invalid.");
    }
  };

  const handleRemoveAdmin = (emailToRemove: string) => {
    if (adminEmails.length <= 1) {
      toast.error("Cannot remove the last remaining admin.");
      return;
    }

    const ok = removeAdminEmail(emailToRemove);
    if (ok) {
      toast.success(`Removed ${emailToRemove} from admin users.`);
      setAdminEmails(getAdminEmails());
    } else {
      toast.error("Failed to remove admin user.");
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const actualPass = getAdminPassword();
    if (currentPass !== actualPass) {
      toast.error("Current password is incorrect.");
      return;
    }
    if (newPass.length < 4) {
      toast.error("New password must be at least 4 characters.");
      return;
    }
    if (newPass !== confirmPass) {
      toast.error("New passwords do not match.");
      return;
    }

    const ok = setAdminPassword(newPass);
    if (ok) {
      toast.success("Admin password changed successfully!");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } else {
      toast.error("Failed to change password.");
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(TOTP_SECRET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `otpauth://totp/${TOTP_ISSUER}:${qrEmail || 'admin'}?secret=${TOTP_SECRET}&issuer=${TOTP_ISSUER}`
  )}`;

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
        <p className="text-gray-500 mt-1">Manage administrator accounts, 2FA setup, security credentials, and dashboard preferences.</p>
      </div>

      {/* Admin User Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--color-devam-red)]" />
            Authorized Admin Users (2FA Protected)
          </h3>
          <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2.5 py-1 rounded-full">
            {adminEmails.length} Active
          </span>
        </div>
        <div className="p-6 space-y-6">
          <form onSubmit={handleAddAdmin} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new admin email (e.g. user@thedevam.com)"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)]"
                required
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>
            <button
              type="submit"
              className="bg-[var(--color-devam-red)] text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-[#d62828] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-4 h-4" /> Add New Admin
            </button>
          </form>

          <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 bg-gray-50/50">
            {adminEmails.map((emailItem) => (
              <div key={emailItem} className="px-4 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5 font-medium text-gray-800">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {emailItem}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQrEmail(emailItem);
                      setShowQRModal(true);
                    }}
                    className="text-xs text-amber-700 hover:text-amber-900 font-bold px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" /> View 2FA QR
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdmin(emailItem)}
                    className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1 rounded hover:bg-red-50 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2FA QR Setup Modal inside Admin Panel */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">2FA Authenticator QR Code</h3>
              <p className="text-xs text-gray-600 mt-1">
                Scan this QR code with Google Authenticator or Microsoft Authenticator for <span className="font-semibold">{qrEmail}</span>.
              </p>
            </div>

            <div className="flex flex-col items-center bg-amber-50 border border-amber-200 p-4 rounded-xl mb-4">
              <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44 bg-white p-2 rounded-lg border border-gray-200 shadow-sm mb-3" />
              <p className="text-xs font-bold text-amber-900 mb-1">Manual Entry Secret Key:</p>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-mono font-bold text-gray-800">
                <span>{TOTP_SECRET}</span>
                <button type="button" onClick={copySecret} className="text-gray-500 hover:text-gray-900">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-lg transition-colors"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}

      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-600" />
            Change Admin Password
          </h3>
        </div>
        <form onSubmit={handlePasswordChange} className="p-6 space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Master Recovery System Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="font-bold text-amber-900 flex items-center gap-2 mb-2">
          <LifeBuoy className="w-5 h-5 text-amber-700" />
          Master Account Recovery Key Information
        </h3>
        <p className="text-xs text-amber-800 leading-relaxed mb-3">
          If the client forgets their password or loses access to their login ID, use the system Master Recovery Key on the login page to reset their credentials:
        </p>
        <div className="inline-flex items-center gap-3 bg-white px-3.5 py-2 rounded-lg border border-amber-300 text-xs font-mono font-bold text-gray-900 shadow-sm">
          <span>Master Key: {MASTER_RECOVERY_KEY}</span>
        </div>
      </div>

      {/* Dashboard Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Sun className="w-5 h-5 text-gray-500" />
            Dashboard Theme
          </h3>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">Select Interface Theme</label>
          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => setTheme("light")}
              className={`flex-1 max-w-[200px] border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${
                theme === "light" ? "border-[var(--color-devam-red)] bg-red-50" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center">
                <Sun className={`w-6 h-6 ${theme === "light" ? "text-[var(--color-devam-red)]" : "text-gray-400"}`} />
              </div>
              <span className="font-bold text-gray-900">Light Mode</span>
            </button>

            <button 
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex-1 max-w-[200px] border-2 rounded-xl p-4 flex flex-col items-center gap-3 transition-all ${
                theme === "dark" ? "border-[var(--color-devam-red)] bg-gray-900 text-white" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="w-12 h-12 bg-gray-800 rounded-full shadow flex items-center justify-center">
                <Moon className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-gray-400"}`} />
              </div>
              <span className={`font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Dark Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

