import { $authHost } from './index';

export const createRating = async (productId, value) => {
    try {
        const { data } = await $authHost.post('/api/rating', {
            productId: Number(productId),
            value
        });
        return data;
    } catch (e) {
        console.error('Error creating rating:', e);
        throw e.response?.data?.message || 'Ошибка создания оценки';
    }
};

export const getRatings = async (productId) => {
    try {
        const { data } = await $authHost.get(`/api/rating/${Number(productId)}`);
        return data;
    } catch (e) {
        console.error('Error fetching ratings:', e);
        throw e.response?.data?.message || 'Ошибка получения рейтингов';
    }
};

export const updateRating = async (productId, value) => {
    try {
        const { data } = await $authHost.put(`/api/rating/${Number(productId)}`, {
            value
        });
        return data;
    } catch (e) {
        console.error('Error updating rating:', e);
        throw e.response?.data?.message || 'Ошибка обновления оценки';
    }
};

export default { createRating, getRatings, updateRating };