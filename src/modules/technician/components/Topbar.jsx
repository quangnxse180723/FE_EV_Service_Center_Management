import styles from "./Topbar.module.css";
import { useLocation } from "react-router-dom";
import { TECH_PAGE_TITLES } from "@/modules/technician/utils/technicianConstants";

export default function Topbar() {
  const location = useLocation();
  const title =
    TECH_PAGE_TITLES[location.pathname] || "Bảng điều khiển kỹ thuật viên";

  return (
    <header className={styles.topbar}>
      <h1>{title}</h1>
    </header>
  );
}
