import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const $host = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 10000
});

const $authHost = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

$authHost.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

$authHost.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Если ошибка 401 и это не запрос на обновление токена
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Пытаемся обновить токен
                const response = await $host.get('/api/user/auth');
                const newToken = response.data.token;
                localStorage.setItem('token', newToken);

                // Повторяем оригинальный запрос с новым токеном
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return $authHost(originalRequest);
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                localStorage.removeItem('token');
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { $host, $authHost };