import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import axios from "axios";
import { Expense, ExpenseSplit } from "../types";
import { ExpenseListProps } from "../types";
import { confirmDialog } from "@/lib/confirm";
import toast from "react-hot-toast";
import {
  Receipt,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  UserCheck,
  Users,
  Trash2,
  Pencil,
} from "lucide-react";







function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ExpenseList({
  groupId,
  currentUserId,
  refreshKey,
  onEdit,
}: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/groups/${groupId}/expenses`);
      setExpenses(res.data.data || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Gagal memuat daftar pengeluaran"
        );
      } else {
        setError("Terjadi kesalahan tidak terduga");
      }
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, refreshKey]);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSettle = async (expenseId: number, targetUserId: number, targetName: string, isCurrentlyPaid: boolean) => {
    const actionText = isCurrentlyPaid ? "MEMBATALKAN status lunas" : "menandai LUNAS";
    if (!await confirmDialog(`Yakin ingin ${actionText} untuk pembayaran ${targetName}?`)) return;

    try {
      await api.put(`/groups/${groupId}/expenses/${expenseId}/settle/${targetUserId}`);
      // Update UI lokal
      setExpenses((prev) =>
        prev.map((e) => {
          if (e.id === expenseId) {
            return {
              ...e,
              splits: e.splits.map((s) =>
                s.user_id === targetUserId ? { ...s, is_paid: !s.is_paid } : s
              ),
            };
          }
          return e;
        })
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Gagal mengubah status pembayaran");
      } else {
        toast.error("Terjadi kesalahan tidak terduga");
      }
    }
  };

  const handleDelete = async (expenseId: number) => {
    if (!await confirmDialog("Yakin ingin menghapus pengeluaran ini?")) return;

    try {
      await api.delete(`/groups/${groupId}/expenses/${expenseId}`);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Gagal menghapus pengeluaran");
      } else {
        toast.error("Terjadi kesalahan tidak terduga");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 border border-brand-taupe/20 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-center gap-2 text-brand-taupe py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Memuat pengeluaran...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 border border-brand-taupe/20 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-brand-red py-4">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 border border-brand-taupe/20 p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold text-brand-burgundy mb-4 flex items-center gap-2">
        <Receipt className="w-5 h-5 text-brand-red" />
        Daftar Pengeluaran ({expenses.length})
      </h2>

      {expenses.length === 0 ? (
        <div className="text-center py-8 text-brand-taupe">
          <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Belum ada pengeluaran</p>
          <p className="text-sm mt-1 opacity-75">
            Klik tombol &quot;Tambah Pengeluaran&quot; untuk memulai
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => {
            const isExpanded = expandedId === expense.id;
            const isPayer = expense.paid_by === currentUserId;

            return (
              <div
                key={expense.id}
                className="border border-brand-taupe/15 rounded-xl overflow-hidden hover:border-brand-taupe/30 transition-colors"
              >
                {/* Main Row */}
                <div
                  onClick={() => toggleExpand(expense.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-brand-cream/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        isPayer
                          ? "bg-green-100 text-green-700"
                          : "bg-brand-burgundy/10 text-brand-burgundy"
                      }`}
                    >
                      {expense.paid_by_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-brand-burgundy truncate">
                        {expense.description}
                      </p>
                      <p className="text-xs text-brand-taupe mt-0.5">
                        Dibayar oleh{" "}
                        <span className="font-semibold">
                          {isPayer ? "Anda" : expense.paid_by_name}
                        </span>{" "}
                        &bull; {formatDate(expense.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="text-right">
                      <p className="font-bold text-brand-burgundy">
                        {formatRupiah(expense.amount)}
                      </p>
                      <p className="text-xs text-brand-taupe flex items-center gap-1 justify-end">
                        <Users className="w-3 h-3" />
                        {expense.splits?.length || 0} orang
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-brand-taupe" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-brand-taupe" />
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && expense.splits && (
                  <div className="border-t border-brand-taupe/10 bg-brand-cream/10 p-4">
                    <p className="text-xs font-semibold text-brand-taupe mb-3 uppercase tracking-wide">
                      Detail Pembagian
                    </p>
                    <div className="space-y-2">
                      {expense.splits.map((split) => {
                        const isSelf = split.user_id === currentUserId;
                        return (
                          <div
                            key={split.user_id}
                            className={`flex items-center justify-between p-2.5 rounded-lg ${
                              isSelf
                                ? "bg-brand-red/5 border border-brand-red/15"
                                : "bg-white/60"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-brand-burgundy/10 text-brand-burgundy flex items-center justify-center text-xs font-bold">
                                {split.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-brand-burgundy">
                                {split.name}
                                {isSelf ? " (Anda)" : ""}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-brand-burgundy">
                                {formatRupiah(split.amount_owed)}
                              </span>
                              {split.is_paid ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSettle(expense.id, split.user_id, split.name, true);
                                  }}
                                  className="flex items-center gap-1 text-xs text-green-600 bg-green-50 hover:bg-green-100 px-2 py-0.5 rounded-full font-semibold cursor-pointer transition-colors"
                                  title="Klik untuk Batal Lunas"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  Lunas
                                </button>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">
                                    Belum Bayar
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSettle(expense.id, split.user_id, split.name, false);
                                    }}
                                    className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold rounded shadow-sm transition-colors"
                                  >
                                    Tandai Lunas
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-brand-taupe/10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(expense);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-brand-burgundy bg-brand-cream/50 hover:bg-brand-cream rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(expense.id);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-brand-red bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}






