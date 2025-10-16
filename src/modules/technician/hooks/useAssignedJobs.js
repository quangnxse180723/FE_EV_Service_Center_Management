import { useCallback, useEffect, useState } from "react";
import { fetchAssignedJobs, acceptJob } from "../services/technicianService";

export function useAssignedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchAssignedJobs();
    setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const onAccept = useCallback(async (jobId) => {
    await acceptJob(jobId);
    refresh();
  }, [refresh]);

  return { jobs, loading, refresh, onAccept };
}
