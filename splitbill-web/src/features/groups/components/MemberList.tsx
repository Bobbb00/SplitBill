import { User, Shield, Trash2, LogOut } from "lucide-react";
import { MemberListProps } from "../types";

interface Member {
  user_id: number;
  name: string;
  email: string;
  role: string;
}



export default function MemberList({
  members,
  isAdmin,
  currentUserId,
  onRemoveMember,
  onLeaveGroup,
}: MemberListProps) {
  return (
    <div className="bg-white/80 border border-brand-taupe/20 p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold text-brand-burgundy mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-brand-red" />
        Daftar Anggota ({members?.length || 0})
      </h2>
      <div className="space-y-3">
        {members?.map((member) => {
          const isSelf = member.user_id === currentUserId;
          const canKick = isAdmin && !isSelf && member.role !== "admin";

          return (
            <div
              key={member.user_id}
              className="flex items-center justify-between p-3 rounded-xl bg-brand-cream/30 border border-brand-taupe/10 hover:border-brand-taupe/30 transition-colors"
            >
              <div>
                <p className="font-bold text-brand-burgundy">{member.name}</p>
                <p className="text-sm text-brand-taupe">{member.email}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Badge Role */}
                {member.role === "admin" ? (
                  <span className="flex items-center gap-1 bg-brand-burgundy/10 text-brand-burgundy px-3 py-1 rounded-full text-xs font-bold">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                ) : (
                  <span className="bg-brand-taupe/10 text-brand-taupe px-3 py-1 rounded-full text-xs font-semibold">
                    Member
                  </span>
                )}

                {/* Tombol Keluar (untuk diri sendiri yang bukan admin) */}
                {isSelf && !isAdmin && (
                  <button
                    onClick={onLeaveGroup}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 text-brand-red text-xs font-bold rounded-lg hover:bg-brand-red hover:text-white transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    Keluar Grup
                  </button>
                )}

                {/* Tombol Hapus Anggota (hanya untuk Admin, tidak bisa hapus sesama Admin) */}
                {canKick && (
                  <button
                    onClick={() => onRemoveMember(member.user_id)}
                    className="p-2 text-brand-taupe hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors"
                    title="Keluarkan Anggota"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
