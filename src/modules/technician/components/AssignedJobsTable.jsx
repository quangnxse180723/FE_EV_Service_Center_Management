import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AssignedJobsTable.module.css";
import { acceptJob } from "../services/technicianService";

export default function AssignedJobsTable({ data = [], onReload }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleAccept = async (jobId) => {
    try {
      setLoadingId(jobId);
      await acceptJob(jobId);
      onReload?.(); // gọi reload list ở page cha
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h3>Xe được phân công</h3>
        <button className={styles.refreshBtn} onClick={onReload}>Tải lại</button>
      </div>

      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Xe</th>
              <th>Biển số</th>
              <th>Giờ hẹn</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isWaiting = row.status === "Chờ nhận";
              return (
                <tr key={row.id}>
                  <td>{row.customerName}</td>
                  <td>{row.vehicle}</td>
                  <td>{row.plate}</td>
                  <td>{row.schedule}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        isWaiting ? styles.waiting : styles.processing
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    {isWaiting ? (
                      <button
                        className={styles.acceptBtn}
                        onClick={() => handleAccept(row.id)}
                        disabled={loadingId === row.id}
                      >
                        {loadingId === row.id ? "Đang nhận..." : "Xác nhận"}
                      </button>
                    ) : (
                      <Link
                        className={styles.createBtn}
                        to={`/technician/inspection/create?jobId=${encodeURIComponent(
                          row.id
                        )}`}
                      >
                        Tạo biên bản kiểm tra
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
