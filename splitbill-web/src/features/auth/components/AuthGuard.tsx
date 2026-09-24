"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      api
        .get("/auth/profile")
        .then(() => setIsAuthenticated(true))
        .catch(() => {
          localStorage.removeItem("token");
          router.push("/login");
        });
    }
  }, [router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
