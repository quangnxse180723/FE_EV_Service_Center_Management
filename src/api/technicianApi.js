import axiosClient from './axiosClient';

const technicianApi = {
  // Lấy tất cả kỹ thuật viên
  getAllTechnicians: async () => {
    const response = await axiosClient.get('/admin/technicians'); // Lấy từ Admin controller
    return response;
  },

  // Lấy danh sách xe được phân công cho kỹ thuật viên
  getAssignedVehicles: async (technicianId) => {
    try {
      console.log('🔍 Fetching assigned vehicles for technician:', technicianId);
      const response = await axiosClient.get(`/technician/${technicianId}/assigned-vehicles`);
      console.log('✅ API Response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching assigned vehicles:', error);
      throw error;
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
      return response;
    } catch (error) {
      console.error('❌ Error fetching assigned vehicles by status:', error);
      throw error;
    }
  },

  // Lấy thống kê dashboard cho technician
  getDashboardStats: async (technicianId, date = null) => {
    try {
      console.log('📊 Fetching dashboard stats for technician:', technicianId);
      const params = {};
      if (date) {
        params.date = date; // Format: YYYY-MM-DD
      }
      const response = await axiosClient.get(`/technician/${technicianId}/dashboard/stats`, {
        params
      });
      console.log('✅ Dashboard Stats:', response);
      return response;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  }
};

export default technicianApi;