"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-brand-taupe/30 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <Link
        href="/"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 bg-gradient-to-br from-brand-red to-brand-burgundy rounded-xl flex items-center justify-center shadow-md shadow-brand-red/20">
          <Wallet className="w-5 h-5 text-brand-cream" />
        </div>
        <h1 className="text-xl font-bold text-brand-burgundy tracking-tight">
          Split<span className="text-brand-red">Bill</span>
        </h1>
      </Link>

      <Button
        variant="outline"
        onClick={handleLogout}
        className="border-brand-taupe/50 text-brand-burgundy hover:bg-brand-red hover:text-white hover:border-brand-red transition-all h-10 px-4 rounded-xl font-bold shadow-sm"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </nav>
  );
}
