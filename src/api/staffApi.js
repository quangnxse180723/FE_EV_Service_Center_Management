import axiosClient from './axiosClient';

const staffApi = {
  getInvoiceDetail: (scheduleId) => {
    const url = `/staff/payments/${scheduleId}`;
    return axiosClient.get(url);
  },
};

export default staffApi;
