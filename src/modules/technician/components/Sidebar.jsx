import { NavLink, useNavigate } from "react-router-dom";
import { TECH_ROUTES } from "../utils/technicianConstants";
import styles from "./Sidebar.module.css";

export default function Sidebar({ activePath }) {
  const navigate = useNavigate();

  const menu = [
    { label: "Dashboard", path: TECH_ROUTES.ROOT },
    { label: "Xe được phân công", path: TECH_ROUTES.ASSIGNED },
    { label: "Phiếu dịch vụ", path: TECH_ROUTES.SERVICE_LIST },
    { label: "Biên bản kiểm tra", path: TECH_ROUTES.INSPECTION_CREATE },
    { label: "Danh sách bảo dưỡng", path: TECH_ROUTES.MAINTENANCE },
    { label: "Quản lý chứng chỉ", path: TECH_ROUTES.CERTS },
  ];

  const handleLogout = () => {
    // Xóa toàn bộ thông tin đăng nhập
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('role');
    localStorage.removeItem('accountId');
    localStorage.removeItem('token');
    
    // Chuyển về trang chủ
    navigate('/', { replace: true });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>⚙️ Technician</div>
      <nav className={styles.nav}>
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button className={styles.logoutBtn} onClick={handleLogout}>
        🚪 Đăng xuất
      </button>
    </aside>
  );
}
