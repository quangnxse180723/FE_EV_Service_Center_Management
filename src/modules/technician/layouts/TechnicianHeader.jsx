import React from 'react';
import styles from './TechnicianHeader.module.css';

export default function TechnicianHeader() {
  const techName = localStorage.getItem("tech_name") || "Tên kỹ thuật viên";
  const techRole = localStorage.getItem("tech_role") || "Technician";

  return (
    <header className={styles.header}>
      <div className={styles.userInfo}>
        <div className={styles.avatar}>👨‍🔧</div>
        <div className={styles.name}>{techName}</div>
        <span className={styles.badge}>{techRole}</span>
      </div>
      <button className={styles.bellBtn} title="Thông báo">
        🔔
      </button>
    </header>
  );
}
