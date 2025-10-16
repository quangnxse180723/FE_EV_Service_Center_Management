import { useCertificates } from "../hooks/useCertificates";
import CertificateList from "../components/CertificateList";
import styles from "./CertificateManagementPage.module.css";

export default function CertificateManagementPage() {
  const { list, loading, refresh } = useCertificates();
  if (loading) return <div className={styles.loading}>Đang tải chứng chỉ…</div>;
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Quản lý chứng chỉ</h2>
        <button className={styles.refresh} onClick={refresh}>Tải lại</button>
      </div>
      <CertificateList data={list} />
    </div>
  );
}
