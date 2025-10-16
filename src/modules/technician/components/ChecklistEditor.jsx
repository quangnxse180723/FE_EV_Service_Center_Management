import styles from "./ChecklistEditor.module.css";
import { TECH_ACTIONS } from "@/modules/technician/utils/technicianConstants";

export default function ChecklistEditor({ data=[], onChangeAction, onChangeNote }) {
  return (
    <div className={styles.card}>
      <div className={styles.head}><h3>Biên bản kiểm tra</h3></div>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <thead>
            <tr><th>STT</th><th>Mục kiểm tra</th><th>Hành động</th><th>Ghi chú</th></tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>
                  <select value={item.action || ""} onChange={e => onChangeAction(item.id, e.target.value)}>
                    <option value="">— Chọn —</option>
                    {TECH_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    placeholder="Ghi chú…"
                    value={item.note || ""}
                    onChange={e => onChangeNote(item.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={4} className={styles.empty}>Chưa có mục kiểm tra</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
