"use client";
import { useRouter } from "next/navigation";
import DashboardSummary from "@/features/groups/components/DashboardSummary";

import MemberList from "@/features/groups/components/MemberList";
import ExpenseList from "@/features/groups/components/ExpenseList";
import type { Expense } from "@/features/groups/types";
import CreateExpenseModal from "@/features/groups/components/CreateExpenseModal";
import type { EditExpenseData } from "@/features/groups/types";
import api from "@/lib/api";
import axios from "axios";
import { useEffect, useState, use } from "react";
import { Copy, RefreshCw, Plus, Trash2 } from "lucide-react";
import { confirmDialog } from "@/lib/confirm";

import toast from "react-hot-toast";
interface Group {
  id: number;
  name: string;
  description: string;
  invite_code: string;
  created_by: number;
}

interface Member {
  user_id: number;
  name: string;
  email: string;
  role: string;
}

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expense modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseRefreshKey, setExpenseRefreshKey] = useState(0);
  const [editExpenseData, setEditExpenseData] = useState<EditExpenseData | null>(null);

  // Hitung isAdmin dari data members yang sudah ada (DRY - tidak perlu state tambahan)
  const isAdmin =
    currentUserId !== null &&
    members.some((m) => m.user_id === currentUserId && m.role === "admin");

  useEffect(() => {
    const fetchGroupDetail = async () => {
      try {
        const [profileRes, groupRes] = await Promise.all([
          api.get("/auth/profile"),
          api.get(`/groups/${id}`),
        ]);
        setCurrentUserId(profileRes.data.data.id);
        setGroup(groupRes.data.data.group);
        setMembers(groupRes.data.data.members);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || "Terjadi kesalahan saat memuat grup",
          );
        } else {
          setError("Terjadi kesalahan tidak terduga");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetail();
  }, [id]);

  const handleCopy = () => {
    if (group?.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
      toast.success("Kode berhasil disalin!");
    }
  };

  const handleRegenerate = async () => {
    if (
      !await confirmDialog(
        "Yakin ingin mengganti kode invite? Kode lama tidak akan berlaku lagi.",
      )
    )
      return;

    try {
      const res = await api.put(`/groups/${id}/regenerate-code`);
      setGroup({ ...group!, invite_code: res.data.data.new_invite_code });
      toast.success("Kode berhasil direset!");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Terjadi kesalahan saat mereset kode",
        );
      } else {
        setError("Terjadi kesalahan tidak terduga");
      }
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!await confirmDialog("Yakin ingin mengeluarkan anggota ini?")) return;

    try {
      await api.delete(`/groups/${id}/members/${memberId}`);
      setMembers((prev) => prev.filter((m) => m.user_id !== memberId));
      toast.success("Berhasil mengeluarkan anggota");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Terjadi kesalahan saat mengeluarkan anggota",
        );
      } else {
        setError("Terjadi kesalahan tidak terduga");
      }
    }
  };

  const handleLeaveGroup = async () => {
    if (!await confirmDialog("Yakin ingin keluar dari grup ini?")) return;
    if (!currentUserId) return;

    try {
      await api.delete(`/groups/${id}/members/${currentUserId}`);
      router.push("/?pesan=berhasil-keluar"); // Langsung kembali ke Dashboard
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Terjadi kesalahan saat keluar grup",
        );
      } else {
        setError("Terjadi kesalahan tidak terduga");
      }
    }
  };

  const handleDeleteGroup = async () => {
    if (!await confirmDialog("YAKIN INGIN MENGHAPUS GRUP INI? Semua data pengeluaran dan anggota akan hilang permanen!")) return;
    
    try {
      await api.delete(`/groups/${id}`);
      router.push("/?pesan=grup-dihapus");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Gagal menghapus grup");
      } else {
        setError("Terjadi kesalahan tidak terduga");
      }
    }
  };

  const handleExpenseCreated = () => {
    setExpenseRefreshKey((prev) => prev + 1);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditExpenseData({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      paid_by: expense.paid_by,
      splits: expense.splits?.map(s => ({
         user_id: s.user_id,
         amount: s.amount_owed
      })) || []
    });
    setIsExpenseModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsExpenseModalOpen(false);
    setEditExpenseData(null);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-brand-taupe">
        Memuat data grup...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-brand-red">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white/80 border border-brand-taupe/20 p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold text-brand-burgundy">
          {group?.name}
        </h1>
        <p className="text-brand-taupe mt-2">{group?.description}</p>

        <div className="mt-4 flex items-center gap-2 w-full">
          <div className="inline-flex items-center bg-brand-cream/50 px-4 py-2 rounded-lg border border-brand-taupe/30">
            <span className="text-sm text-brand-taupe">Invite Code: </span>
            <span className="font-mono font-bold text-brand-red ml-2 tracking-wider">
              {group?.invite_code || "..."}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="p-2 bg-white border border-brand-taupe/20 rounded-lg hover:bg-brand-cream transition-colors"
            title="Salin Kode"
          >
            <Copy className="w-5 h-5 text-brand-taupe" />
          </button>

          {/* Tombol Admin: Regenerate & Delete */}
          {isAdmin && (
            <>
              <button
                onClick={handleRegenerate}
                className="p-2 bg-white border border-brand-taupe/20 rounded-lg hover:bg-brand-cream hover:text-brand-burgundy transition-colors"
                title="Reset Kode (Khusus Admin)"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={handleDeleteGroup}
                className="p-2 bg-brand-red/10 border border-brand-red/20 rounded-lg hover:bg-brand-red hover:text-white text-brand-red transition-colors ml-auto"
                title="Hapus Grup (Khusus Admin)"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <MemberList
        members={members}
        isAdmin={isAdmin}
        currentUserId={currentUserId}
        onRemoveMember={handleRemoveMember}
        onLeaveGroup={handleLeaveGroup}
      />

      {/* Dashboard Summary Section */}
      {currentUserId && (
        <DashboardSummary groupId={Number(id)} />
      )}

      {/* Expense Section */}
      <div className="flex justify-between items-center">
        <div />
        <button
          onClick={() => {
            setEditExpenseData(null);
            setIsExpenseModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white font-bold rounded-xl hover:bg-brand-burgundy transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengeluaran
        </button>
      </div>

      <ExpenseList
        groupId={Number(id)}
        currentUserId={currentUserId}
        refreshKey={expenseRefreshKey}
        onEdit={handleEditExpense}
      />

      {/* Create/Edit Expense Modal */}
      <CreateExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleExpenseCreated}
        groupId={Number(id)}
        members={members}
        currentUserId={currentUserId}
        editData={editExpenseData}
      />
    </div>
  );
}






