import { Link } from "react-router-dom";
import { TECH_STATUS } from "@/modules/technician/utils/technicianConstants";
import styles from "./ServiceTicketTable.module.css";

function StatusBadge({ status }) {
  const map = {
    [TECH_STATUS.APPROVED]: styles.approved,
    [TECH_STATUS.PENDING]: styles.pending,
    [TECH_STATUS.PROCESSING]: styles.processing,
    [TECH_STATUS.DONE]: styles.done,
  };
  return <span className={`${styles.badge} ${map[status]}`}>{status}</span>;
}

export default function ServiceTicketTable({ data=[], loading }) {
  if (loading) return <div className={styles.loading}>Đang tải phiếu dịch vụ…</div>;
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}><h2>Phiếu dịch vụ</h2></div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Xe</th>
              <th>Biển số</th>
              <th>Giờ hẹn</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                <td>{row.customerName}</td>
                <td>{row.vehicle}</td>
                <td>{row.plate}</td>
                <td>{row.schedule}</td>
                <td><StatusBadge status={row.status} /></td>
                <td>
                  <Link to={`/technician/service-orders/${row.id}`} className={styles.actionBtn}>Chi tiết</Link>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} className={styles.empty}>Không có phiếu nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
