import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import styles from "./TechnicianLayout.module.css";

export default function TechnicianLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // sau này bạn có thể gắn logic authContext.logout()
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      <Sidebar activePath={location.pathname} onLogout={handleLogout} />
      <div className={styles.main}>
        <Topbar />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
