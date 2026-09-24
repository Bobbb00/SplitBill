import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  color: string;
  total_amount: number;
}

export interface MonthlyTrend {
  month: string;
  total_amount: number;
}

export interface DashboardChartsData {
  category_breakdown: CategoryBreakdown[];
  monthly_trend: MonthlyTrend[];
}

export function useDashboardCharts(groupId: number, externalRefreshKey?: number) {
  const [data, setData] = useState<DashboardChartsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchCharts = async () => {
      if (!groupId) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/groups/${groupId}/dashboard/charts`);
        
        if (isMounted && response.data?.data) {
          setData({
            category_breakdown: response.data.data.category_breakdown || [],
            monthly_trend: response.data.data.monthly_trend || [],
          });
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching dashboard charts:", err);
          setError(err.response?.data?.message || "Gagal memuat grafik dashboard");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCharts();

    return () => {
      isMounted = false;
    };
  }, [groupId, refreshTrigger, externalRefreshKey]);

  return { data, loading, error, refetch: () => setRefreshTrigger(prev => prev + 1) };
}
