"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import { Button } from "@/components/ui/button";
import { LogOut, Wallet, User, Loader2, Plus, Users, Send } from "lucide-react";

import GroupCard from "@/features/groups/components/GroupCard";
import CreateGroupModal from "@/features/groups/components/CreateGroupModal";
import JoinGroupModal from "@/features/groups/components/JoinGroupModal";
import { isAxiosError } from "axios";

interface Groups {
  id: number;
  name: string;
  description: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [isTelegramConnected, setIsTelegramConnected] = useState(false);
  const [groups, setGroups] = useState<Groups[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false);

  const refreshGroups = async () => {
    setLoadingGroups(true);
    try {
      const resGroups = await api.get("/groups");
      setGroups(resGroups.data.data || []);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUserName(res.data.data.name);
        setUserId(res.data.data.id);
        setIsTelegramConnected(!!res.data.data.telegram_chat_id);
        refreshGroups();
      } catch {
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-brand-cream font-sans relative overflow-hidden">
      {/* Animasi Floating Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-red/10 blur-[120px] animate-float"></div>
        <div
          className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-brand-taupe/40 blur-[100px] animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>
      {/* Navbar Premium */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-brand-taupe/30 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-red to-brand-burgundy rounded-xl flex items-center justify-center shadow-md shadow-brand-red/20">
            <Wallet className="w-5 h-5 text-brand-cream" />
          </div>
          <h1 className="text-xl font-bold text-brand-burgundy tracking-tight">
            Split<span className="text-brand-red">Bill</span>
          </h1>
        </div>

        {/* Menggunakan Shadcn Button untuk Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-brand-taupe/50 text-brand-burgundy hover:bg-brand-red hover:text-white hover:border-brand-red transition-all h-10 px-4 rounded-xl font-bold shadow-sm"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </nav>
      {/* Konten Utama Dashboard */}
      <main className="max-w-6xl mx-auto mt-6 sm:mt-10 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                  Selamat Datang Kembali ✨
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
              <Button
                onClick={() => setIsJoinGroupOpen(true)}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-6 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
              >
                <Users className="w-5 h-5 mr-2" /> Gabung Grup
              </Button>
              <Button
                onClick={() => setIsCreateGroupOpen(true)}
                className="flex items-center justify-center gap-2 bg-brand-cream hover:bg-white text-brand-burgundy px-6 py-6 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" /> Buat Grup Baru
              </Button>
            </div>
          </div>
          
          {/* Telegram Connect Banner */}
          {!isTelegramConnected && userId && (
            <div className="mt-8 bg-blue-500/20 border border-blue-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                  <Send className="w-6 h-6 -ml-1 mt-1" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Notifikasi Telegram</h4>
                  <p className="text-blue-100 text-sm">Hubungkan akun Anda agar mendapat notifikasi otomatis saat Anda ditagih.</p>
                </div>
              </div>
              <a 
                href={`https://t.me/splitbill_bob_bot?start=${userId}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto text-center bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
              >
                Hubungkan Sekarang
              </a>
            </div>
          )}
          
          {isTelegramConnected && (
            <div className="mt-8 bg-green-500/20 border border-green-400/40 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-md">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                <Send className="w-4 h-4 -ml-0.5 mt-0.5" />
              </div>
              <p className="text-green-50 font-medium text-sm">Akun Telegram Anda sudah terhubung. Anda akan menerima notifikasi tagihan baru!</p>
            </div>
          )}
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
                    {loadingGroups ? <Loader2 className="w-6 h-6 animate-spin" /> : groups.length}
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
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-brand-burgundy">Mulai Mencatat!</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                Buka grup Anda dan catat pengeluaran bersama. SplitBill akan otomatis menghitung utang-piutang tanpa perlu pusing kalkulator.
              </p>
              <div className="flex items-center gap-2 text-brand-red text-sm font-bold">
                Pilih Grup Anda &rarr;
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
              
              {loadingGroups ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-brand-red" />
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
                  <Button
                    onClick={() => setIsCreateGroupOpen(true)}
                    className="bg-brand-red hover:bg-brand-burgundy text-white px-6 py-6 rounded-xl font-bold transition-colors shadow-lg"
                  >
                    Buat Grup Sekarang
                  </Button>
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
          
          {/* Telegram Connect Banner */}
          {!isTelegramConnected && userId && (
            <div className="mt-8 bg-blue-500/20 border border-blue-400/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                  <Send className="w-6 h-6 -ml-1 mt-1" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Notifikasi Telegram</h4>
                  <p className="text-blue-100 text-sm">Hubungkan akun Anda agar mendapat notifikasi otomatis saat Anda ditagih.</p>
                </div>
              </div>
              <a 
                href={`https://t.me/splitbill_bob_bot?start=${userId}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto text-center bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
              >
                Hubungkan Sekarang
              </a>
            </div>
          )}
          
          {isTelegramConnected && (
            <div className="mt-8 bg-green-500/20 border border-green-400/40 rounded-2xl p-4 flex items-center gap-3 backdrop-blur-md">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white shrink-0">
                <Send className="w-4 h-4 -ml-0.5 mt-0.5" />
              </div>
              <p className="text-green-50 font-medium text-sm">Akun Telegram Anda sudah terhubung. Anda akan menerima notifikasi tagihan baru!</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onSuccess={() => {
          setIsCreateGroupOpen(false);
          refreshGroups();
        }}
      />

      <JoinGroupModal
        isOpen={isJoinGroupOpen}
        onClose={() => setIsJoinGroupOpen(false)}
        onSuccess={() => {
          setIsJoinGroupOpen(false);
          refreshGroups();
        }}
      />
    </div>
  );
}
