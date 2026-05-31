"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { ArrowRight, Mail, Lock, User, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Get the redirect URL from the query string (defaults to /account)
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect') || '/account';

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
        toast.success("Welcome back to Devam!");
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // We could also update the profile with the name here if needed
        setUser(userCredential.user);
        toast.success("Account created successfully!");
      }
      router.push(redirectUrl);
    } catch (error: any) {
      toast.error(error.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect') || '/account';

    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      setUser(userCredential.user);
      toast.success("Signed in with Google!");
      router.push(redirectUrl);
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        console.error("Google Auth Error:", error);
        toast.error(error.message || "Google sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Dynamic Image Area */}
        <div className="md:w-1/2 relative hidden md:flex items-center justify-center bg-[var(--color-devam-cream)] overflow-hidden">
          <Image 
            src="/hero-wheat.png" 
            alt="Devam Wheat Field" 
            fill 
            className="object-cover mix-blend-multiply opacity-80 animate-pulse duration-10000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-devam-brown)]/90 to-transparent flex flex-col justify-end p-8 text-white">
            <h2 className="text-2xl font-heading font-bold mb-2">
              {isLogin ? "Welcome Back" : "Join the Devam Family"}
            </h2>
            <p className="text-sm opacity-90">
              {isLogin 
                ? "Sign in to access your orders, track shipments, and explore premium products." 
                : "Create an account to unlock exclusive offers, fast checkout, and premium quality products."}
            </p>
          </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-center bg-white overflow-y-auto custom-scrollbar">
          
          <div className="mb-6 text-center md:text-left">
            <Link href="/">
              <Image src="/logo.svg" alt="Devam Logo" width={120} height={40} className="mx-auto md:mx-0 mb-4 cursor-pointer" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {isLogin ? "Sign In to Your Account" : "Create an Account"}
            </h1>
            <p className="text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-[var(--color-devam-red)] font-semibold hover:underline"
                disabled={loading}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required={!isLogin}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-[var(--color-devam-red)] focus:border-[var(--color-devam-red)] bg-gray-50 transition-colors"
                    placeholder="Jaydev Patidar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-[var(--color-devam-red)] focus:border-[var(--color-devam-red)] bg-gray-50 transition-colors"
                    placeholder="jaydev@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-gray-700">Password</label>
                {isLogin && (
                  <a href="#" className="text-xs text-[var(--color-devam-red)] hover:underline font-semibold">
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-[var(--color-devam-red)] focus:border-[var(--color-devam-red)] bg-gray-50 transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[var(--color-devam-red)] hover:bg-[#d62828] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-devam-red)] transition-all disabled:opacity-70 mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-200 rounded-lg shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all disabled:opacity-70"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Google
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
