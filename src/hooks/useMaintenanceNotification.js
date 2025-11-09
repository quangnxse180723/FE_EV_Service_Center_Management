import { useEffect, useState } from 'react';
import vehicleApi from '../api/vehicleApi';
import notificationApi from '../api/notificationApi';

/**
 * Custom hook để kiểm tra và tạo thông báo bảo dưỡng tự động
 * Logic: 
 * - Kiểm tra mỗi lần component mount (khi user đăng nhập)
 * - Thông báo khi xe sắp đến hạn (còn 100km hoặc 7 ngày)
 * - Thông báo khi xe quá hạn bảo dưỡng
 */
export const useMaintenanceNotification = (customerId) => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Hàm tính số tháng kể từ lần bảo dưỡng cuối
  const calculateMonthsSince = (lastServiceDate) => {
    if (!lastServiceDate) return 0;
    const lastDate = new Date(lastServiceDate);
    const today = new Date();
    const monthsDiff = (today.getFullYear() - lastDate.getFullYear()) * 12 + 
                       (today.getMonth() - lastDate.getMonth());
    return monthsDiff;
  };

  // Hàm kiểm tra xe cần bảo dưỡng
  const checkMaintenanceNeeded = (vehicle) => {
    const kmPerMaintenance = 1000;
    const monthsPerMaintenance = 3;
    const warningThresholdKm = 100; // Cảnh báo trước 100km
    const warningThresholdDays = 7; // Cảnh báo trước 7 ngày
    
    const currentKm = vehicle.currentMileage || 0;
    const lastServiceDate = vehicle.lastServiceDate;
    
    // Tính level hiện tại
    const levelByKm = Math.floor(currentKm / kmPerMaintenance);
    const monthsSince = calculateMonthsSince(lastServiceDate);
    const levelByTime = Math.floor(monthsSince / monthsPerMaintenance);
    
    const currentLevel = Math.max(levelByKm, levelByTime);
    
    // Nếu chưa đến kỳ đầu tiên
    if (currentLevel === 0) return null;
    
    // Kiểm tra quá hạn theo km
    const nextKmMilestone = (levelByKm + 1) * kmPerMaintenance;
    const kmToNext = nextKmMilestone - currentKm;
    const isKmOverdue = levelByKm >= currentLevel && kmToNext > kmPerMaintenance - warningThresholdKm;
    const isKmDue = levelByKm >= currentLevel;
    
    // Kiểm tra quá hạn theo thời gian
    const monthsOverdue = monthsSince - (currentLevel * monthsPerMaintenance);
    const isTimeOverdue = monthsOverdue > 0;
    const isTimeDue = lastServiceDate && monthsOverdue >= -0.25; // Cảnh báo trước 7-8 ngày
    
    // Xác định mức độ ưu tiên
    let priority = 'info';
    let message = '';
    let notificationType = 'MAINTENANCE_DUE';
    
    if (isKmOverdue || isTimeOverdue) {
      priority = 'urgent';
      notificationType = 'MAINTENANCE_OVERDUE';
      if (isKmOverdue && isTimeOverdue) {
        message = `⚠️ Xe ${vehicle.licensePlate} (${vehicle.model}) đã quá hạn bảo dưỡng! Quá ${Math.floor(monthsOverdue)} tháng và ${currentKm - (currentLevel * kmPerMaintenance)} km. Vui lòng đặt lịch ngay!`;
      } else if (isKmOverdue) {
        message = `⚠️ Xe ${vehicle.licensePlate} (${vehicle.model}) đã quá ${currentKm - (currentLevel * kmPerMaintenance)} km so với kỳ bảo dưỡng. Vui lòng đặt lịch ngay!`;
      } else {
        message = `⚠️ Xe ${vehicle.licensePlate} (${vehicle.model}) đã quá ${Math.floor(monthsOverdue)} tháng kể từ lần bảo dưỡng cuối. Vui lòng đặt lịch ngay!`;
      }
    } else if (isKmDue || isTimeDue) {
      priority = 'warning';
      if (kmToNext <= warningThresholdKm && kmToNext > 0) {
        message = `🔔 Xe ${vehicle.licensePlate} (${vehicle.model}) sắp đến kỳ bảo dưỡng (còn ${kmToNext} km). Hãy đặt lịch sớm để được phục vụ tốt nhất!`;
      } else if (isTimeDue) {
        const daysToNext = Math.ceil((monthsPerMaintenance - (monthsSince % monthsPerMaintenance)) * 30);
        message = `🔔 Xe ${vehicle.licensePlate} (${vehicle.model}) sắp đến kỳ bảo dưỡng (còn khoảng ${daysToNext} ngày). Hãy đặt lịch sớm!`;
      }
    }
    
    if (!message) return null;
    
    return {
      vehicleId: vehicle.vehicleId || vehicle.id,
      licensePlate: vehicle.licensePlate,
      model: vehicle.model,
      message,
      priority,
      type: notificationType,
      maintenanceLevel: currentLevel,
      kmToNext,
      monthsOverdue: isTimeOverdue ? monthsOverdue : null
    };
  };

  // Hàm kiểm tra tất cả xe và tạo thông báo
  const checkAndNotify = async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      
      // Lấy danh sách xe của customer
      const response = await vehicleApi.getCustomerVehicles(customerId);
      const vehicles = Array.isArray(response) ? response : response?.data || [];
      
      console.log('🔍 Checking maintenance for vehicles:', vehicles.length);
      
      const pendingNotifications = [];
      
      // Kiểm tra từng xe
      for (const vehicle of vehicles) {
        const notification = checkMaintenanceNeeded(vehicle);
        if (notification) {
          pendingNotifications.push(notification);
          console.log('⚠️ Maintenance needed:', notification);
        }
      }
      
      // Tạo thông báo qua API
      if (pendingNotifications.length > 0) {
        console.log('🔔 Creating notifications for', pendingNotifications.length, 'vehicles');
        
        for (const notif of pendingNotifications) {
          try {
            const accountId = localStorage.getItem('accountId');
            
            // Kiểm tra xem đã có thông báo tương tự chưa (trong 24h gần nhất)
            try {
              const existing = await notificationApi.checkNotificationExists(
                accountId,
                notif.vehicleId,
                notif.type
              );
              
              if (existing && existing.exists) {
                console.log('⏭️ Skipping duplicate notification for:', notif.licensePlate);
                continue; // Bỏ qua nếu đã có thông báo tương tự
              }
            } catch (checkError) {
              // Nếu API check chưa có, vẫn tiếp tục tạo thông báo
              console.warn('⚠️ Check notification API not available, creating anyway');
            }
            
            // Gọi API để tạo thông báo
            await notificationApi.createMaintenanceNotification({
              accountId: accountId,
              message: notif.message,
              type: notif.type,
              priority: notif.priority,
              vehicleId: notif.vehicleId,
              link: '/booking' // Link đến trang đặt lịch
            });
            console.log('✅ Notification created for:', notif.licensePlate);
          } catch (error) {
            console.error('❌ Error creating notification for', notif.licensePlate, ':', error);
            // Tiếp tục với xe khác ngay cả khi có lỗi
          }
        }
        
        setNotifications(pendingNotifications);
        console.log('✅ Maintenance check completed:', pendingNotifications.length, 'notifications processed');
      } else {
        console.log('✅ No maintenance notifications needed at this time');
      }
      
    } catch (error) {
      console.error('❌ Error checking maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chạy kiểm tra khi component mount
  useEffect(() => {
    if (customerId) {
      // Delay 2s để tránh gọi API quá nhanh khi vừa load trang
      const timer = setTimeout(() => {
        checkAndNotify();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [customerId]);

  return {
    loading,
    notifications,
    recheckMaintenance: checkAndNotify
  };
};

export default useMaintenanceNotification;
