import { Outlet } from "react-router-dom";
import TechnicianSidebar from './TechnicianSidebar';
import TechnicianHeader from './TechnicianHeader';
import styles from './TechnicianLayout.module.css';

export default function TechnicianLayout() {
  return (
    <div className={styles.layout}>
      <TechnicianSidebar />
      <section className={styles.mainSection}>
        <TechnicianHeader />
        <div className={styles.content}>
          <Outlet />
        </div>
      </section>
    </div>
  );
}
