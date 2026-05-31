"use client";

import { useState } from "react";
import { Mail, Moon, Sun, Save, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [email, setEmail] = useState("admin@devamfoods.com");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call to save settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
        <p className="text-gray-500 mt-1">Manage your administrator account and dashboard preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-500" />
              Account Credentials
            </h3>
          </div>
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Administrator Email</label>
            <div className="max-w-md relative">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-devam-red)] focus:border-transparent transition-shadow"
                required
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
            <p className="text-xs text-gray-500 mt-2">This email is used to securely log into the Admin Portal and receive system alerts.</p>
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
            <p className="text-xs text-gray-500 mt-4">Note: Global dark mode will be fully implemented across all data tables in the upcoming production release.</p>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center gap-4 pt-4">
          <button 
            type="submit"
            className="bg-[var(--color-devam-red)] text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 hover:bg-[#d62828] transition-colors shadow-sm"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
          
          {saved && (
            <span className="text-green-600 font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5" />
              Settings updated successfully
            </span>
          )}
        </div>

      </form>
    </div>
  );
}
