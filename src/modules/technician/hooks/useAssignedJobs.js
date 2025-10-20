import { useEffect, useState } from "react";
import { fetchAssignedJobs } from "../../technician/services/technicianService";

export function useAssignedJobs(technicianId, filter="ALL"){
  const [jobs,setJobs] = useState([]); const [loading,setLoading]=useState(false);
  const load = async ()=>{
    setLoading(true);
    try{ setJobs(await fetchAssignedJobs(technicianId, filter)); }
    finally{ setLoading(false); }
  };
  useEffect(()=>{ load(); },[technicianId, filter]);
  return { jobs, loading, reload: load };
}
