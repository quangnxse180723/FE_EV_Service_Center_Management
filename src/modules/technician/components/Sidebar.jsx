import { NavLink } from "react-router-dom";
import { TECH_ROUTES } from "@/modules/technician/utils/technicianConstants";
import styles from "./Sidebar.module.css";

export default function Sidebar({ activePath, onLogout }) {
  const menu = [
    { label: "Dashboard", path: TECH_ROUTES.ROOT },
    { label: "Xe được phân công", path: TECH_ROUTES.ASSIGNED },
    { label: "Phiếu dịch vụ", path: TECH_ROUTES.SERVICE_LIST },
    { label: "Biên bản kiểm tra", path: TECH_ROUTES.INSPECTION_CREATE },
    { label: "Danh sách bảo dưỡng", path: TECH_ROUTES.MAINTENANCE },
    { label: "Quản lý chứng chỉ", path: TECH_ROUTES.CERTS },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>⚙️ Technician</div>
      <nav className={styles.nav}>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${
              activePath === item.path ? styles.active : ""
            }`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button className={styles.logoutBtn} onClick={onLogout}>
        Đăng xuất
      </button>
    </aside>
  );
}
