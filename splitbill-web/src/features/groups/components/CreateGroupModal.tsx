import { useInput } from "@/hooks/useInput";
import api from "@/lib/api";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import axios from "axios";
import { CreateGroupModalProps } from "../types";



export default function CreateGroupModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateGroupModalProps) {
  const name = useInput("");
  const description = useInput("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/groups", {
        name: name.value,
        description: description.value,
      });

      onSuccess();
      onClose();

      name.setValue("");
      description.setValue("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Terjadi kesalahan");
      } else {
        setError("Terjadi kesalahan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-brand-taupe/20">
          <h2 className="text-xl font-bold text-brand-burgundy">
            Buat Grup Baru
          </h2>
          <button
            onClick={onClose}
            className="text-brand-taupe hover:text-brand-red transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {error && (
            <div className="mb-4 p-3 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-brand-taupe text-sm font-semibold mb-2">
              Nama Grup
            </label>
            {/* Cukup lakukan {...name} (Spread Operator) yang jauh lebih rapi! */}
            <input
              type="text"
              required
              value={name.value}
              onChange={name.onChange}
              placeholder="Contoh: Liburan Bali"
              className="w-full px-4 py-3 rounded-xl border border-brand-taupe/30 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors bg-white/50"
            />
          </div>

          <div className="mb-6">
            <label className="block text-brand-taupe text-sm font-semibold mb-2">
              Deskripsi (Opsional)
            </label>
            {/* Terapkan di textarea: {...description} */}
            <textarea
              value={description.value}
              onChange={description.onChange}
              placeholder="Contoh: Tabungan bersama untuk liburan"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-brand-taupe/30 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors bg-white/50 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold text-brand-taupe bg-brand-cream/50 hover:bg-brand-cream transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-brand-red hover:bg-brand-burgundy transition-colors disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Buat Grup"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
