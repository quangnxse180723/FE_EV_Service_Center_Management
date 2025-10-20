import { useCallback, useEffect, useState } from "react";
import technicianApi from "@/api/technicianApi";

export function useCertificates() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await technicianApi.getCertificates();
      setList(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách chứng chỉ');
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addCertificate = useCallback(async (data) => {
    try {
      await technicianApi.addCertificate(data);
      refresh();
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm chứng chỉ');
      console.error('Error adding certificate:', err);
      throw err;
    }
  }, [refresh]);

  const updateCertificate = useCallback(async (id, data) => {
    try {
      await technicianApi.updateCertificate(id, data);
      refresh();
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật chứng chỉ');
      console.error('Error updating certificate:', err);
      throw err;
    }
  }, [refresh]);

  const deleteCertificate = useCallback(async (id) => {
    try {
      await technicianApi.deleteCertificate(id);
      refresh();
    } catch (err) {
      setError(err.message || 'Lỗi khi xóa chứng chỉ');
      console.error('Error deleting certificate:', err);
      throw err;
    }
  }, [refresh]);

  return { list, loading, error, refresh, addCertificate, updateCertificate, deleteCertificate };
}
