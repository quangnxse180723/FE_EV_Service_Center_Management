import axiosClient from './axiosClient';

const serviceApi = {
  // Lấy tất cả dịch vụ
  getAllServices: () => {
    return axiosClient.get('/services');
  },

  // Lấy chi tiết dịch vụ
  getServiceById: (serviceId) => {
    return axiosClient.get(`/services/${serviceId}`);
  },

  // Tìm kiếm dịch vụ
  searchServices: (keyword) => {
    return axiosClient.get('/services/search', {
      params: { keyword }
    });
  },
};

export default serviceApi;
