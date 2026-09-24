"use client";
import { Mail, Lock, User, ArrowRight, Wallet, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInput } from "@/hooks/useInput";
import api from "@/lib/api";
import { useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const clearError = () => {
    setErrorMsg("");
  };
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const name = useInput("", clearError);
  const email = useInput("", clearError);
  const password = useInput("", clearError);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      await api.post("/auth/register", {
        name: name.value,
        email: email.value,
        password: password.value,
      });

      router.push("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data.errors[0].message) {
          setErrorMsg(err.response.data.errors[0].message);
        } else {
          setErrorMsg("Internal Server Error");
        }
      } else {
        setErrorMsg("Terjadi kesalahan yang tidak diketahui");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4 font-sans selection:bg-brand-red selection:text-white relative overflow-hidden">
      {/* Animasi Floating Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-red/10 blur-[120px] animate-float"></div>
        <div
          className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-brand-taupe/40 blur-[100px] animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header / Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-red to-brand-burgundy rounded-2xl flex items-center justify-center shadow-lg shadow-brand-burgundy/30 mb-6 transform transition hover:scale-105 hover:-translate-y-1 duration-300">
            <Wallet className="w-8 h-8 text-brand-cream" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-extrabold text-brand-burgundy tracking-tight drop-shadow-sm">
            Join Split<span className="text-brand-red">Bill</span>
          </h1>
          <p className="text-brand-taupe mt-3 font-medium mix-blend-multiply">
            Create an account to start managing your bills.
          </p>
        </div>

        {/* Card Utama */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-brand-taupe/40 to-transparent"></div>

          {/* Form UI */}
          <form onSubmit={handleRegister} className="space-y-5 relative">
            {/* Input Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="ml-1 text-brand-burgundy font-semibold"
              >
                Full Name
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-brand-taupe group-focus-within:text-brand-red transition-colors duration-300">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name.value}
                  onChange={name.onChange}
                  className="pl-11 pr-4 h-12 bg-brand-cream/30 border-brand-taupe/50 text-brand-burgundy text-sm rounded-xl focus-visible:ring-brand-red focus-visible:border-brand-red focus-visible:bg-white transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Input Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="ml-1 text-brand-burgundy font-semibold"
              >
                Email
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-brand-taupe group-focus-within:text-brand-red transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email.value}
                  onChange={email.onChange}
                  className="pl-11 pr-4 h-12 bg-brand-cream/30 border-brand-taupe/50 text-brand-burgundy text-sm rounded-xl focus-visible:ring-brand-red focus-visible:border-brand-red focus-visible:bg-white transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="ml-1 text-brand-burgundy font-semibold"
              >
                Password
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-brand-taupe group-focus-within:text-brand-red transition-colors duration-300">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password.value}
                  onChange={password.onChange}
                  className="pl-11 pr-4 h-12 bg-brand-cream/30 border-brand-taupe/50 text-brand-burgundy text-sm rounded-xl focus-visible:ring-brand-red focus-visible:border-brand-red focus-visible:bg-white transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="text-brand-red text-sm text-center font-bold bg-brand-red/10 py-2 rounded-lg border border-brand-red/20 animate-in fade-in zoom-in-95">
                {errorMsg}
              </div>
            )}

            {/* Tombol Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative w-full h-12 mt-4 rounded-xl bg-brand-red hover:bg-brand-burgundy text-brand-cream shadow-lg shadow-brand-red/20 transition-all text-sm font-bold active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign up
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Teks Sign In */}
          <p className="mt-8 text-center text-sm text-brand-taupe font-semibold mix-blend-multiply">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-brand-red hover:text-brand-burgundy font-bold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
