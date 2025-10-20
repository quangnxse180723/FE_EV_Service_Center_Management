import axiosClient from './axiosClient';

const vehicleApi = {
  // Lấy danh sách xe của khách hàng
  getCustomerVehicles: (customerId) => {
    return axiosClient.get(`/api/vehicles/customer/${customerId}`);
  },

  // Thêm xe mới cho khách hàng
  addVehicle: (vehicleData) => {
    return axiosClient.post('/api/vehicles', vehicleData);
  },

  // Cập nhật thông tin xe
  updateVehicle: (vehicleId, vehicleData) => {
    return axiosClient.put(`/api/vehicles/${vehicleId}`, vehicleData);
  },

  // Xóa xe
  deleteVehicle: (vehicleId) => {
    return axiosClient.delete(`/api/vehicles/${vehicleId}`);
  },

  // Lấy chi tiết xe
  getVehicleById: (vehicleId) => {
    return axiosClient.get(`/api/vehicles/${vehicleId}`);
  }
};

export default vehicleApi;
