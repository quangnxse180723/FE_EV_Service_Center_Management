import { useEffect, useState } from "react";
import JobList from "../components/JobList";
import { fetchAssignedJobs, checkInRecord } from "../../technician/services/technicianService";
import { useNavigate } from "react-router-dom";

export default function AssignedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const data = await fetchAssignedJobs(1, "ALL"); // technicianId=1 mock
    setJobs(data);
  };
  useEffect(()=>{ load(); },[]);

  const onCheckIn = async (recordId) => {
    await checkInRecord(recordId);
    await load();
  };

  const onCreateInspection = (recordId) => {
  localStorage.setItem("last_record_id", String(recordId)); // ghi nhớ lần gần nhất
  navigate(`/technician/inspection/${recordId}`);
  };

  return (
    <div className="page">
      <h1 className="title">Xe được phân công</h1>
      <div className="panel">
        <JobList jobs={jobs} onCheckIn={onCheckIn} onCreateInspection={onCreateInspection}/>
      </div>

      <style>{`
        .title{font-size:28px;font-weight:800;margin-bottom:16px}
        .panel{background:#f3f3f3;border:1px solid #e6e6e6;padding:24px;border-radius:8px}
      `}</style>
    </div>
  );
}
