import styles from "./InspectionForm.module.css";
import { parseCurrencyVND, formatCurrencyVND } from "../../../utils/formatCurrency";

export default function InspectionForm({ form, setForm, onSubmit, saving }) {
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className={styles.card}>
      <div className={styles.head}><h3>Thông tin & Chi phí</h3></div>
      <div className={styles.grid}>
        <label>Khách hàng<input value={form.customerName} onChange={e=>set("customerName", e.target.value)} /></label>
        <label>Xe<input value={form.vehicle} onChange={e=>set("vehicle", e.target.value)} /></label>
        <label>Biển số<input value={form.plate} onChange={e=>set("plate", e.target.value)} /></label>
        <label>Ngày/giờ<input value={form.schedule} onChange={e=>set("schedule", e.target.value)} /></label>

        <label>Vật tư
          <input
            inputMode="numeric"
            value={form.material ? form.material.toLocaleString("vi-VN") : ""}
            onChange={e=>set("material", parseCurrencyVND(e.target.value))}
            placeholder="10.000"
          />
        </label>
        <label>Nhân công
          <input
            inputMode="numeric"
            value={form.labor ? form.labor.toLocaleString("vi-VN") : ""}
            onChange={e=>set("labor", parseCurrencyVND(e.target.value))}
            placeholder="50.000"
          />
        </label>
        <div className={styles.total}>
          <span>Tổng dự kiến:</span><strong>{formatCurrencyVND((form.material||0)+(form.labor||0))}</strong>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.primary} onClick={onSubmit} disabled={saving}>
          {saving ? "Đang lưu…" : "Tạo biên bản"}
        </button>
      </div>
    </div>
  );
}
