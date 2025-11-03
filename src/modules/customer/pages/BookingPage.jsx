import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './BookingPage.css';
import mapImage from '/src/assets/img/map.png';
import lichImage from '/src/assets/img/lich.png';
import logoImage from '/src/assets/img/logo.png';
import defaultAvatar from '/src/assets/img/user-avatar.jpg';
import scheduleApi from '../../../api/scheduleApi';
import vehicleApi from '../../../api/vehicleApi';
import serviceApi from '../../../api/serviceApi';
import centerApi from '../../../api/centerApi';
import customerApi from '../../../api/customerApi';

export default function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();
  
  // State cho customer data từ database
  const [customerData, setCustomerData] = useState(null);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  
  // User info - sẽ cập nhật từ customerData
  const userInfo = customerData ? {
    id: customerData.customerId,
    name: customerData.fullName || 'Khách hàng',
    phone: customerData.phone || 'Chưa cập nhật',
    email: customerData.email || 'Chưa cập nhật',
    avatar: defaultAvatar // Sử dụng avatar mặc định
  } : {
    name: user?.fullName || 'Khách hàng',
    phone: user?.phone || 'Chưa cập nhật',
    email: user?.email || 'Chưa cập nhật',
    avatar: defaultAvatar // Sử dụng avatar mặc định
  };

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCustomerInfoModalOpen, setIsCustomerInfoModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedUserInfo, setEditedUserInfo] = useState({});

  // State cho các bước
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [suggestedPackage, setSuggestedPackage] = useState(null); // Gói bảo dưỡng được gợi ý
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [searchCenter, setSearchCenter] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [vehicleKm, setVehicleKm] = useState({}); // Lưu km của từng xe
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [pendingVehicle, setPendingVehicle] = useState(null);

  // State cho data từ API
  const [userVehicles, setUserVehicles] = useState([]);
  const [serviceCenters, setServiceCenters] = useState([]);
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState({ morning: [], afternoon: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hàm tính số tháng đã trôi qua kể từ ngày bảo dưỡng cuối hoặc ngày mua xe
  const calculateMonthsSinceLastService = (lastServiceDate) => {
    if (!lastServiceDate) return 0;
    const lastDate = new Date(lastServiceDate);
    const today = new Date();
    const monthsDiff = (today.getFullYear() - lastDate.getFullYear()) * 12 + 
                       (today.getMonth() - lastDate.getMonth());
    return monthsDiff;
  };

  // Hàm tính lần bảo dưỡng dựa trên km HOẶC thời gian (3 tháng)
  // Cứ 1000km HOẶC 3 tháng thì bảo dưỡng 1 lần
  const calculateMaintenanceLevel = (km, lastServiceDate) => {
    const kmPerMaintenance = 1000;
    const monthsPerMaintenance = 3;
    
    // Tính số lần bảo dưỡng dựa trên km
    const levelByKm = km ? Math.floor(km / kmPerMaintenance) : 0;
    
    // Tính số lần bảo dưỡng dựa trên thời gian
    const monthsPassed = calculateMonthsSinceLastService(lastServiceDate);
    const levelByTime = Math.floor(monthsPassed / monthsPerMaintenance);
    
    // Lấy giá trị lớn hơn (đạt điều kiện nào trước thì tính theo đó)
    const maintenanceLevel = Math.max(levelByKm, levelByTime);
    
    return maintenanceLevel > 0 ? maintenanceLevel : null;
  };

  // Hàm tính toán thông tin bảo dưỡng tiếp theo
  const calculateNextMaintenance = (km, lastServiceDate) => {
    const kmPerMaintenance = 1000;
    const monthsPerMaintenance = 3;
    
    // Tính km còn lại đến lần bảo dưỡng tiếp theo
    const currentLevel = Math.floor(km / kmPerMaintenance);
    const nextKmMilestone = (currentLevel + 1) * kmPerMaintenance;
    const kmRemaining = nextKmMilestone - km;
    
    // Tính thời gian còn lại đến lần bảo dưỡng tiếp theo
    let monthsRemaining = null;
    let nextMaintenanceDate = null;
    
    if (lastServiceDate) {
      const monthsPassed = calculateMonthsSinceLastService(lastServiceDate);
      const currentTimeLevel = Math.floor(monthsPassed / monthsPerMaintenance);
      const nextMonthMilestone = (currentTimeLevel + 1) * monthsPerMaintenance;
      monthsRemaining = nextMonthMilestone - monthsPassed;
      
      // Tính ngày bảo dưỡng tiếp theo
      const lastDate = new Date(lastServiceDate);
      nextMaintenanceDate = new Date(lastDate);
      nextMaintenanceDate.setMonth(lastDate.getMonth() + nextMonthMilestone);
    }
    
    return {
      kmRemaining,
      nextKmMilestone,
      monthsRemaining,
      nextMaintenanceDate
    };
  };

  // Hàm xử lý thay đổi km của xe
  const handleKmChange = (vehicleId, value) => {
    setVehicleKm(prev => ({
      ...prev,
      [vehicleId]: value
    }));
  };

  // Fetch data từ API khi component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Lấy customerId từ localStorage
        const customerId = localStorage.getItem('customerId');
        
        if (!customerId || customerId === 'null' || customerId === 'undefined') {
          throw new Error('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
        }

        // Fetch tất cả data song song
        const [vehiclesRes, centersRes, servicesRes, customerRes] = await Promise.all([
          vehicleApi.getCustomerVehicles(customerId).catch(err => {
            console.error('Error fetching customer vehicles:', err);
            throw err;
          }),
          centerApi.getAllCenters().catch(err => {
            console.error('Error fetching centers:', err);
            return [];
          }),
          serviceApi.getAllServices().catch(err => {
            console.error('Error fetching services:', err);
            return [];
          }),
          customerApi.getCustomerById(customerId).catch(err => {
            console.error('Error fetching customer data:', err);
            return null;
          })
        ]);

        // Set data (backend trả về trực tiếp array hoặc object với data field)
        const vehicles = Array.isArray(vehiclesRes) ? vehiclesRes : vehiclesRes?.data || [];
        const centers = Array.isArray(centersRes) ? centersRes : centersRes?.data || [];
        const services = Array.isArray(servicesRes) ? servicesRes : servicesRes?.data || [];
        
        setUserVehicles(vehicles);
        setServiceCenters(centers);
        setServices(services);
        setCustomerData(customerRes); // Set customer data

        console.log('✅ Data loaded:', {
          customerId,
          vehicles: vehicles,
          vehicleCount: vehicles.length,
          centers: centers,
          centerCount: centers.length,
          services: services,
          serviceCount: services.length,
          customer: customerRes
        });
      } catch (err) {
        console.error('❌ Error fetching initial data:', err);
        setError(err.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleUpdatePhone = async () => {
    try {
      // Validate phone number
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(editPhone)) {
        alert('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng!');
        return;
      }

      setLoading(true);
      const customerId = localStorage.getItem('customerId');
      
      const updateData = {
        ...customerData,
        phone: editPhone.trim()
      };
      
      console.log('📤 Updating customer phone:', editPhone);
      const response = await customerApi.updateCustomer(customerId, updateData);
      
      console.log('✅ Phone updated successfully:', response);
      setCustomerData(response);
      setIsEditingPhone(false);
      alert('✅ Cập nhật số điện thoại thành công!');
      
    } catch (err) {
      console.error('❌ Error updating phone:', err);
      alert('Không thể cập nhật số điện thoại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSelect = async (vehicle) => {
    const vehicleId = vehicle.vehicleId || vehicle.id;
    // Ưu tiên lấy km từ input, nếu không có thì lấy từ database
    const inputKm = vehicleKm[vehicleId];
    const km = inputKm !== undefined && inputKm !== '' ? parseFloat(inputKm) : (vehicle.currentMileage || 0);
    
    const maintenanceLevel = calculateMaintenanceLevel(km, vehicle.lastServiceDate);
    
    // Tính thông tin chi tiết
    const monthsSinceLastService = calculateMonthsSinceLastService(vehicle.lastServiceDate);
    const kmPerMaintenance = 1000;
    const monthsPerMaintenance = 3;
    
    // Kiểm tra xem có chạy quá km không (quá 200km so với kỳ bảo dưỡng)
    const kmOverdue = maintenanceLevel ? (km - (maintenanceLevel * kmPerMaintenance)) : 0;
    const isKmOverdue = kmOverdue > 200;
    
    // Kiểm tra xem có quá hạn theo thời gian không (quá 1 tháng so với kỳ bảo dưỡng)
    const monthsOverdue = maintenanceLevel ? (monthsSinceLastService - (maintenanceLevel * monthsPerMaintenance)) : 0;
    const isTimeOverdue = monthsOverdue > 1;
    
    // Xe quá hạn nếu quá km HOẶC quá thời gian
    const isOverdue = isKmOverdue || isTimeOverdue;
    
    // Xác định lý do bảo dưỡng
    let maintenanceReason = '';
    if (maintenanceLevel) {
      const levelByKm = Math.floor(km / kmPerMaintenance);
      const levelByTime = Math.floor(monthsSinceLastService / monthsPerMaintenance);
      
      if (levelByKm >= levelByTime) {
        maintenanceReason = `(Đã chạy ${km.toLocaleString()} km)`;
      } else {
        maintenanceReason = `(Đã ${monthsSinceLastService} tháng kể từ lần cuối)`;
      }
    }
    
    // Lưu thông tin xe tạm thời
    const vehicleWithMaintenance = {
      ...vehicle,
      inputKm: km,
      maintenanceLevel: maintenanceLevel,
      maintenanceReason: maintenanceReason,
      maintenanceText: maintenanceLevel ? `Bảo dưỡng lần ${maintenanceLevel}` : 'Chưa đến kỳ bảo dưỡng',
      monthsSinceLastService: monthsSinceLastService,
      isOverdue: isOverdue,
      kmOverdue: kmOverdue,
      monthsOverdue: monthsOverdue,
      isKmOverdue: isKmOverdue,
      isTimeOverdue: isTimeOverdue
    };
    
    setPendingVehicle(vehicleWithMaintenance);
    
    // === BƯỚC MỚI: GỌI API LẤY GÓI BẢO DƯỠNG PHÙ HỢP ===
    try {
      if (maintenanceLevel && maintenanceLevel > 0) {
        console.log('🔍 Đang kiểm tra gói bảo dưỡng phù hợp...');
        
        // TODO: Bỏ comment dòng dưới khi backend đã implement API
        // const response = await vehicleApi.getSuggestedPackage(vehicleId, km, vehicle.lastServiceDate);
        // if (response && response.packageId) {
        //   setSuggestedPackage(response);
        //   console.log('✅ Gói bảo dưỡng gợi ý từ backend:', response);
        // }
        
        // ===== MOCK DATA TẠM THỜI (XÓA KHI BACKEND SẴN SÀNG) =====
        const mockPackage = {
          packageId: maintenanceLevel, // VD: 1, 2, 3...
          packageName: `Gói bảo dưỡng ${maintenanceLevel * 1000}km`,
          description: `Bảo dưỡng định kỳ lần ${maintenanceLevel}`,
          price: 500000 + (maintenanceLevel - 1) * 200000,
          estimatedDuration: 60 + (maintenanceLevel - 1) * 30,
          reason: maintenanceReason
        };
        
        console.log('✅ Gói bảo dưỡng gợi ý (MOCK):', mockPackage);
        setSuggestedPackage(mockPackage);
        // ===== HẾT PHẦN MOCK =====
      } else {
        setSuggestedPackage(null);
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy gói bảo dưỡng:', error);
      setSuggestedPackage(null);
    }
    
    setShowMaintenanceModal(true);
  };

  const handleConfirmVehicle = () => {
    setSelectedVehicle(pendingVehicle);
    setShowMaintenanceModal(false);
    
    // Lưu packageId nếu có gói được gợi ý
    if (suggestedPackage) {
      // Lưu dưới dạng object để đồng nhất với flow chọn dịch vụ thủ công
      setSelectedService({
        serviceId: suggestedPackage.packageId,
        packageId: suggestedPackage.packageId,
        name: suggestedPackage.packageName,
        price: suggestedPackage.price
      });
      console.log('✅ Gói bảo dưỡng được chọn:', suggestedPackage);
    }
    
    handleNextStep();
    
    console.log('✅ Xe đã chọn:', {
      model: pendingVehicle.model,
      licensePlate: pendingVehicle.licensePlate,
      km: pendingVehicle.inputKm,
      monthsSinceLastService: pendingVehicle.monthsSinceLastService,
      maintenanceLevel: pendingVehicle.maintenanceLevel,
      reason: pendingVehicle.maintenanceReason,
      suggestedPackageId: suggestedPackage?.packageId || null
    });
  };

  const handleCancelVehicle = () => {
    setShowMaintenanceModal(false);
    setPendingVehicle(null);
    setSuggestedPackage(null); // Reset gói gợi ý
  };

  const handleCenterSelect = (center) => {
    setSelectedCenter(center);
  };

  // Fetch time slots khi thay đổi ngày hoặc trung tâm
  const fetchTimeSlots = async () => {
    if (!selectedCenter || !bookingDate) {
      console.log('⏭️ Skipping time slots fetch - missing center or date');
      setTimeSlots({ morning: [], afternoon: [] });
      return;
    }

    // Clear selected time slot khi thay đổi ngày hoặc trung tâm
    setSelectedTimeSlot(null);
    setLoadingSlots(true);
    setError(null);

    try {
      console.log('🔍 Fetching time slots for:', {
        centerId: selectedCenter.centerId,
        date: bookingDate
      });

      const response = await scheduleApi.getAvailableTimeSlots(
        selectedCenter.centerId,
        bookingDate
      );

      console.log('✅ Time slots response:', response);

      // Transform API response to match UI format
      const slots = response.data || response;
      
      // Check if slots is an array
      if (!Array.isArray(slots)) {
        console.error('❌ Invalid response format:', slots);
        throw new Error('Định dạng dữ liệu không hợp lệ');
      }

      // Separate morning (8:00-11:30) and afternoon (12:00-17:00) slots
      const morning = [];
      const afternoon = [];

      slots.forEach((slot) => {
        const hour = parseInt(slot.time.split(':')[0]);
        
        // Determine status based on available count
        let status = 'available';
        if (slot.available === 0) {
          status = 'full';
        } else if (slot.available <= 3) {
          status = 'few';
        }

        const formattedSlot = {
          id: slot.slotId || slot.id,
          time: slot.time,
          available: slot.available,
          total: slot.total || 12,
          status: status
        };

        if (hour < 12) {
          morning.push(formattedSlot);
        } else {
          afternoon.push(formattedSlot);
        }
      });

      setTimeSlots({ morning, afternoon });
      console.log('✅ Time slots loaded:', { 
        morning: morning.length, 
        afternoon: afternoon.length,
        total: slots.length 
      });

    } catch (err) {
      console.error('❌ Error fetching time slots:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách thời gian';
      setError(errorMsg);
      alert(`Lỗi: ${errorMsg}`);
      
      // Use empty arrays on error
      setTimeSlots({ morning: [], afternoon: [] });
    } finally {
      setLoadingSlots(false);
    }
  };

  // Fetch time slots when center or date changes
  useEffect(() => {
    if (currentStep === 3) {
      fetchTimeSlots();
    }
  }, [selectedCenter, bookingDate, currentStep]);

  // Set default date to today when entering Step 3
  useEffect(() => {
    if (currentStep === 3 && !bookingDate) {
      const today = new Date().toISOString().split('T')[0];
      setBookingDate(today);
    }
  }, [currentStep]);

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isMobileMenuOpen]);

  // Handle navigation state from MyVehiclesPage
  useEffect(() => {
    if (location.state) {
      const { selectedVehicle: vehicleFromState, skipToStep } = location.state;
      
      if (vehicleFromState) {
        setSelectedVehicle(vehicleFromState);
      }
      
      if (skipToStep) {
        setCurrentStep(skipToStep);
      }
      
      // Clear the state to prevent issues on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Xử lý edit customer info
  const handleEditMode = () => {
    setIsEditMode(true);
    setEditedUserInfo({
      name: customerData?.fullName || userInfo.name || '',
      phone: customerData?.phone || userInfo.phone || '',
      email: customerData?.email || userInfo.email || '',
      address: customerData?.address || '123 Đường ABC, Quận 1, TP.HCM'
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedUserInfo({});
  };

  const handleInputChange = (field, value) => {
    setEditedUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const customerId = localStorage.getItem('customerId');
      
      if (!customerId || customerId === 'null') {
        alert('Không tìm thấy thông tin khách hàng');
        return;
      }

      const updateData = {
        fullName: editedUserInfo.name?.trim(),
        phone: editedUserInfo.phone?.trim(),
        email: editedUserInfo.email?.trim(),
        address: editedUserInfo.address?.trim()
      };

      console.log('💾 Updating customer info:', updateData);
      const response = await customerApi.updateCustomer(customerId, updateData);
      console.log('✅ Customer updated:', response);

      // Update local state
      setCustomerData(response);
      setIsEditMode(false);
      alert('✅ Cập nhật thông tin thành công!');
      
    } catch (error) {
      console.error('❌ Error updating customer:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async () => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        alert('Vui lòng đăng nhập để đặt lịch!');
        navigate('/login');
        return;
      }

      // Get customerId from localStorage
      const customerId = localStorage.getItem('customerId');
      
      if (!customerId || customerId === 'null' || customerId === 'undefined') {
        alert('Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }

      // Get IDs với fallback
      const vehicleId = selectedVehicle?.vehicleId || selectedVehicle?.id;
      const centerId = selectedCenter?.centerId || selectedCenter?.id;

      console.log('🔍 DEBUG - Extracted IDs:', {
        vehicleId,
        centerId,
        selectedTimeSlot: selectedTimeSlot
      });

      // Validation - CHỈ CẦN vehicle, center và time slot (không cần slotId)
      if (!vehicleId || !centerId || !selectedTimeSlot) {
        const missingFields = [];
        if (!vehicleId) missingFields.push('Vehicle');
        if (!centerId) missingFields.push('Center');
        if (!selectedTimeSlot) missingFields.push('Time Slot');
        
        alert(`Vui lòng chọn đầy đủ thông tin!\nThiếu: ${missingFields.join(', ')}`);
        console.error('❌ Missing data:', { 
          vehicleId, 
          centerId, 
          selectedTimeSlot,
          selectedVehicle,
          selectedCenter
        });
        return;
      }

      // Lấy ngày hiện tại nếu bookingDate rỗng
      const dateToUse = bookingDate || new Date().toISOString().split('T')[0];
      
      // Format time to HH:mm:ss (ensure proper format)
      let timeFormatted = selectedTimeSlot.time;
      // Ensure time is in HH:mm format
      if (timeFormatted.length === 4) {
        // "9:00" -> "09:00"
        timeFormatted = '0' + timeFormatted;
      }
      
      // Create full ISO datetime string (without timezone)
      const scheduledDateTime = `${dateToUse}T${timeFormatted}:00`;
      
      // Chuẩn bị dữ liệu theo format BookScheduleRequest của Backend
      // KHÔNG GỬI slotId - Backend sẽ tự tạo TimeSlot
      const bookingData = {
        customerId: parseInt(customerId),
        vehicleId: parseInt(vehicleId),
        centerId: parseInt(centerId),
        scheduledDate: dateToUse, // Date: YYYY-MM-DD
        scheduledTime: timeFormatted, // Time: HH:mm
        serviceId: selectedService?.serviceId || null,
        notes: customerNote || ''
      };

      // Thêm thông tin km và lần bảo dưỡng vào notes nếu có
      if (selectedVehicle?.inputKm > 0 || selectedVehicle?.monthsSinceLastService > 0) {
        let maintenanceInfo = `\n\n📊 Thông tin bảo dưỡng:`;
        
        if (selectedVehicle.inputKm > 0) {
          maintenanceInfo += `\n- Số km đã chạy: ${selectedVehicle.inputKm.toLocaleString()} km`;
        }
        
        if (selectedVehicle.monthsSinceLastService > 0) {
          maintenanceInfo += `\n- Thời gian kể từ lần cuối: ${selectedVehicle.monthsSinceLastService} tháng`;
        }
        
        if (selectedVehicle.maintenanceLevel) {
          maintenanceInfo += `\n- ${selectedVehicle.maintenanceText}`;
          if (selectedVehicle.maintenanceReason) {
            maintenanceInfo += ` ${selectedVehicle.maintenanceReason}`;
          }
        } else {
          maintenanceInfo += `\n- Chưa đến kỳ bảo dưỡng`;
        }
        
        bookingData.notes = (customerNote || '') + maintenanceInfo;
      }

      console.log('═══════════════════════════════════════');
      console.log('📤 SENDING BOOKING DATA');
      console.log('═══════════════════════════════════════');
      console.log(JSON.stringify(bookingData, null, 2));
      console.log('═══════════════════════════════════════');
      console.log('📅 VALIDATION CHECK:', {
        'customerId (number)': typeof bookingData.customerId === 'number' ? `✅ ${bookingData.customerId}` : `❌ ${bookingData.customerId}`,
        'vehicleId (number)': typeof bookingData.vehicleId === 'number' ? `✅ ${bookingData.vehicleId}` : `❌ ${bookingData.vehicleId}`,
        'centerId (number)': typeof bookingData.centerId === 'number' ? `✅ ${bookingData.centerId}` : `❌ ${bookingData.centerId}`,
        'scheduledDate': bookingData.scheduledDate,
        'scheduledTime': bookingData.scheduledTime,
        'vehicleKm': selectedVehicle?.inputKm || 'N/A',
        'maintenanceLevel': selectedVehicle?.maintenanceText || 'N/A'
      });
      console.log('═══════════════════════════════════════');

      // Gọi API (Backend sẽ tự tạo TimeSlot)
      const response = await scheduleApi.bookSchedule(bookingData);
      
      console.log('✅ Booking response:', response);
      
      // Hiển thị thông báo thành công
      alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
      
      // Chuyển hướng đến trang lịch sử đặt lịch
      navigate('/booking-history');
      
    } catch (error) {
      console.error('❌ Booking error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Full error:', JSON.stringify(error.response, null, 2));
      
      // Hiển thị thông báo lỗi chi tiết
      let errorMessage = 'Đặt lịch thất bại. Vui lòng thử lại!';
      
      if (error.response?.data) {
        const data = error.response.data;
        // Backend có thể trả về nhiều format khác nhau
        errorMessage = data.message || data.error || data.errors?.[0]?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  };

  return (
    <div className="booking-page">
      <header className="hf-header">
        <div className="hf-header-inner">
          <div className="hf-logo"> 
            <img src={logoImage} alt="VOLTFIX Logo" className="logo-image" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          </div>

          <nav className="hf-nav">
            <a className="nav-item" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Trang chủ</a>
            <a className="nav-item active">Đặt lịch</a>
            <a className="nav-item" style={{ cursor: 'pointer' }}>Bảng giá</a>
            <a className="nav-item" onClick={() => navigate('/booking-history')} style={{ cursor: 'pointer' }}>Lịch sử</a>
          </nav>

          <div className="hf-actions">
            <div 
              className="icon-circle bell" 
              title="Thông báo"
              onClick={() => setIsNotificationModalOpen(true)}
            >
              🔔
              <span className="notification-badge">3</span>
            </div>
            <div className="user-menu-container">
              <div 
                className="icon-circle avatar" 
                title={isLoggedIn ? userInfo.name : "Tài khoản"}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              />
              {isUserMenuOpen && (
                <div className="user-dropdown">
                  {isLoggedIn ? (
                    <>
                    <div className="user-dropdown-header">
                      <div className="user-avatar-small">
                        <img src={userInfo.avatar || defaultAvatar} alt="User Avatar" />
                      </div>
                      <div className="user-info-dropdown">
                        <div className="user-name">{userInfo.name}</div>
                        <div className="user-id-small">{userInfo.phone}</div>
                      </div>
                    </div>
                      <div className="user-dropdown-divider"></div>
                      <div className="user-dropdown-menu">
                        <a className="user-dropdown-item" onClick={() => { setIsCustomerInfoModalOpen(true); setIsUserMenuOpen(false); }}>
                          <span className="dropdown-icon">👤</span>
                          Thông tin khách hàng
                        </a>
                        <a className="user-dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                          <span className="dropdown-icon">🔧</span>
                          Kiểm tra định kỳ
                        </a>
                        <a className="user-dropdown-item" onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/my-vehicles');
                        }}>
                          <span className="dropdown-icon">🚗</span>
                          Quản lý xe
                        </a>
                        <a className="user-dropdown-item" onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/payment-history');
                        }}>
                          <span className="dropdown-icon">💳</span>
                          Lịch sử thanh toán
                        </a>
                        <div className="user-dropdown-divider"></div>
                        <a className="user-dropdown-item logout" onClick={() => setIsUserMenuOpen(false)}>
                          <span className="dropdown-icon">🚪</span>
                          Đăng xuất
                        </a>
                      </div>
                    </>
                  ) : (
                    <div className="auth-dropdown-menu">
                      <a className="auth-dropdown-item" onClick={() => { navigate('/login'); setIsUserMenuOpen(false); }}>
                        Đăng nhập
                      </a>
                      <a className="auth-dropdown-item" onClick={() => { navigate('/register'); setIsUserMenuOpen(false); }}>
                        Đăng ký
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div 
              className="icon-circle menu mobile-menu-toggle" 
              title="Menu" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="mobile-menu-content">
              <a className="mobile-nav-item" onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}>
                🏠 Trang chủ
              </a>
              <a className="mobile-nav-item active">
                📅 Đặt lịch
              </a>
              <a className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                💰 Bảng giá
              </a>
              <a className="mobile-nav-item" onClick={() => { navigate('/booking-history'); setIsMobileMenuOpen(false); }}>
                📋 Lịch sử
              </a>
              <div className="mobile-menu-divider" />
              <a className="mobile-nav-item" onClick={() => {
                setIsMobileMenuOpen(false);
                setIsNotificationModalOpen(true);
              }}>
                🔔 Thông báo
              </a>
              <a className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                👤 Tài khoản
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="booking-main">
        <div className="booking-container">
          <h1 className="booking-title">Đặt lịch bảo dưỡng</h1>
          
          {/* Progress Bar */}
          <div className="progress-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />
              <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
              <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
              <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
              <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>4</div>
            </div>
            <div className="progress-label">Bước {currentStep}/4: {
              currentStep === 1 ? 'Chọn xe' :
              currentStep === 2 ? 'Chọn trung tâm dịch vụ' :
              currentStep === 3 ? 'Chọn thời gian' : 'Xác nhận'
            }</div>
          </div>

          {/* Step 1: Chọn xe */}
          {currentStep === 1 && (
            <div className="step-content">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p>Đang tải danh sách xe...</p>
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#f44336' }}>
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem' }}>
                    Thử lại
                  </button>
                </div>
              ) : userVehicles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <p>Bạn chưa có xe nào. Vui lòng thêm xe để đặt lịch.</p>
                  <button onClick={() => navigate('/my-vehicles')} style={{ marginTop: '1rem', padding: '0.5rem 1.5rem' }}>
                    Thêm xe
                  </button>
                </div>
              ) : (
                <div className="vehicle-grid">
                  {userVehicles.map((vehicle) => {
                    const vehicleId = vehicle.vehicleId || vehicle.id;
                    // Ưu tiên lấy km từ input, nếu không có thì lấy từ database
                    const inputKm = vehicleKm[vehicleId];
                    const displayKm = inputKm !== undefined && inputKm !== '' ? inputKm : vehicle.currentMileage || '';
                    const kmValue = parseFloat(displayKm) || 0;
                    
                    const maintenanceLevel = calculateMaintenanceLevel(kmValue, vehicle.lastServiceDate);
                    const monthsSinceLastService = calculateMonthsSinceLastService(vehicle.lastServiceDate);
                    const nextMaintenance = calculateNextMaintenance(kmValue, vehicle.lastServiceDate);
                    
                    return (
                      <div 
                        key={vehicleId}
                        className={`vehicle-card ${selectedVehicle?.vehicleId === vehicleId || selectedVehicle?.id === vehicleId ? 'selected' : ''}`}
                      >
                        <div className="vehicle-header">Xe máy điện</div>
                        <div className="vehicle-image">
                          <img 
                            src={vehicle.imageUrl || 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=EV+Vehicle'} 
                            alt={vehicle.model || 'Xe điện'}
                            onError={(e) => { 
                              e.target.src = 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=EV+Vehicle';
                            }}
                          />
                        </div>
                        <div className="vehicle-info">
                          <div className="vehicle-name" style={{ 
                            fontSize: '18px', 
                            fontWeight: '700',
                            marginBottom: '12px',
                            color: '#1a1a1a'
                          }}>
                            {vehicle.model || 'Xe điện'}
                          </div>
                          <div className="vehicle-plate" style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            borderRadius: '6px',
                            fontWeight: '700',
                            fontSize: '14px',
                            marginBottom: '10px',
                            letterSpacing: '1px',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                          }}>
                            {vehicle.licensePlate || 'N/A'}
                          </div>
                          <div className="vehicle-vin" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '6px',
                            marginBottom: '8px'
                          }}>
                            <span style={{ fontSize: '16px' }}>🔑</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '11px', color: '#999', marginBottom: '2px' }}>Số VIN</div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
                                {vehicle.vin || 'Chưa cập nhật'}
                              </div>
                            </div>
                          </div>
                          {vehicle.currentMileage > 0 && (
                            <div className="vehicle-mileage" style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 12px',
                              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              borderRadius: '8px',
                              boxShadow: '0 3px 10px rgba(245, 87, 108, 0.3)'
                            }}>
                              <span style={{ fontSize: '20px' }}>🛣️</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', color: '#fff', opacity: 0.9, marginBottom: '2px' }}>Đã chạy</div>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                                  {vehicle.currentMileage.toLocaleString()} km
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <button 
                          className="btn-select-vehicle"
                          onClick={() => handleVehicleSelect(vehicle)}
                        >
                          Chọn
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Chọn trung tâm dịch vụ */}
          {currentStep === 2 && (
            <div className="step-content">
              {/* Selected Vehicle Info */}
              {selectedVehicle && (
                <div className="selected-vehicle-info">
                  <h3>Xe đã chọn:</h3>
                  <div className="vehicle-summary">
                    <img 
                      src={selectedVehicle.imageUrl || 'https://via.placeholder.com/100x75/4CAF50/ffffff?text=EV'} 
                      alt={selectedVehicle.model} 
                      className="vehicle-thumb" 
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x75/4CAF50/ffffff?text=EV';
                      }}
                    />
                    <div className="vehicle-details">
                      <div className="vehicle-name">{selectedVehicle.model}</div>
                      <div className="vehicle-license">{selectedVehicle.licensePlate}</div>
                      <div className="vehicle-specs">
                        {selectedVehicle.vin ? `VIN: ${selectedVehicle.vin}` : 'Xe điện'}
                        {selectedVehicle.inputKm > 0 ? ` • ${selectedVehicle.inputKm.toLocaleString()} km` : ''}
                      </div>
                      
                      {/* Hiển thị thông tin bảo dưỡng khi đã chọn xe */}
                      <div style={{ marginTop: '10px' }}>
                        {selectedVehicle.maintenanceLevel && (
                          <div style={{
                            marginBottom: '8px',
                            padding: '8px 12px',
                            backgroundColor: selectedVehicle.maintenanceLevel === 1 ? '#e3f2fd' : selectedVehicle.maintenanceLevel === 2 ? '#fff3e0' : '#ffebee',
                            borderLeft: `3px solid ${selectedVehicle.maintenanceLevel === 1 ? '#2196F3' : selectedVehicle.maintenanceLevel === 2 ? '#FF9800' : '#F44336'}`,
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: selectedVehicle.maintenanceLevel === 1 ? '#1976d2' : selectedVehicle.maintenanceLevel === 2 ? '#f57c00' : '#d32f2f'
                          }}>
                            ⚙️ {selectedVehicle.maintenanceText}
                            {selectedVehicle.maintenanceReason && (
                              <div style={{ fontSize: '11px', fontWeight: 'normal', marginTop: '3px', opacity: 0.9 }}>
                                {selectedVehicle.maintenanceReason}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Hiển thị bảo dưỡng tiếp theo */}
                        {(() => {
                          const currentKm = selectedVehicle.inputKm || selectedVehicle.currentMileage || 0;
                          const nextMaintenance = calculateNextMaintenance(
                            currentKm,
                            selectedVehicle.lastServiceDate
                          );
                          
                          console.log('🔍 Debug Next Maintenance:', {
                            currentKm,
                            nextKmMilestone: nextMaintenance.nextKmMilestone,
                            kmRemaining: nextMaintenance.kmRemaining
                          });
                          
                          if (!nextMaintenance.kmRemaining && !nextMaintenance.monthsRemaining) return null;
                          
                          const isKmSooner = !nextMaintenance.monthsRemaining || 
                                            (nextMaintenance.kmRemaining && nextMaintenance.kmRemaining < nextMaintenance.monthsRemaining * 333);
                          
                          return (
                            <div style={{
                              padding: '8px 12px',
                              backgroundColor: '#f0f7ff',
                              border: '2px solid #2196F3',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              <div style={{ fontWeight: '600', color: '#1976d2', marginBottom: '4px' }}>
                                ⏰ Bảo dưỡng tiếp theo
                              </div>
                              {isKmSooner && nextMaintenance.kmRemaining > 0 ? (
                                <div style={{ color: '#666' }}>
                                  Còn {nextMaintenance.kmRemaining.toLocaleString()} km
                                  <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.8 }}>
                                    (Khi đạt {nextMaintenance.nextKmMilestone.toLocaleString()} km)
                                  </div>
                                </div>
                              ) : nextMaintenance.nextMaintenanceDate ? (
                                <div style={{ color: '#666' }}>
                                  {nextMaintenance.nextMaintenanceDate.toLocaleDateString('vi-VN')}
                                  <div style={{ fontSize: '10px', marginTop: '2px', opacity: 0.8 }}>
                                    (Còn {nextMaintenance.monthsRemaining} tháng)
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <button 
                      className="change-vehicle-btn"
                      onClick={() => setCurrentStep(1)}
                    >
                      Đổi xe
                    </button>
                  </div>
                </div>
              )}
              
              <div className="center-selection">
                <div className="map-container">
                  <img src={mapImage} alt="Map" className="map-image" />
                </div>
                <div className="center-list-container">
                  <div className="search-box">
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm trung tâm ..."
                      value={searchCenter}
                      onChange={(e) => setSearchCenter(e.target.value)}
                      className="search-input"
                    />
                    <button className="btn-search">Tìm</button>
                  </div>
                  <div className="center-list">
                    {loading ? (
                      <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>
                    ) : serviceCenters.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                        <p>Không tìm thấy trung tâm dịch vụ</p>
                        <small>Vui lòng liên hệ admin để được hỗ trợ</small>
                      </div>
                    ) : (
                      serviceCenters
                        .filter(center => {
                          if (!searchCenter) return true;
                          const searchLower = searchCenter.toLowerCase();
                          const name = (center.name || center.centerName || '').toLowerCase();
                          const address = (center.address || '').toLowerCase();
                          return name.includes(searchLower) || address.includes(searchLower);
                        })
                        .map((center, index) => {
                          const centerId = center.centerId || center.id || index;
                          return (
                            <div 
                              key={centerId}
                              className={`center-item ${(selectedCenter?.centerId === center.centerId || selectedCenter?.id === center.id) ? 'selected' : ''}`}
                            >
                              <div className="center-info">
                                <div className="center-name">
                                  {center.name || center.centerName || 'Trung tâm dịch vụ'}
                                </div>
                                <div className="center-distance">
                                  {center.address || center.location || 'Địa chỉ chưa cập nhật'}
                                </div>
                              </div>
                              <button 
                                className="btn-select-center"
                                onClick={() => handleCenterSelect(center)}
                              >
                                Chọn
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Chọn thời gian */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="time-selection">
                <div className="calendar-section">
                  <div className="selected-center-info">
                    <div className="center-name-display">
                      <span>{selectedCenter?.name || 'Voltfix Quận 1'}</span>
                      <span> - </span>
                      <span>{selectedCenter?.distance || '1.2 km'}</span>
                    </div>
                  </div>
                  <img src={lichImage} alt="Calendar" className="calendar-image" />
                </div>
                <div className="timeslots-section">
                  {/* Date Picker */}
                  <div className="date-picker-section" style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px'}}>
                    <label htmlFor="booking-date" style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333'}}>
                      Chọn ngày đặt lịch:
                    </label>
                    <input
                      id="booking-date"
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  
                  {loadingSlots ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                      <p>Đang tải danh sách thời gian...</p>
                    </div>
                  ) : !bookingDate ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                      <p>Vui lòng chọn ngày để xem các khung giờ có sẵn</p>
                    </div>
                  ) : timeSlots.morning.length === 0 && timeSlots.afternoon.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#ff6b6b' }}>
                      <p>Không có khung giờ nào khả dụng cho ngày này</p>
                    </div>
                  ) : (
                    <div className="timeslots-container">
                      {timeSlots.morning.length > 0 && (
                        <div className="timeslot-period">
                          <h4>Sáng</h4>
                          <div className="timeslot-grid">
                            {timeSlots.morning.map((slot) => (
                              <button
                                key={slot.id}
                                className={`timeslot-btn ${slot.status} ${selectedTimeSlot?.id === slot.id ? 'selected' : ''}`}
                                onClick={() => slot.status !== 'full' && setSelectedTimeSlot(slot)}
                                disabled={slot.status === 'full'}
                              >
                                {slot.time}<br />
                                <span className="slot-available">({slot.total - slot.available}/{slot.total})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {timeSlots.afternoon.length > 0 && (
                        <div className="timeslot-period">
                          <h4>Chiều</h4>
                          <div className="timeslot-grid">
                            {timeSlots.afternoon.map((slot) => (
                              <button
                                key={slot.id}
                                className={`timeslot-btn ${slot.status} ${selectedTimeSlot?.id === slot.id ? 'selected' : ''}`}
                                onClick={() => slot.status !== 'full' && setSelectedTimeSlot(slot)}
                                disabled={slot.status === 'full'}
                              >
                                {slot.time}<br />
                                <span className="slot-available">({slot.total - slot.available}/{slot.total})</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Xác nhận */}
          {currentStep === 4 && (
            <div className="step-content">
              <div className="booking-summary">
                <div className="summary-header">
                  <h3>Thông tin đặt lịch</h3>
                  <button 
                    className="edit-profile-btn"
                    onClick={() => navigate('/customer-profile')}
                    type="button"
                  >
                    ✏️ Chỉnh sửa thông tin
                  </button>
                </div>

                <div className="customer-info-section">
                  <h4>Thông tin khách hàng</h4>
                  <div className="summary-item">
                    <span>Mã khách hàng:</span>
                    <strong>KH{String(customerData?.customerId || '').padStart(3, '0')}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Họ và tên:</span>
                    <strong>{userInfo.name}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Số điện thoại:</span>
                    <strong>{userInfo.phone}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Email:</span>
                    <strong>{userInfo.email}</strong>
                  </div>
                  {customerData?.address && (
                    <div className="summary-item">
                      <span>Địa chỉ:</span>
                      <strong>{customerData.address}</strong>
                    </div>
                  )}
                </div>

                <div className="booking-info-section">
                  <h4>Chi tiết đặt lịch</h4>
                  <div className="summary-item">
                    <span>Xe:</span>
                    <strong>
                      <span>{selectedVehicle?.model || 'N/A'}</span>
                      <span> - </span>
                      <span>{selectedVehicle?.licensePlate || 'N/A'}</span>
                    </strong>
                  </div>
                  
                  {/* Hiển thị số km nếu có */}
                  {selectedVehicle?.inputKm > 0 && (
                    <div className="summary-item">
                      <span>Số km đã chạy:</span>
                      <strong>{selectedVehicle.inputKm.toLocaleString()} km</strong>
                    </div>
                  )}
                  
                  {/* Hiển thị thời gian nếu có */}
                  {selectedVehicle?.monthsSinceLastService > 0 && (
                    <div className="summary-item">
                      <span>Thời gian kể từ lần cuối:</span>
                      <strong>{selectedVehicle.monthsSinceLastService} tháng</strong>
                    </div>
                  )}
                  
                  {/* Hiển thị lần bảo dưỡng - QUAN TRỌNG */}
                  {selectedVehicle?.maintenanceLevel && (
                    <div className="summary-item" style={{ 
                      backgroundColor: '#f9f9f9', 
                      padding: '12px', 
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0'
                    }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#555' }}>
                        Lần bảo dưỡng:
                      </span>
                      <strong style={{
                        padding: '8px 16px',
                        backgroundColor: selectedVehicle.maintenanceLevel === 1 ? '#e3f2fd' : selectedVehicle.maintenanceLevel === 2 ? '#fff3e0' : '#ffebee',
                        borderRadius: '6px',
                        color: selectedVehicle.maintenanceLevel === 1 ? '#1976d2' : selectedVehicle.maintenanceLevel === 2 ? '#f57c00' : '#d32f2f',
                        fontWeight: '700',
                        fontSize: '16px',
                        display: 'inline-block',
                        marginLeft: '10px',
                        border: `2px solid ${selectedVehicle.maintenanceLevel === 1 ? '#2196F3' : selectedVehicle.maintenanceLevel === 2 ? '#FF9800' : '#F44336'}`
                      }}>
                        ⚙️ Lần {selectedVehicle.maintenanceLevel}
                      </strong>
                      {selectedVehicle.maintenanceReason && (
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: 'normal', 
                          marginTop: '8px',
                          color: '#666',
                          fontStyle: 'italic'
                        }}>
                          {selectedVehicle.maintenanceReason}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="summary-item">
                    <span>Trung tâm:</span>
                    <strong>{selectedCenter?.name || selectedCenter?.centerName || 'N/A'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Ngày:</span>
                    <strong>{new Date(bookingDate || new Date().toISOString().split('T')[0]).toLocaleDateString('vi-VN')}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Giờ:</span>
                    <strong>{selectedTimeSlot?.time}</strong>
                  </div>
                </div>
              </div>
              
              <div className="customer-note-section">
                <h3>Ghi chú</h3>
                <textarea
                  className="note-textarea"
                  placeholder="Nhập ghi chú của bạn (nếu có)..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  rows="5"
                ></textarea>
                <div className="note-hint">
                  Vui lòng ghi rõ các yêu cầu đặc biệt hoặc vấn đề cần xử lý
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="step-actions">
            {currentStep > 1 && (
              <button className="btn-back" onClick={handlePrevStep}>
                Trở lại
              </button>
            )}
            {currentStep < 4 ? (
              <button 
                className="btn-next" 
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && !selectedVehicle) ||
                  (currentStep === 2 && !selectedCenter) ||
                  (currentStep === 3 && !selectedTimeSlot)
                }
              >
                Tiếp tục
              </button>
            ) : (
              <button className="btn-submit" onClick={handleSubmit}>
                Xác nhận đặt lịch
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Customer Info Modal */}
      {isCustomerInfoModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCustomerInfoModalOpen(false)}>
          <div className="modal-content customer-info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin khách hàng</h2>
              <button className="modal-close-btn" onClick={() => setIsCustomerInfoModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="customer-info-grid">
                <div className="customer-avatar-section">
                  <div className="customer-avatar-large">
                    <img src={userInfo.avatar} alt="Customer Avatar" />
                  </div>
                  <div className="customer-status">
                    <span className="status-badge status-active">Hoạt động</span>
                  </div>
                </div>
                
                <div className="customer-details-section">
                  <div className="info-group">
                    <label>Họ và tên:</label>
                    {isEditMode ? (
                      <input 
                        type="text" 
                        value={editedUserInfo.name || ''} 
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span>{userInfo.name}</span>
                    )}
                  </div>
                  <div className="info-group">
                    <label>Mã khách hàng:</label>
                    <span>KH{String(userInfo.id || '006').padStart(3, '0')}</span>
                  </div>
                  <div className="info-group">
                    <label>Số điện thoại:</label>
                    {isEditMode ? (
                      <input 
                        type="tel" 
                        value={editedUserInfo.phone || ''} 
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span>{userInfo.phone}</span>
                    )}
                  </div>
                  <div className="info-group">
                    <label>Email:</label>
                    {isEditMode ? (
                      <input 
                        type="email" 
                        value={editedUserInfo.email || ''} 
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span>{userInfo.email}</span>
                    )}
                  </div>
                  <div className="info-group">
                    <label>Địa chỉ:</label>
                    {isEditMode ? (
                      <input 
                        type="text" 
                        value={editedUserInfo.address || ''} 
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="edit-input"
                      />
                    ) : (
                      <span>{customerData?.address || '123 Đường ABC, Quận 1, TP.HCM'}</span>
                    )}
                  </div>
                  <div className="info-group">
                    <label>Ngày đăng ký:</label>
                    <span>15/08/2024</span>
                  </div>
                  <div className="info-group">
                    <label>Loại tài khoản:</label>
                    <span>VIP</span>
                  </div>
                </div>
              </div>
              
              <div className="customer-stats">
                <div className="stat-item">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Lần bảo dưỡng</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{userVehicles.length}</div>
                  <div className="stat-label">Xe đang sở hữu</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">15.5M</div>
                  <div className="stat-label">Tổng chi tiêu</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">4.8★</div>
                  <div className="stat-label">Đánh giá TB</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {isEditMode ? (
                <>
                  <button className="btn-secondary" onClick={handleCancelEdit}>
                    ❌ Hủy
                  </button>
                  <button className="btn-primary" onClick={handleSaveEdit}>
                    💾 Lưu thay đổi
                  </button>
                </>
              ) : (
                <>
                  <button className="btn-secondary" onClick={() => {
                    setIsCustomerInfoModalOpen(false);
                    setIsEditMode(false);
                  }}>
                    Đóng
                  </button>
                  <button className="btn-primary" onClick={handleEditMode}>
                    ✏️ Chỉnh sửa thông tin
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {isNotificationModalOpen && (
        <div className="notification-modal-overlay" onClick={() => setIsNotificationModalOpen(false)}>
          <div className="notification-modal" onClick={e => e.stopPropagation()}>
            <div className="notification-header">
              <h2>Thông báo bảo dưỡng</h2>
              <button onClick={() => setIsNotificationModalOpen(false)} className="close-btn">×</button>
            </div>
            
            <div className="notification-content">
              <div className="notification-item">
                <div className="notification-icon">⚠️</div>
                <div className="notification-body">
                  <h4>Quá hạn bảo dưỡng</h4>
                  <p>Xe Yadea Ulike (30B-456.78) đã quá hạn bảo dưỡng từ ngày 10/10/2024. Vui lòng đặt lịch ngay!</p>
                  <span className="notification-time">2 ngày trước</span>
                </div>
              </div>
              
              <div className="notification-item">
                <div className="notification-icon">🔧</div>
                <div className="notification-body">
                  <h4>Sắp đến hạn bảo dưỡng</h4>
                  <p>Xe VinFast Feliz S (29A-123.45) sắp đến hạn bảo dưỡng vào ngày 15/11/2024</p>
                  <span className="notification-time">1 ngày trước</span>
                </div>
              </div>
              
              <div className="notification-item">
                <div className="notification-icon">📅</div>
                <div className="notification-body">
                  <h4>Xác nhận lịch hẹn</h4>
                  <p>Lịch hẹn bảo dưỡng xe Yadea Ulike (30B-456.78) đã được xác nhận vào 20/10/2024 lúc 9:00</p>
                  <span className="notification-time">5 ngày trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Progress Modal */}
      {showMaintenanceModal && pendingVehicle && (
        <div className="modal-overlay" onClick={handleCancelVehicle}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ 
            maxWidth: '700px', 
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: '0'
          }}>
            <div className="modal-header" style={{ 
              borderBottom: '2px solid #f0f0f0', 
              padding: '20px 30px 15px',
              flexShrink: 0
            }}>
              <h2 style={{ fontSize: '24px', color: '#333', margin: 0 }}>
                Thông tin bảo dưỡng xe
              </h2>
              <button className="modal-close-btn" onClick={handleCancelVehicle} style={{ fontSize: '28px', color: '#999' }}>
                ✕
              </button>
            </div>
            
            <div className="modal-body" style={{
              padding: '25px 30px',
              overflowY: 'auto',
              flex: 1
            }}>
              {/* Thông tin xe */}
              <div style={{ 
                marginBottom: '25px', 
                padding: '15px', 
                backgroundColor: '#f9f9f9', 
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <div style={{ fontSize: '40px' }}>🏍️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                    {pendingVehicle.model}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Biển số: {pendingVehicle.licensePlate} • {pendingVehicle.inputKm?.toLocaleString() || 0} km
                  </div>
                </div>
              </div>

              {/* Thanh tiến trình bảo dưỡng */}
              {pendingVehicle.maintenanceLevel && (
                <div style={{ marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '16px', color: '#555', marginBottom: '15px', textAlign: 'center' }}>
                    Lịch sử bảo dưỡng
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    position: 'relative'
                  }}>
                    {[1, 2, 3, 4, 5].map((level) => {
                      const isCompleted = level < pendingVehicle.maintenanceLevel;
                      const isCurrent = level === pendingVehicle.maintenanceLevel;
                      const isUpcoming = level > pendingVehicle.maintenanceLevel;
                      
                      // Xác định màu: Đỏ nếu quá hạn, Cam nếu đúng hạn
                      const currentColor = isCurrent && pendingVehicle.isOverdue ? '#F44336' : '#FF9800';
                      const currentShadow = isCurrent && pendingVehicle.isOverdue 
                        ? '0 4px 8px rgba(244, 67, 54, 0.3)' 
                        : '0 4px 8px rgba(255, 152, 0, 0.3)';
                      
                      return (
                        <div key={level} style={{ 
                          flex: 1, 
                          textAlign: 'center',
                          position: 'relative',
                          zIndex: 2
                        }}>
                          <div style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            backgroundColor: isCompleted ? '#4CAF50' : isCurrent ? currentColor : '#E0E0E0',
                            color: isCompleted || isCurrent ? '#fff' : '#999',
                            borderRadius: '25px',
                            fontWeight: '700',
                            fontSize: '15px',
                            boxShadow: isCurrent ? currentShadow : 'none',
                            position: 'relative',
                            zIndex: 3
                          }}>
                            Lần {level}
                          </div>
                          {level < 5 && (
                            <div style={{
                              position: 'absolute',
                              top: '50%',
                              left: '60%',
                              right: '-40%',
                              height: '4px',
                              backgroundColor: isCompleted ? '#4CAF50' : '#E0E0E0',
                              zIndex: 1,
                              transform: 'translateY(-50%)'
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: '20px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        width: '14px', 
                        height: '14px', 
                        backgroundColor: '#4CAF50', 
                        borderRadius: '50%',
                        display: 'inline-block'
                      }} />
                      <span>Đúng hạn</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        width: '14px', 
                        height: '14px', 
                        backgroundColor: '#FF9800', 
                        borderRadius: '50%',
                        display: 'inline-block'
                      }} />
                      <span>Cần bảo dưỡng</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        width: '14px', 
                        height: '14px', 
                        backgroundColor: '#F44336', 
                        borderRadius: '50%',
                        display: 'inline-block'
                      }} />
                      <span>Quá hạn</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        width: '14px', 
                        height: '14px', 
                        backgroundColor: '#E0E0E0', 
                        borderRadius: '50%',
                        display: 'inline-block'
                      }} />
                      <span>Lần kế tiếp</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin bảo dưỡng hiện tại */}
              {pendingVehicle.maintenanceLevel && (
                <div style={{
                  padding: '15px',
                  backgroundColor: pendingVehicle.isOverdue ? '#FFEBEE' : '#fff8e1',
                  border: pendingVehicle.isOverdue ? '2px solid #EF5350' : '2px solid #FFC107',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontWeight: '600', color: pendingVehicle.isOverdue ? '#D32F2F' : '#F57C00', marginBottom: '8px', fontSize: '15px' }}>
                    {pendingVehicle.isOverdue ? '⚠️' : '⚙️'} {pendingVehicle.maintenanceText}
                  </div>
                  {pendingVehicle.maintenanceReason && (
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {pendingVehicle.maintenanceReason}
                    </div>
                  )}
                  {pendingVehicle.isOverdue && (
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#D32F2F', 
                      fontWeight: '600',
                      marginTop: '8px',
                      marginBottom: '8px'
                    }}>
                      {pendingVehicle.isKmOverdue && pendingVehicle.isTimeOverdue ? (
                        <>Quá {pendingVehicle.kmOverdue.toLocaleString()} km và {pendingVehicle.monthsOverdue} tháng</>
                      ) : pendingVehicle.isKmOverdue ? (
                        <>Quá {pendingVehicle.kmOverdue.toLocaleString()} km so với kỳ bảo dưỡng</>
                      ) : (
                        <>Quá {pendingVehicle.monthsOverdue} tháng so với kỳ bảo dưỡng</>
                      )}
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '13px', 
                    color: pendingVehicle.isOverdue ? '#D32F2F' : '#F57C00', 
                    fontWeight: '600',
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: pendingVehicle.isOverdue ? '#FFCDD2' : '#FFF3E0',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {pendingVehicle.isOverdue ? '⚠️ Quá hạn bảo dưỡng' : '⏰ Đã đến kỳ bảo dưỡng'}
                  </div>
                </div>
              )}

              {/* Gói bảo dưỡng được gợi ý */}
              {suggestedPackage && (
                <div style={{
                  padding: '20px',
                  backgroundColor: '#E3F2FD',
                  border: '2px solid #2196F3',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '24px' }}>📦</span>
                    <div>
                      <div style={{ 
                        fontWeight: '700', 
                        color: '#1565C0', 
                        fontSize: '17px',
                        marginBottom: '4px'
                      }}>
                        {suggestedPackage.packageName}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        {suggestedPackage.description}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px',
                    marginTop: '15px'
                  }}>
                    <div style={{ 
                      padding: '10px',
                      backgroundColor: '#fff',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        💰 Chi phí dự kiến
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#1565C0' }}>
                        {suggestedPackage.price?.toLocaleString()} đ
                      </div>
                    </div>
                    <div style={{ 
                      padding: '10px',
                      backgroundColor: '#fff',
                      borderRadius: '6px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        ⏱️ Thời gian dự kiến
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#1565C0' }}>
                        ~{suggestedPackage.estimatedDuration} phút
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: '#FFF9C4',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#F57F17'
                  }}>
                    💡 <strong>Gợi ý:</strong> Gói này phù hợp với tình trạng xe của bạn {suggestedPackage.reason}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer" style={{ 
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'flex-end',
              padding: '20px 30px',
              borderTop: '2px solid #f0f0f0',
              flexShrink: 0,
              background: 'white'
            }}>
              <button 
                className="btn-secondary" 
                onClick={handleCancelVehicle}
                style={{
                  padding: '12px 30px',
                  fontSize: '15px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button 
                className="btn-primary"
                onClick={handleConfirmVehicle}
                style={{
                  padding: '12px 30px',
                  fontSize: '15px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
