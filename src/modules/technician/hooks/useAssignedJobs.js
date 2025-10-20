import { useCallback, useEffect, useState } from "react";
import technicianApi from "@/api/technicianApi";

export function useAssignedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await technicianApi.getAssignedJobs();
      setJobs(response.data || response);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách công việc');
      console.error('Error fetching assigned jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const onAccept = useCallback(async (jobId) => {
    try {
      await technicianApi.acceptJob(jobId);
      refresh();
    } catch (err) {
      setError(err.message || 'Lỗi khi nhận công việc');
      console.error('Error accepting job:', err);
      throw err;
    }
  }, [refresh]);

  return { jobs, loading, error, refresh, onAccept };
}
