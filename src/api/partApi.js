import axiosClient from './axiosClient';

const partApi = {
  // Lấy tất cả parts
  getAllParts: () => {
    return axiosClient.get('/parts');
  },

  // Lấy part theo ID
  getPartById: (partId) => {
    return axiosClient.get(`/parts/${partId}`);
  },

  // Lấy danh sách packagechecklistitem (itemName và giá nhân công)
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
