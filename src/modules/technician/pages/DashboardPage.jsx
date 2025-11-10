import React, { useState, useEffect } from 'react';
import technicianApi from '../../../api/technicianApi';
import scheduleApi from '../../../api/scheduleApi';

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { label: "Số xe đang xử lý", value: 0, color: "#ef4444" },
    { label: "Công việc trong ngày", value: 0, color: "#22c55e" },
  ]);
  const [scheduleCount, setScheduleCount] = useState(0);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy technicianId từ localStorage
      const technicianId = localStorage.getItem('technicianId');
      
      if (!technicianId) {
        throw new Error('Không tìm thấy thông tin kỹ thuật viên');
      }

      console.log('📊 Fetching dashboard data for technician:', technicianId);
      
      // Gọi API lấy thống kê
      const statsResponse = await technicianApi.getDashboardStats(technicianId);
      const statsData = statsResponse.data || statsResponse;
      
      console.log('✅ Dashboard stats loaded:', statsData);
      
      // Cập nhật stats
      setStats([
        { label: "Số xe đang xử lý", value: statsData.overdueCount || 0, color: "#ef4444" },
        { label: "Công việc trong ngày", value: statsData.workingCount || 0, color: "#22c55e" },
      ]);
      
      setScheduleCount(statsData.scheduleCount || 0);
      
      // Lấy danh sách xe được phân công với trạng thái IN_PROGRESS
      const vehiclesResponse = await technicianApi.getAssignedVehiclesByStatus(technicianId, 'IN_PROGRESS');
      const vehiclesData = vehiclesResponse.data || vehiclesResponse;
      
      console.log('✅ Upcoming schedules loaded:', vehiclesData);
      
      // Lấy 3 lịch đầu tiên và format
      const schedules = (Array.isArray(vehiclesData) ? vehiclesData : [])
        .slice(0, 3)
        .map(vehicle => {
          // Parse scheduledDate (format từ backend: "2024-12-15 09:00:00")
          const scheduleDate = new Date(vehicle.scheduledDate.replace(' ', 'T'));
          const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
          const dayName = dayNames[scheduleDate.getDay()];
          
          // Format ngày
          const day = scheduleDate.getDate().toString().padStart(2, '0');
          const month = (scheduleDate.getMonth() + 1).toString().padStart(2, '0');
          const year = scheduleDate.getFullYear();
          
          // Format giờ
          const hours = scheduleDate.getHours().toString().padStart(2, '0');
          const minutes = scheduleDate.getMinutes().toString().padStart(2, '0');
          
          // Kiểm tra xem có phải hôm nay không
          const today = new Date();
          const isToday = scheduleDate.toDateString() === today.toDateString();
          
          return {
            id: vehicle.scheduleId,
            dateText: `${dayName}, ${day}/${month}/${year}`,
            timeText: `${hours}:${minutes}`,
            vehicleName: vehicle.vehicleModel,
            licensePlate: vehicle.licensePlate,
            customerName: vehicle.customerName,
            isToday: isToday,
            status: vehicle.status
          };
        });
      
      setUpcomingSchedules(schedules);
      
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError(err.message || 'Không thể tải thống kê dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = (scheduleId) => {
    console.log('✅ Check-in for schedule:', scheduleId);
    // TODO: Implement check-in API call
    alert(`Check-in thành công cho lịch #${scheduleId}`);
  };

  if (loading) {
    return (
      <div className="wrap">
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Đang tải...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wrap">
        <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="wrap">
      <h1 className="title">Dashboard</h1>

      <div className="cards">
        {stats.map((s,i)=>(
          <div key={i} className="card">
            <div className="value" style={{color:s.color}}>{s.value}</div>
            <div className="desc">{s.label}</div>
          </div>
        ))}

        <div className="card purple">
          <div className="title2">
            Lịch phân công ca làm 
            <span style={{ marginLeft: '8px', fontSize: '14px' }}>
              
            </span>
          </div>
          <ul className="shifts">
            {upcomingSchedules.length > 0 ? (
              upcomingSchedules.map((schedule) => (
                <li key={schedule.id}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#7c3aed' }}>
                        📅 {schedule.dateText}
                      </span>
                      <span style={{ fontWeight: '700', color: '#1d4ed8' }}>
                        🕐 {schedule.timeText}
                      </span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>
                      🚗 {schedule.vehicleName} ({schedule.licensePlate})
                    </span>
                    <span style={{ fontSize: '12px', opacity: '0.7' }}>
                      👤 {schedule.customerName}
                    </span>
                  </div>
                  {schedule.isToday ? (
                    <button 
                      className="checkin-btn"
                      onClick={() => handleCheckIn(schedule.id)}
                    >
                      Check-in
                    </button>
                  ) : (
                    <i className="slot" />
                  )}
                </li>
              ))
            ) : (
              <li style={{ justifyContent: 'center', color: '#999' }}>
                Chưa có lịch phân công
              </li>
            )}
          </ul>
        </div>
      </div>

      <style>{`
        .title{font-size:28px;font-weight:800;margin-bottom:16px}
        .cards{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:16px}
        .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}
        .value{font-size:36px;font-weight:900}
        .desc{font-weight:800;margin-top:8px}
        .purple{background:#7c3aed;color:#fff}
        .title2{font-weight:800;margin-bottom:10px}
        .shifts{display:flex;flex-direction:column;gap:10px}
        .shifts li{display:flex;justify-content:space-between;align-items:center;background:#fff;color:#111;border-radius:8px;padding:10px 12px}
        .checkin-btn{
          background:#1d4ed8;
          color:#fff;
          border:none;
          padding:6px 16px;
          border-radius:6px;
          font-size:13px;
          font-weight:600;
          cursor:pointer;
          transition:all 0.2s;
        }
        .checkin-btn:hover{
          background:#1e40af;
          transform:translateY(-1px);
        }
        .slot{display:inline-block;width:70px;height:20px;background:#d1d5db;border-radius:6px}
      `}</style>
    </div>
  );
}
