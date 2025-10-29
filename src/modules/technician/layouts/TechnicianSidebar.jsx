import { NavLink, useNavigate } from "react-router-dom";
import styles from './TechnicianSidebar.module.css';

export default function TechnicianSidebar() {
  const navigate = useNavigate();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoContent}>
          <span className={styles.icon}>⚡</span>
          <span className={styles.brand}>VOLTFIX</span>
        </div>
      </div>

      <nav className={styles.menu}>
        <MenuItem to="/technician" end icon="▦" label="Dashboard" />
        <MenuItem to="/technician/assigned-jobs" icon="🛵" label="Xe được phân công" />
        <MenuItem to="/technician/services" icon="🗓️" label="Phiếu dịch vụ" />
        <MenuItem to="/technician/inspection" icon="✅" label="Biên bản kiểm tra" />
      </nav>

      <div className={styles.logoutWrap}>
        <button className={styles.logoutBtn} onClick={() => navigate("/")}>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}

function MenuItem({ to, icon, label, end, disabled }) {
  if (disabled) {
    return (
      <div className={`${styles.menuItem} ${styles.disabled}`}>
        <span className={styles.menuIcon}>{icon}</span>
        <span>{label}</span>
      </div>
    );
  }
  return (
    <NavLink 
      to={to} 
      end={end} 
      className={({isActive}) => `${styles.menuItem} ${isActive ? styles.active : ''}`}
    >
      <span className={styles.menuIcon}>{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}
