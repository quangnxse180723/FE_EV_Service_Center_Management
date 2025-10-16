import styles from "./CertificateList.module.css";

export default function CertificateList({ data=[] }) {
  return (
    <div className={styles.grid}>
      {data.map(c => (
        <div className={styles.card} key={c.code}>
          <div className={styles.title}>{c.name}</div>
          <div className={styles.meta}>
            <span>Mã: <strong>{c.code}</strong></span>
            <span>Cấp bởi: <strong>{c.issuer}</strong></span>
            <span>Hiệu lực đến: <strong>{c.expiredAt}</strong></span>
          </div>
        </div>
      ))}
      {data.length === 0 && <div className={styles.empty}>Chưa có chứng chỉ</div>}
    </div>
  );
}
