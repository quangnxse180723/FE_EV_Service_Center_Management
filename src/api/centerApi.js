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
};

export default centerApi;
