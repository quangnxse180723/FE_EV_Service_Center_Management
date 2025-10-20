import { useEffect, useState } from "react";
import styles from "./DashboardStats.module.css";
import { fetchTechnicianDashboard, techCheckinShift } from "../services/technicianService";

export default function DashboardStats() {
  const [data, setData] = useState({
    processingCount: 0,
    todayTaskCount: 0,
    shifts: [],
  });
  const [checkedInShifts, setCheckedInShifts] = useState(new Set());

  useEffect(() => {
    (async () => {
      const res = await fetchTechnicianDashboard();
      setData(res);
    })();
  }, []);

  const onCheckin = async (shiftId) => {
    const r = await techCheckinShift(shiftId);
    if (r?.ok) {
      // Thêm shift vào danh sách đã check-in
      setCheckedInShifts(prev => new Set([...prev, shiftId]));
      alert("Check-in successfully!");
    }
  };

  return (
    <div className={styles.grid}>
      {/* Ô 1: Số xe đang xử lý */}
      <div className={`${styles.square} ${styles.red}`}>
        <div className={styles.squareTitle}>Số xe đang xử lý</div>
        <div className={styles.squareValue}>{data.processingCount}</div>
        <div className={styles.squareIcon} aria-hidden>⏳</div>
      </div>

      {/* Ô 2: Công việc trong ngày */}
      <div className={`${styles.square} ${styles.green}`}>
        <div className={styles.squareTitle}>Công việc trong ngày</div>
        <div className={styles.squareValue}>{data.todayTaskCount}</div>
        <div className={styles.squareIcon} aria-hidden>🛠️</div>
      </div>

      {/* Ô 3: Lịch phân công ca làm */}
      <div className={styles.scheduleCard}>
        <div className={styles.scheduleTitle}>Lịch phân công ca làm</div>
        <div className={styles.scheduleBody}>
          {data.shifts.map((s) => {
            const isCheckedIn = checkedInShifts.has(s.id);
            
            return (
              <div key={s.id} className={styles.shiftRow}>
                <div className={styles.shiftLabel}>{s.label}</div>
                
                {/* Progress bar - chỉ hiện khi có progress */}
                {typeof s.progress === "number" && (
                  <div className={styles.progressWrap}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${s.progress}%` }}
                      aria-label={`tiến độ ${s.progress}%`}
                    />
                  </div>
                )}
                
                {/* Nút check-in hoặc status */}
                <div className={styles.actionArea}>
                  {isCheckedIn ? (
                    <div className={styles.checkedIn}>Checked In</div>
                  ) : s.showCheckin ? (
                    <button 
                      className={`${styles.checkinBtn} ${!s.canCheckin ? styles.disabled : ''}`}
                      onClick={() => s.canCheckin && onCheckin(s.id)}
                      disabled={!s.canCheckin}
                    >
                      Check-in
                    </button>
                  ) : (
                    <div className={styles.placeholder}></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
