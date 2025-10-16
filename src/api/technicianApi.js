import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const technicianApi = {
  // Lấy tất cả kỹ thuật viên
  getAllTechnicians: async () => {
    const response = await axios.get(`${API_BASE_URL}/technicians`);
    return response.data;
  }
};

export default technicianApi;