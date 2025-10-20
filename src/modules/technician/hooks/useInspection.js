import { useCallback, useState } from "react";
import technicianApi from "@/api/technicianApi";

export function useInspection(recordId) {
  const [inspection, setInspection] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadInspection = useCallback(async (id = recordId) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await technicianApi.getOrCreateInspectionRecord(id);
      setInspection(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải biên bản kiểm tra');
      console.error('Error loading inspection:', err);
    } finally {
      setLoading(false);
    }
  }, [recordId]);

  const saveInspection = useCallback(async (payload) => {
    try {
      setSaving(true);
      setError(null);
      const response = await technicianApi.createInspectionRecord(payload);
      return response.data || response;
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu biên bản kiểm tra');
      console.error('Error saving inspection:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateItem = useCallback(async (inspectionId, itemId, data) => {
    try {
      const response = await technicianApi.updateInspectionItem(inspectionId, itemId, data);
      setInspection(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật mục kiểm tra');
      console.error('Error updating inspection item:', err);
      throw err;
    }
  }, []);

  const submitForApproval = useCallback(async (inspectionId) => {
    try {
      const response = await technicianApi.submitForApproval(inspectionId);
      return response.data || response;
    } catch (err) {
      setError(err.message || 'Lỗi khi gửi phê duyệt');
      console.error('Error submitting for approval:', err);
      throw err;
    }
  }, []);

  return { 
    inspection, 
    loading, 
    saving, 
    error, 
    loadInspection, 
    saveInspection, 
    updateItem, 
    submitForApproval 
  };
}
