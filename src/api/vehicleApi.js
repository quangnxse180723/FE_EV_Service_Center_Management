import axiosClient from './axiosClient';

const vehicleApi = {
  // Lấy tất cả xe
  getAllVehicles: () => {
    return axiosClient.get('/vehicles');
  },

  // Lấy chi tiết xe
  getVehicleById: (vehicleId) => {
    return axiosClient.get(`/vehicles/${vehicleId}`);
  },

  // Tạo xe mới
  createVehicle: (vehicleData) => {
    return axiosClient.post('/vehicles', vehicleData);
  },

  // Cập nhật thông tin xe
  updateVehicle: (vehicleId, vehicleData) => {
    return axiosClient.put(`/vehicles/${vehicleId}`, vehicleData);
  },

  // Xóa xe
  deleteVehicle: (vehicleId) => {
    return axiosClient.delete(`/vehicles/${vehicleId}`);
  },

  // Tìm kiếm xe theo biển số hoặc tên xe
  searchVehicles: (keyword) => {
    return axiosClient.get('/vehicles/search', {
      params: { keyword }
    });
  },

  // Tìm kiếm xe theo tên khách hàng
  searchVehiclesByCustomerName: (name) => {
    return axiosClient.get('/vehicles/search/customer', {
      params: { name }
    });
  },
  
  // Legacy: Lấy danh sách xe của khách hàng (giữ lại để tương thích)
  getCustomerVehicles: (customerId) => {
    return axiosClient.get(`/vehicles/customer/${customerId}`);
  },
};

export default vehicleApi;
