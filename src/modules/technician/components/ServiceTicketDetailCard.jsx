import styles from "./ServiceTicketDetailCard.module.css";
import { TECH_STATUS } from "@/modules/technician/utils/technicianConstants";
import { formatCurrencyVND, parseCurrencyVND } from "@/utils/formatCurrency";

function Section({ title, children }) {
  return <section className={styles.section}><h3>{title}</h3><div>{children}</div></section>;
}

function Badge({ status }) {
  const map = {
    [TECH_STATUS.APPROVED]: styles.approved,
    [TECH_STATUS.PENDING]: styles.pending,
    [TECH_STATUS.PROCESSING]: styles.processing,
    [TECH_STATUS.DONE]: styles.done,
  };
  return <span className={`${styles.badge} ${map[status]}`}>{status}</span>;
}

export default function ServiceTicketDetailCard({ ticket, costs, onToggleConfirm, onCostChange, onFinalize }) {
  if (!ticket) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2>Phiếu dịch vụ</h2>
        <Badge status={ticket.status} />
      </div>

      <Section title="Thông tin xe & khách hàng">
        <ul className={styles.meta}>
          <li><strong>Chủ xe:</strong> {ticket.customerName}</li>
          <li><strong>Xe:</strong> {ticket.vehicle}</li>
          <li><strong>Biển số:</strong> {ticket.plate}</li>
          <li><strong>Ngày/giờ:</strong> {ticket.schedule}</li>
        </ul>
      </Section>

      <Section title="Checklist công việc">
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Phụ tùng</th>
                <th>Hành động</th>
                <th>Tiến độ</th>
                <th>Vật tư</th>
                <th>Nhân công</th>
                <th>Xác nhận</th>
              </tr>
            </thead>
            <tbody>
              {ticket.items.map(item => (
                <tr key={item.no}>
                  <td>{item.no}</td>
                  <td>{item.name}</td>
                  <td>{item.action}</td>
                  <td>
                    <span className={`${styles.badge} ${item.progress === "Hoàn thành" ? styles.done : styles.processing}`}>
                      {item.progress}
                    </span>
                  </td>
                  <td>
                    <input
                      type="text" inputMode="numeric" className={styles.money}
                      value={item.material ? item.material.toLocaleString("vi-VN") : ""}
                      onChange={e => onCostChange(item.no, parseCurrencyVND(e.target.value), item.labor)}
                      placeholder="10.000"
                    />
                  </td>
                  <td>
                    <input
                      type="text" inputMode="numeric" className={styles.money}
                      value={item.labor ? item.labor.toLocaleString("vi-VN") : ""}
                      onChange={e => onCostChange(item.no, item.material, parseCurrencyVND(e.target.value))}
                      placeholder="50.000"
                    />
                  </td>
                  <td>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={item.confirmed}
                        onChange={e => onToggleConfirm(item.no, e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Chi phí dự kiến">
        <div className={styles.costs}>
          <div><span>Vật tư:</span><strong>{formatCurrencyVND(costs.material)}</strong></div>
          <div><span>Nhân công:</span><strong>{formatCurrencyVND(costs.labor)}</strong></div>
          <div className={styles.total}><span>Tổng:</span><strong>{formatCurrencyVND(costs.total)}</strong></div>
        </div>
      </Section>

      <div className={styles.actions}>
        <button className={styles.primary} onClick={onFinalize} disabled={ticket.status === TECH_STATUS.DONE}>
          Xác nhận hoàn tất
        </button>
      </div>
    </div>
  );
}
