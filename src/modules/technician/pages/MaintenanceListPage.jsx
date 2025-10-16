import { useMaintenance } from "../hooks/useMaintenance";
import MaintenanceTable from "../components/MaintenanceTable";
import styles from "./MaintenanceListPage.module.css";

export default function MaintenanceListPage() {
  const { items, loading, refresh } = useMaintenance();
  if (loading) return <div className={styles.loading}>Đang tải…</div>;
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Danh sách bảo dưỡng</h2>
        <button className={styles.refresh} onClick={refresh}>Tải lại</button>
      </div>
      <MaintenanceTable data={items} />
    </div>
  );
}
