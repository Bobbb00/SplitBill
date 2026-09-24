"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { User, Loader2, LogIn, Plus, Sparkles, Receipt, Users, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import GroupCard from "@/features/groups/components/GroupCard";
import type { GroupCardProps } from "@/features/groups/types";
import CreateGroupModal from "@/features/groups/components/CreateGroupModal";
import JoinGroupModal from "@/features/groups/components/JoinGroupModal";
import { GroupCardSkeleton } from "@/components/ui/Skeleton";

export default function DashboardPage() {
  const [userName, setUserName] = useState("");
  const [groups, setGroups] = useState<GroupCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const pesan = searchParams.get("pesan");

  const fetchGroups = useCallback(() => {
    setLoading(true);
    api
      .get("/groups")
      .then((res) => {
        setGroups(res.data.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  
  useEffect(() => {
    api.get("/auth/profile").then((res) => {
      setUserName(res.data.data.name);
    });
    fetchGroups();
  }, [fetchGroups]);

  return (
    <main className="max-w-6xl mx-auto mt-6 sm:mt-10 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {pesan === "berhasil-keluar" && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-300 shadow-sm">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">✅</div>
          Anda berhasil keluar dari grup.
        </div>
      )}

      {/* Hero Welcome Section */}
      <div className="bg-gradient-to-br from-brand-burgundy to-[#4a1c22] rounded-3xl p-8 sm:p-12 mb-8 shadow-2xl relative overflow-hidden text-white">
        {/* Abstract background blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-red/20 blur-3xl rounded-full mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-brand-cream/10 blur-3xl rounded-full mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-inner">
              <User className="w-10 h-10 text-brand-cream" />
            </div>
            <div>
              <p className="text-white/70 font-medium text-sm sm:text-base mb-1 flex items-center gap-2">
                Selamat Datang Kembali <Sparkles className="w-4 h-4 text-brand-cream" />
              </p>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {userName || (
                  <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                )}
              </h2>
            </div>
          </div>
          
          {/* Quick Actions Panel */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3 sm:py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              <LogIn className="w-5 h-5" /> Gabung Grup
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-brand-cream hover:bg-white text-brand-burgundy px-6 py-3 sm:py-4 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              <Plus className="w-5 h-5" /> Buat Grup Baru
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Global Stats / Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-brand-cream/50 rounded-2xl flex items-center justify-center text-brand-burgundy">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-semibold">Total Grup Aktif</p>
                <h3 className="text-3xl font-black text-brand-burgundy">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : groups.length}
                </h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Anda saat ini tergabung dalam {groups.length} grup patungan. Klik salah satu grup di sebelah kanan untuk melihat detail.
            </p>
          </div>

          <div className="bg-gradient-to-br from-brand-cream/50 to-white backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-6 relative overflow-hidden group hover:shadow-2xl transition-all">
             <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-burgundy">Mulai Mencatat!</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Buka grup Anda dan catat pengeluaran bersama. SplitBill akan otomatis menghitung utang-piutang tanpa perlu pusing kalkulator.
            </p>
            <div className="flex items-center gap-2 text-brand-red text-sm font-bold">
              Pilih Grup Anda <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Right Column: Groups List */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-3xl p-6 sm:p-8 min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-brand-burgundy flex items-center gap-3">
                <span className="w-2 h-8 bg-brand-red rounded-full block"></span>
                Daftar Grup
              </h3>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <GroupCardSkeleton key={i} />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-16 px-4 bg-brand-cream/20 border-2 border-dashed border-brand-taupe/20 rounded-3xl flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-4">
                  <Users className="w-10 h-10 text-gray-300" />
                </div>
                <h4 className="text-xl font-bold text-brand-burgundy mb-2">Belum Ada Grup</h4>
                <p className="text-gray-500 font-medium max-w-sm mb-6">
                  Anda belum bergabung dengan grup manapun. Buat grup baru untuk mulai patungan bersama teman-teman!
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-brand-red hover:bg-brand-burgundy text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
                >
                  Buat Grup Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {groups.map((g) => (
                  <GroupCard
                    key={g.id}
                    id={g.id}
                    name={g.name}
                    description={g.description}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchGroups()}
      />

      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onSuccess={() => fetchGroups()}
      />
    </main>
  );
}
