import { $authHost } from "./index";

export const addToBasket = async (gameId) => {
    try {
        const { data } = await $authHost.post('/api/basket/add', { gameId });
        return data;
    } catch (e) {
        console.error('Add to basket error:', e);
        throw e;
    }
};

export const fetchBasket = async () => {
    try {
        const { data } = await $authHost.get('/api/basket');
        return data || { basketGames: [] }; // Гарантируем возврат объекта
    } catch (e) {
        return { basketGames: [] };
    }
};

export const checkout = async (formData) => {
    const { data } = await $authHost.post('/api/basket/checkout', formData);
    return data;
};

export const removeFromBasket = async (id) => {
    const { data } = await $authHost.delete(`/api/basket/${id}`);
    return data;
};