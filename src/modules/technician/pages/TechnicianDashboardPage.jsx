import styles from "./TechnicianDashboardPage.module.css";
import DashboardStats from "../components/DashboardStats";

export default function TechnicianDashboardPage() {
  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Dashboard</h2>
      <DashboardStats />
    </div>
  );
}
