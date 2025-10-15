import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const customerApi = {
  // Lấy tất cả khách hàng
  getAllCustomers: async () => {
    const response = await axios.get(`${API_BASE_URL}/customers`);
    return response.data;
  },

  // Lấy thông tin chi tiết khách hàng
  getCustomerById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/customers/${id}`);
    return response.data;
  },

  // Cập nhật thông tin khách hàng
  updateCustomer: async (id, data) => {
    const response = await axios.put(`${API_BASE_URL}/customers/${id}`, data);
    return response.data;
  },

  // Xóa khách hàng
  deleteCustomer: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/customers/${id}`);
    return response.data;
  },

  // Tìm kiếm khách hàng theo tên
  searchCustomers: async (name) => {
    const response = await axios.get(`${API_BASE_URL}/customers/search`, {
      params: { name }
    });
    return response.data;
  },

  // Tìm khách hàng theo email hoặc số điện thoại
  findByEmailOrPhone: async (identifier) => {
    const response = await axios.get(`${API_BASE_URL}/customers/find`, {
      params: { identifier }
    });
    return response.data;
  }
};

export default customerApi;