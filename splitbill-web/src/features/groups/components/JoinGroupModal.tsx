import { useInput } from "@/hooks/useInput";
import { useState } from "react";

import api from "@/lib/api";
import axios from "axios";

import { Loader2, X } from "lucide-react";
import { JoinGroupModalProps } from "../types";



export default function JoinGroupModal({
  isOpen,
  onClose,
  onSuccess,
}: JoinGroupModalProps) {
  const inviteCode = useInput("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/groups/join", { invite_code: inviteCode.value });

      onSuccess();
      onClose();
      inviteCode.setValue("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Kode invite tidak vallid");
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
            Gabung ke Grup
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

          <div className="mb-6">
            <label className="block text-brand-taupe text-sm font-semibold mb-2">
              Kode Invite (6 Karakter)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={inviteCode.value}
              onChange={inviteCode.onChange}
              placeholder="Contoh: A1B2C3"
              className="w-full px-4 py-3 rounded-xl border border-brand-taupe/30 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-colors bg-white/50 font-mono tracking-widest uppercase"
              style={{ textTransform: "uppercase" }}
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
                "Gabung"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
