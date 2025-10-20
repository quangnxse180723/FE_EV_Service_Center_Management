import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8080/api", 
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: false, // Tắt credentials để tránh lỗi CSRF
});

// Request interceptor - Tự động thêm token vào header
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý lỗi chung
axiosClient.interceptors.response.use(
    (response) => {
        // Chỉ trả về data, bỏ đi các metadata khác
        return response.data;
    },
    (error) => {
        // Nếu token hết hạn hoặc không hợp lệ (401), redirect về login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('role');
            
            // Chỉ redirect nếu không phải trang login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
