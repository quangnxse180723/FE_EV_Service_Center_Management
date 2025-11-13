import axiosClient from './axiosClient';

const partApi = {
  // Lấy tất cả parts (PUBLIC - không cần đăng nhập)
  getAllParts: () => {
    return axiosClient.get('/parts');
  },

  // Lấy part theo ID
  getPartById: (partId) => {
    return axiosClient.get(`/admin/parts/${partId}`);
  },

  // Lấy danh sách packagechecklistitem (itemName và giá nhân công) (PUBLIC - không cần đăng nhập)
  getAllPackageChecklistItems: () => {
    return axiosClient.get('/package-checklist-items');
  },

  // Lấy packagechecklistitem theo ID
  getPackageChecklistItemById: (itemId) => {
    return axiosClient.get(`/package-checklist-items/${itemId}`);
  },

  // Lấy bảng giá đầy đủ (kết hợp packagechecklistitem và part)
  getPriceList: () => {
    return axiosClient.get('/price-list');
  },
};

export default partApi;
