import { useParams } from "react-router-dom";
import { useServiceTicketDetail } from "../hooks/useServiceTickets";
import ServiceTicketDetailCard from "../components/ServiceTicketDetailCard";
import styles from "./ServiceTicketDetailPage.module.css";

export default function ServiceTicketDetailPage() {
  const { id } = useParams();
  const { ticket, loading, costs, toggleConfirm, changeCosts, finalize } = useServiceTicketDetail(id);

  if (loading) return <div className={styles.loading}>Đang tải chi tiết phiếu…</div>;
  if (!ticket) return <div className={styles.loading}>Không tìm thấy phiếu dịch vụ.</div>;

  return (
    <div className={styles.page}>
      <ServiceTicketDetailCard
        ticket={ticket}
        costs={costs}
        onToggleConfirm={toggleConfirm}
        onCostChange={changeCosts}
        onFinalize={finalize}
      />
    </div>
  );
}
