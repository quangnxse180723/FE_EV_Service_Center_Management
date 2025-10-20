import { useCallback, useEffect, useState } from "react";
import technicianApi from "@/api/technicianApi";

export function useDashboard() {
  const [stats, setStats] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await technicianApi.getDashboardStats();
      setStats(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải thống kê dashboard');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWeeklyShifts = useCallback(async () => {
    try {
      const response = await technicianApi.getWeeklyShifts();
      setShifts(response.data || response);
    } catch (err) {
      console.error('Error fetching weekly shifts:', err);
    }
  }, []);

  useEffect(() => { 
    refresh(); 
    loadWeeklyShifts();
  }, [refresh, loadWeeklyShifts]);

  const checkinShift = useCallback(async (shiftId) => {
    try {
      await technicianApi.checkinShift(shiftId);
      loadWeeklyShifts();
    } catch (err) {
      setError(err.message || 'Lỗi khi check-in');
      console.error('Error checking in shift:', err);
      throw err;
    }
  }, [loadWeeklyShifts]);

  const checkoutShift = useCallback(async (shiftId) => {
    try {
      await technicianApi.checkoutShift(shiftId);
      loadWeeklyShifts();
    } catch (err) {
      setError(err.message || 'Lỗi khi check-out');
      console.error('Error checking out shift:', err);
      throw err;
    }
  }, [loadWeeklyShifts]);

  return { 
    stats, 
    shifts, 
    loading, 
    error, 
    refresh, 
    checkinShift, 
    checkoutShift 
  };
}
