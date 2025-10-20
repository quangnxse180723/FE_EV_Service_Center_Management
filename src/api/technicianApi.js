import axiosClient from './axiosClient';

// Dữ liệu mẫu để test (xóa khi backend đã sẵn sàng)
const MOCK_DATA = [
  {
    id: 1,
    customerName: 'Nguyễn Văn A',
    vehicleName: 'VinFast Feliz S',
    licensePlate: '29A-123.45',
    appointmentTime: '8:30',
    status: 'pending'
  },
  {
    id: 2,
    customerName: 'Nguyễn Văn B',
    vehicleName: '1. Yadea Ulike',
    licensePlate: '30B-456.78',
    appointmentTime: '8:30',
    status: 'in_progress'
  }
];

const technicianApi = {
  // Lấy tất cả kỹ thuật viên
  getAllTechnicians: async () => {
    const response = await axiosClient.get('/technician');
    return response;
  },

  // Lấy danh sách xe được phân công cho kỹ thuật viên
  getAssignedVehicles: async (technicianId) => {
    try {
      console.log('🔍 Fetching assigned vehicles for technician:', technicianId);
      const response = await axiosClient.get(`/technician/${technicianId}/assigned-vehicles`);
      console.log('✅ API Response:', response);
      
      // Nếu API trả về empty hoặc lỗi, dùng mock data để test
      if (!response || (Array.isArray(response) && response.length === 0)) {
        console.log('⚠️ No data from API, using mock data for testing');
        return MOCK_DATA;
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error fetching assigned vehicles:', error);
      console.log('⚠️ API Error, using mock data for testing');
      // Trả về mock data khi API lỗi để test UI
      return MOCK_DATA;
    }
  },

  // Lấy danh sách xe được phân công theo trạng thái
  getAssignedVehiclesByStatus: async (technicianId, status) => {
    try {
      console.log('🔍 Fetching vehicles with status:', status);
      const response = await axiosClient.get(`/technician/${technicianId}/assigned-vehicles/filter`, {
        params: { status }
      });
      console.log('✅ API Response:', response);
      
      // Nếu API trả về empty hoặc lỗi, filter mock data
      if (!response || (Array.isArray(response) && response.length === 0)) {
        console.log('⚠️ No data from API, filtering mock data');
        return MOCK_DATA.filter(v => v.status === status);
      }
      
      return response;
    } catch (error) {
      console.error('❌ Error fetching assigned vehicles by status:', error);
      console.log('⚠️ API Error, filtering mock data');
      // Filter mock data theo status
      return MOCK_DATA.filter(v => v.status === status);
    }
  }
};

export default technicianApi;