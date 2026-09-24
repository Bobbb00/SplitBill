import { useState, useEffect } from "react";
import api from "@/lib/api";

interface SummaryData {
  total_utang: number;
  total_piutang: number;
}

export function useDashboardSummary(groupId: number) {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/groups/${groupId}/dashboard`);
        setSummary(res.data.data);
      } catch (err) {
        console.error("Gagal mengambil dashboard summary:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [groupId]);

  return { summary, loading, error };
}
