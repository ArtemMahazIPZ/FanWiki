import axios from 'axios';
import i18n from '../i18n';

export const api = axios.create({
    baseURL: '/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }


    const separator = config.url?.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}lang=${i18n.language}`;

    return config;
}, (error) => {
    return Promise.reject(error);
});