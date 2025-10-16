// src/modules/technician/pages/AssignedJobsPage.jsx
import { useEffect, useState } from "react";
import styles from "./AssignedJobsPage.module.css";
import AssignedJobsTable from "../components/AssignedJobsTable";
import { fetchAssignedJobs } from "../services/technicianService";

export default function AssignedJobsPage() {
  const [list, setList] = useState([]);

  const load = async () => {
    const data = await fetchAssignedJobs();
    setList(data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Xe được phân công</h2>
      <AssignedJobsTable data={list} onReload={load} />
    </div>
  );
}
