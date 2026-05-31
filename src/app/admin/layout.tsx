"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, PackageSearch, ShoppingBag, Truck, Settings, LogOut, Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't render the sidebar if we are on the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: PackageSearch },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Shipping", href: "/admin/shipping", icon: Truck },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden print:block print:h-auto print:bg-white print:overflow-visible relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col h-full flex-shrink-0 transform transition-transform duration-300 ease-in-out print:hidden ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="border-b border-gray-800 flex items-center justify-between lg:justify-center p-4">
          <Image src="/logo.svg" alt="Devam Foods" width={160} height={80} className="object-contain" priority />
          <button 
            className="lg:hidden p-2 text-gray-400 hover:bg-gray-800 rounded-lg -mt-16 z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-4 pt-2 pb-4 flex-1 flex flex-col gap-2 overflow-y-auto">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-2 mt-2">Admin Portal</div>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? "bg-[var(--color-devam-red)] text-white" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto flex flex-col w-full min-w-0 print:overflow-visible">
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center sticky top-0 z-10 shrink-0 print:hidden">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
            <button 
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
              {navItems.find(i => i.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className="text-xs sm:text-sm font-bold bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse shrink-0"></span>
              <span className="hidden sm:inline">Live System</span>
              <span className="sm:hidden">Live</span>
            </span>
          </div>
        </div>
        
        <div className="p-4 sm:p-8 print:p-0">
          {children}
        </div>
      </main>
    </div>
  );
}
