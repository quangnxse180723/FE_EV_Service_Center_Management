import ServiceTicketTable from "../components/ServiceTicketTable";
import { useServiceTickets } from "../hooks/useServiceTickets";
import styles from "./ServiceTicketsPage.module.css";

export default function ServiceTicketsPage() {
  const { tickets, loading, refresh } = useServiceTickets();
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Danh sách phiếu dịch vụ</h2>
        <button className={styles.refresh} onClick={refresh}>Tải lại</button>
      </div>
      <ServiceTicketTable data={tickets} loading={loading} />
    </div>
  );
}
