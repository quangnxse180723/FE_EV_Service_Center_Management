import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const vehicleApi = {
  // Lấy tất cả xe
  getAllVehicles: async () => {
    const response = await axios.get(`${API_BASE_URL}/vehicles`);
    return response.data;
  },

  // Lấy chi tiết xe theo ID
  getVehicleById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/vehicles/${id}`);
    return response.data;
  },

  // Tạo mới xe
  createVehicle: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/vehicles`, data);
    return response.data;
  },

  // Cập nhật xe
  updateVehicle: async (id, data) => {
    const response = await axios.put(`${API_BASE_URL}/vehicles/${id}`, data);
    return response.data;
  },

  // Xóa xe
  deleteVehicle: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/vehicles/${id}`);
    return response.data;
  },

  // Tìm kiếm xe
  searchVehicles: async (keyword) => {
    const response = await axios.get(`${API_BASE_URL}/vehicles/search?keyword=${keyword}`);
    return response.data;
  }
};

export default vehicleApi;