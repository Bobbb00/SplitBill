"use client";

import {
  TrendingDown,
  TrendingUp,
  LucideIcon,
  Download,
  FileText,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// --- TYPES ---

// --- CUSTOM HOOK ---
// Memisahkan logika pengambilan data (Business Logic) dari UI
import { useDashboardSummary } from "@/features/groups/hooks/useDashboardSummary";
import { useDashboardCharts } from "@/features/groups/hooks/useDashboardCharts";
import { DashboardSummaryProps, SummaryCardProps } from "../types";
import { downloadFile } from "@/lib/download";

// --- REUSABLE COMPONENT ---
// Menghindari kode UI yang berulang (DRY - Don't Repeat Yourself)

function SummaryCard({
  title,
  amount,
  description,
  Icon,
  variant,
}: SummaryCardProps) {
  const isSuccess = variant === "success";
  const bgClass = isSuccess
    ? "from-green-50 to-emerald-100 border-green-200/50"
    : "from-red-50 to-rose-100 border-red-200/50";
  const textClass = isSuccess ? "text-green-900" : "text-red-900";
  const titleClass = isSuccess ? "text-green-800" : "text-red-800";
  const descClass = isSuccess ? "text-green-700/70" : "text-red-700/70";
  const iconClass = isSuccess ? "text-green-600" : "text-red-600";

  return (
    <div
      className={`bg-gradient-to-br ${bgClass} p-5 rounded-2xl border shadow-sm relative overflow-hidden group transition-all hover:shadow-md`}
    >
      <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
        <Icon size={100} className={iconClass} />
      </div>
      <div className="relative z-10">
        <p className={`${titleClass} text-sm font-medium mb-1`}>{title}</p>
        <h3 className={`text-2xl font-bold ${textClass}`}>
          Rp {(amount || 0).toLocaleString("id-ID")}
        </h3>
        <p className={`${descClass} text-xs mt-2`}>{description}</p>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function DashboardSummary({ groupId }: DashboardSummaryProps) {
  const {
    summary,
    loading: sumLoading,
    error: sumError,
  } = useDashboardSummary(groupId);
  const {
    data: charts,
    loading: chartsLoading,
    error: chartsError,
  } = useDashboardCharts(groupId);

  const loading = sumLoading || chartsLoading;
  const error = sumError || chartsError;

  const handleExportCSV = () => {
    downloadFile(
      `/groups/${groupId}/export/csv`,
      `laporan-grup-${groupId}.csv`,
    );
  };

  const handleExportPDF = () => {
    downloadFile(
      `/groups/${groupId}/export/pdf`,
      `laporan-grup-${groupId}.pdf`,
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-white/50 h-24 rounded-2xl border border-brand-taupe/20"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="animate-pulse bg-white/50 h-64 rounded-2xl border border-brand-taupe/20"></div>
          <div className="animate-pulse bg-white/50 h-64 rounded-2xl border border-brand-taupe/20"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-200 rounded-2xl">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Tombol Export */}
      <div className="flex justify-end gap-3 mb-6">
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          <FileText size={16} />
          Unduh CSV
        </button>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white rounded-xl hover:bg-brand-burgundy transition-colors text-sm font-medium shadow-sm hover:shadow"
        >
          <Download size={16} />
          Unduh PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          title="Total Piutang Saya"
          amount={summary?.total_piutang || 0}
          description="Uang yang akan dibayarkan orang lain ke kamu"
          Icon={TrendingUp}
          variant="success"
        />
        <SummaryCard
          title="Total Utang Saya"
          amount={summary?.total_utang || 0}
          description="Uang yang harus kamu kembalikan ke orang lain"
          Icon={TrendingDown}
          variant="danger"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Category Breakdown (Pie Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Pengeluaran per Kategori
          </h3>
          {charts?.category_breakdown &&
          charts.category_breakdown.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.category_breakdown}
                    dataKey="total_amount"
                    nameKey="category_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {charts.category_breakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || "#8884d8"}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              Belum ada data pengeluaran
            </div>
          )}
        </div>

        {/* Monthly Trend (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Tren Pengeluaran 6 Bulan Terakhir
          </h3>
          {charts?.monthly_trend && charts.monthly_trend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthly_trend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 12 }}
                    tickFormatter={(value) => `Rp ${value / 1000}k`}
                  />
                  <RechartsTooltip
                    formatter={(value: any) => [
                      `Rp ${Number(value || 0).toLocaleString("id-ID")}`,
                      "Total",
                    ]}
                    cursor={{ fill: "#F1F5F9" }}
                  />
                  <Bar
                    dataKey="total_amount"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              Belum ada data pengeluaran
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
