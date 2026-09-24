import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { GroupCardProps } from "../types";



export default function GroupCard({ id, name, description }: GroupCardProps) {
  return (
    <Link href={`/groups/${id}`}>
      <div className="bg-white/80 border border-brand-taupe/30 hover:border-brand-red/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-5 cursor-pointer group">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-brand-burgundy group-hover:text-brand-red transition-colors">
              {name}
            </h3>
            <p className="text-brand-taupe text-sm mt-1 line-clamp-2">
              {description || "Tidak ada deskripsi"}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-brand-taupe/50 group-hover:text-brand-red group-hover:translate-x-1 transition-all" />
        </div>
        <div className="mt-4 flex items-center gap-2 text-brand-taupe text-sm font-medium">
          <div className="flex items-center gap-1 bg-brand-cream/50 px-2 py-1 rounded-md border border-brand-taupe/20">
            <Users className="w-4 h-4" />
            <span>Anggota</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
