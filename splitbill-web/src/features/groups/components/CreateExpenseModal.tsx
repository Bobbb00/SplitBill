import React from "react";
import {
  X,
  Loader2,
  DollarSign,
  CheckSquare,
  Square,
  Equal,
  Edit3,
} from "lucide-react";
import { useExpenseForm } from "../hooks/useExpenseForm";
import { CreateExpenseModalProps } from "../types";

const CATEGORIES = [
  { id: 1, name: "Makanan", icon: "🍕", color: "#EF4444" },
  { id: 2, name: "Transportasi", icon: "🚗", color: "#3B82F6" },
  { id: 3, name: "Belanja", icon: "🛒", color: "#10B981" },
  { id: 4, name: "Tagihan", icon: "📄", color: "#F59E0B" },
  { id: 5, name: "Hiburan", icon: "🎬", color: "#8B5CF6" },
  { id: 6, name: "Kesehatan", icon: "🏥", color: "#EC4899" },
  { id: 7, name: "Lainnya", icon: "💬", color: "#6B7280" },
];

export default function CreateExpenseModal({
  isOpen,
  onClose,
  onSuccess,
  groupId,
  members,
  currentUserId,
  editData,
}: CreateExpenseModalProps) {
  const {
    form,
    onSubmit,
    loading,
    apiError,
    applyTax,
    setApplyTax,
    applyService,
    setApplyService,
  } = useExpenseForm({
    groupId,
    currentUserId,
    members,
    editData,
    onSuccess,
    onClose,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const isEditMode = !!editData;

  const splitMode = watch("splitMode");
  const exactAmounts = watch("exactAmounts") || {};
  const selectedMembers = watch("selectedMembers") || [];
  const amount = watch("amount") || 0;

  const toggleSelectMember = (userId: number) => {
    if (selectedMembers.includes(userId)) {
      setValue(
        "selectedMembers",
        selectedMembers.filter((id: number) => id !== userId),
        { shouldValidate: true },
      );
    } else {
      setValue("selectedMembers", [...selectedMembers, userId], {
        shouldValidate: true,
      });
    }
  };

  const handleExactAmountChange = (userId: number, val: string) => {
    setValue(
      "exactAmounts",
      {
        ...exactAmounts,
        [String(userId)]: val,
      },
    );

    if (val && !selectedMembers.includes(userId)) {
      setValue("selectedMembers", [...selectedMembers, userId]);
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-burgundy/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-brand-cream to-white">
          <h2 className="text-xl font-bold text-brand-burgundy flex items-center gap-2">
            <span className="p-1.5 bg-brand-red/10 rounded-lg text-brand-red">
              <DollarSign size={20} />
            </span>
            {isEditMode ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
          </h2>
          <button
            onClick={() => {
              form.reset();
              onClose();
            }}
            className="text-gray-400 hover:text-brand-burgundy hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          <form
            id="expenseForm"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {apiError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {apiError}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-brand-burgundy mb-1.5">
                Untuk apa pengeluaran ini?
              </label>
              <input
                type="text"
                {...register("description")}
                placeholder="Misal: Makan siang di Solaria"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors"
              />
              {errors.description && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.description.message}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-brand-burgundy mb-1.5">
                  Total (Rp)
                </label>
                <input
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors"
                />
                {errors.amount && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.amount.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-burgundy mb-1.5">
                  Dibayar oleh
                </label>
                <select
                  {...register("paid_by", { valueAsNumber: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-red bg-white transition-colors"
                >
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.user_id === currentUserId ? "Saya" : m.name}
                    </option>
                  ))}
                </select>
                {errors.paid_by && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.paid_by.message}
                  </span>
                )}
              </div>
            </div>

            {/* Bagian Kategori */}
            <div>
              <label className="block text-sm font-semibold text-brand-burgundy mb-1.5">
                Kategori
              </label>
              <select
                {...register("category_id", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-red bg-white transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.category_id.message}
                </span>
              )}
            </div>

            {/* Bagian Patungan */}
            <div className="pt-4 border-t border-dashed border-gray-200">
              <label className="block text-sm font-semibold text-brand-burgundy mb-3">
                Siapa saja yang patungan?
              </label>

              {errors.selectedMembers && (
                <span className="text-xs text-red-500 block mb-2">
                  {errors.selectedMembers.message}
                </span>
              )}
              {errors.splitMode && (
                <span className="text-xs text-red-500 block mb-2">
                  {errors.splitMode.message}
                </span>
              )}

              {/* Mode Split Toggle */}
              <div className="flex bg-brand-cream/30 p-1 rounded-lg mb-3">
                <button
                  type="button"
                  onClick={() =>
                    setValue("splitMode", "equal", { shouldValidate: true })
                  }
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md flex justify-center items-center gap-1 transition-all ${splitMode === "equal" ? "bg-white text-brand-red shadow-sm" : "text-brand-taupe hover:bg-white/50"}`}
                >
                  <Equal className="w-3.5 h-3.5" />
                  Bagi Rata
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValue("splitMode", "exact", { shouldValidate: true })
                  }
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md flex justify-center items-center gap-1 transition-all ${splitMode === "exact" ? "bg-white text-brand-red shadow-sm" : "text-brand-taupe hover:bg-white/50"}`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Nominal Beda
                </button>
              </div>

              {/* Opsi Pajak & Servis (Khusus Nominal Beda) */}
              {splitMode === "exact" && (
                <div className="mb-4 bg-brand-cream/30 p-3 rounded-lg border border-brand-taupe/20">
                  <p className="text-xs font-bold text-brand-taupe mb-2">
                    Tambahan Otomatis:
                  </p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={applyService}
                        onChange={(e) => setApplyService(e.target.checked)}
                        className="w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-brand-burgundy group-hover:text-brand-red transition-colors">
                        Service Charge 5%
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={applyTax}
                        onChange={(e) => setApplyTax(e.target.checked)}
                        className="w-4 h-4 text-brand-red border-gray-300 rounded focus:ring-brand-red cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-brand-burgundy group-hover:text-brand-red transition-colors">
                        PPN 11%
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {members.map((member) => {
                  const isChecked = selectedMembers.includes(member.user_id);
                  return (
                    <div
                      key={member.user_id}
                      onClick={() => {
                        if (splitMode === "equal")
                          toggleSelectMember(member.user_id);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isChecked
                          ? "border-brand-red bg-brand-red/5"
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      } ${splitMode === "equal" ? "cursor-pointer" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-red to-brand-burgundy text-white flex items-center justify-center font-bold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-brand-burgundy">
                            {member.user_id === currentUserId
                              ? "Saya"
                              : member.name}
                          </p>
                        </div>
                      </div>

                      <div>
                        {splitMode === "equal" ? (
                          isChecked ? (
                            <CheckSquare className="w-5 h-5 text-brand-red" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300" />
                          )
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-brand-taupe">
                              Rp
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={exactAmounts[String(member.user_id)] || ""}
                              onChange={(e) =>
                                handleExactAmountChange(
                                  member.user_id,
                                  e.target.value,
                                )
                              }
                              placeholder="0"
                              className="w-24 px-2 py-1 text-sm text-right font-bold text-brand-burgundy border border-brand-taupe/30 rounded focus:outline-none focus:border-brand-red bg-white"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
          <button
            type="button"
            onClick={() => {
              form.reset();
              onClose();
            }}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="expenseForm"
            disabled={loading}
            className="px-6 py-2.5 bg-brand-red text-white text-sm font-bold rounded-xl hover:bg-brand-burgundy transition-colors flex items-center gap-2 shadow-lg shadow-brand-red/20"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {isEditMode ? "Simpan Perubahan" : "Simpan Pengeluaran"}
          </button>
        </div>
      </div>
    </div>
  );
}
