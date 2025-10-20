import { useCallback, useEffect, useState } from "react";
import technicianApi from "@/api/technicianApi";

export function useMaintenance() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await technicianApi.getMaintenanceList(params);
      setItems(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải lịch sử bảo dưỡng');
      console.error('Error fetching maintenance list:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createNote = useCallback(async (data) => {
    try {
      await technicianApi.createMaintenanceNote(data);
      refresh();
    } catch (err) {
      setError(err.message || 'Lỗi khi tạo ghi chú bảo dưỡng');
      console.error('Error creating maintenance note:', err);
      throw err;
    }
  }, [refresh]);

  const getById = useCallback(async (maintenanceId) => {
    try {
      const response = await technicianApi.getMaintenanceById(maintenanceId);
      return response.data || response;
    } catch (err) {
      setError(err.message || 'Lỗi khi tải chi tiết bảo dưỡng');
      console.error('Error fetching maintenance detail:', err);
      throw err;
    }
  }, []);

  return { items, loading, error, refresh, createNote, getById };
}
