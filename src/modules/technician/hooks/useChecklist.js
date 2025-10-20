import { useCallback, useEffect, useState } from "react";
import technicianApi from "@/api/technicianApi";

export function useChecklist() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await technicianApi.getChecklistTemplate();
      setList(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải template checklist');
      console.error('Error fetching checklist template:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setAction = useCallback(async (inspectionId, itemId, action) => {
    try {
      const response = await technicianApi.updateInspectionItem(inspectionId, itemId, { action });
      setList(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật action');
      console.error('Error updating action:', err);
      throw err;
    }
  }, []);

  const setNote = useCallback(async (inspectionId, itemId, note) => {
    try {
      const response = await technicianApi.updateInspectionItem(inspectionId, itemId, { note });
      setList(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật ghi chú');
      console.error('Error updating note:', err);
      throw err;
    }
  }, []);

  return { list, loading, error, refresh, setAction, setNote };
}
