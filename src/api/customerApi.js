import axiosClient from './axiosClient';

const customerApi = {
  // Lấy tất cả khách hàng
  getAllCustomers: async () => {
    return await axiosClient.get('/customers');
  },

  // Lấy thông tin chi tiết khách hàng
  getCustomerById: async (id) => {
    return await axiosClient.get(`/customers/${id}`);
  },

  // Cập nhật thông tin khách hàng
  updateCustomer: async (id, data) => {
    return await axiosClient.put(`/customers/${id}`, data);
  },

  // Xóa khách hàng
  deleteCustomer: async (id) => {
    return await axiosClient.delete(`/customers/${id}`);
  },

  // Tìm kiếm khách hàng theo tên
  searchCustomers: async (name) => {
    return await axiosClient.get('/customers/search', {
      params: { name }
    });
  },

  // Tìm khách hàng theo email hoặc số điện thoại
  findByEmailOrPhone: async (identifier) => {
    return await axiosClient.get('/customers/find', {
      params: { identifier }
    });
  }
};

export default customerApi;