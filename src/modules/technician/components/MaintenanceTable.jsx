import styles from "./MaintenanceTable.module.css";

export default function MaintenanceTable({ data=[] }) {
  return (
    <div className={styles.card}>
      <div className={styles.head}><h3>Danh sách bảo dưỡng</h3></div>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>Mã</th><th>Khách hàng</th><th>Xe</th><th>Lần gần nhất</th><th>Ghi chú</th></tr>
          </thead>
          <tbody>
            {data.map(x => (
              <tr key={x.code}>
                <td>{x.code}</td>
                <td>{x.customerName}</td>
                <td>{x.vehicle}</td>
                <td>{x.lastDate}</td>
                <td>{x.note || "—"}</td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={5} className={styles.empty}>Chưa có dữ liệu</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
