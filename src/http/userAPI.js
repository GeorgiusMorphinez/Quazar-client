import {$authHost, $host} from "./index";
import { jwtDecode } from 'jwt-decode';

export const registration = async (email, password) => {
    try {
        const response = await $host.post('api/user/registration', {
            email,
            password
        });

        // Сохраняем токен
        const token = response.data.token;
        localStorage.setItem('token', token);

        return jwtDecode(token);
    } catch (e) {
        throw new Error(e.response?.data?.message || 'Ошибка регистрации');
    }
};

export const login = async (email, password) => {
    try {
        const response = await $host.post('api/user/login', {
            email,
            password
        });

        // Сохраняем токен
        const token = response.data.token;
        localStorage.setItem('token', token);

        return jwtDecode(token);
    } catch (e) {
        throw new Error(e.response?.data?.message || 'Ошибка входа');
    }
};

export const check = async () => {
    try {
        const token = localStorage.getItem('token');
        console.log('check: token from storage =', token);
        if (!token) throw new Error('Токен отсутствует');

        const response = await $authHost.get('api/user/auth');

        console.log('check: response', response.data);
        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        return jwtDecode(newToken);
    } catch (e) {
        console.error('check error', e);
        localStorage.removeItem('token');
        throw e;
    }
};

export const refreshToken = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Токен отсутствует');

        const response = await $host.get('/api/user/auth', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const newToken = response.data.token;
        localStorage.setItem('token', newToken);
        return jwtDecode(newToken);
    } catch (e) {
        console.error('Token refresh failed:', e);
        // Удаляем токен при ошибке 401
        if (e.response?.status === 401) {
            localStorage.removeItem('token');
        }
        throw e;
    }
};