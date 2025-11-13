import axiosClient from './axiosClient';

const centerApi = {
  // Lấy tất cả trung tâm
  getAllCenters: () => {
    return axiosClient.get('/centers');
  },

  // Lấy chi tiết trung tâm
  getCenterById: (centerId) => {
    return axiosClient.get(`/centers/${centerId}`);
  },

  // Tìm kiếm trung tâm
  searchCenters: (keyword) => {
    return axiosClient.get('/centers/search', {
      params: { keyword }
    });
  },

  // Lấy trung tâm gần nhất (theo tọa độ hoặc địa chỉ)
  getNearestCenters: (location) => {
    return axiosClient.get('/centers/nearest', {
      params: location
    });
  },

  // Lấy tất cả staff và technician của một trung tâm
  getMembersByCenter: (centerId) => {
    return axiosClient.get(`/center/${centerId}/members`);
  },
  // Tạo mới trung tâm
  createCenter: (payload) => {
    // payload: ServiceCenterRequest expected by backend
    return axiosClient.post('/centers', payload);
  },

  // Cập nhật trung tâm
  updateCenter: (centerId, payload) => {
    return axiosClient.put(`/centers/${centerId}`, payload);
  },

  // Xóa trung tâm
  deleteCenter: (centerId) => {
    return axiosClient.delete(`/centers/${centerId}`);
  }
};

export default centerApi;
