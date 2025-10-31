import { useEffect, useState } from "react";
import { fetchAssignedJobs, checkInRecord } from "../../technician/services/technicianService";
import { useNavigate } from "react-router-dom";
import styles from './AssignedJobsPage.module.css';

export default function AssignedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    console.log('🔄 [NEW CODE] Loading assigned jobs...');
    console.log('🆕 CODE VERSION: 2.0 - UPDATED');
    
    try {
      // Không truyền technicianId, để service tự lấy
      const data = await fetchAssignedJobs(null, "ALL");
      console.log('✅ Loaded jobs:', data);
      setJobs(data);
    } catch (error) {
      console.error('❌ Error loading jobs:', error);
    }
  };
  
  useEffect(() => { load(); }, []);

  const onCheckIn = async (recordId) => {
    await checkInRecord(recordId);
    await load();
  };

  const onCreateInspection = (scheduleId) => {
    localStorage.setItem("last_schedule_id", String(scheduleId));
    navigate(`/technician/inspection/${scheduleId}`);
  };

  const getStatusClass = (status) => {
    if (status === "Chờ nhận") return styles['status-pending'];
    if (status === "Đang kiểm tra") return styles['status-working'];
    return styles['status-completed'];
  };

  return (
    <div className={styles['assigned-jobs-page']}>
      <div className={styles['page-header']}>
        <h1 className={styles['page-title']}>Xe được phân công</h1>
      </div>

      <div className={styles['content-card']}>
        <div className={styles['card-header']}>
          <h2>Danh sách xe</h2>
        </div>

        <div className={styles['table-wrapper']}>
          <table className={styles['vehicles-table']}>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Xe</th>
                <th>Biển số xe</th>
                <th>Giờ hẹn</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.record_id}>
                  <td>{job.customer_name}</td>
                  <td>{job.vehicle_model}</td>
                  <td className={styles['license-plate']}>{job.license_plate}</td>
                  <td>{job.appointment_time}</td>
                  <td>
                    <span className={`${styles['status-badge']} ${getStatusClass(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles['action-buttons']}>
                      {job.status === "Chờ nhận" ? (
                        <button 
                          className={styles['btn-accept']} 
                          onClick={() => onCheckIn(job.record_id)}
                        >
                          Xác nhận
                        </button>
                      ) : (
                        <button 
                          className={styles['btn-inspect']} 
                          onClick={() => onCreateInspection(job.record_id)}
                        >
                          Tạo biên bản kiểm tra
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
