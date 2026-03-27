import { $authHost, $host } from "./index";

export const createProduct = async (formData) => {
    const { data } = await $authHost.post('/api/product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

export const fetchProducts = async (params = {}) => {
    try {
        const queryParams = { ...params };
        if (queryParams.excludeTypes && Array.isArray(queryParams.excludeTypes)) {
            queryParams.excludeTypes = queryParams.excludeTypes.join(',');
        }
        const { data } = await $host.get('/api/product', { params: queryParams });
        return data;
    } catch (e) {
        console.error('Products fetch error:', e);
        return { count: 0, rows: [] };
    }
};

export const fetchProductTypes = async () => {
    try {
        const { data } = await $host.get('/api/product/types');
        return data;
    } catch (e) {
        console.error('Product types fetch error:', e);
        return [];
    }
};

export const fetchOneProduct = async (id) => {
    const { data } = await $host.get(`/api/product/${id}`);
    return data;
};

export const updateProduct = async (id, formData) => {
    const { data } = await $authHost.put(`/api/product/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
};

export const deleteProduct = async (id) => {
    const { data } = await $authHost.delete(`/api/product/${id}`);
    return data;
};

export const fetchTags = async () => {
    const { data } = await $host.get('/api/tag');
    return data;
};

export const fetchPublishers = async () => {
    const { data } = await $host.get('/api/publisher');
    return data;
};

// Получение игр и приложений для выбора при создании аккаунта
export const fetchGamesAndApps = async () => {
    // Передаём productTypeId=1,4 в виде строки, разделённой запятой
    const { data } = await $host.get('/api/product', {
        params: {
            productTypeId: '1,4',
            limit: 100
        }
    });
    return data.rows;
};

// Для совместимости со старым кодом (используется в Shop.js)
export const fetchOnlineGames = async () => {
    const { data } = await $host.get('/api/product', {
        params: { productTypeId: 1, isOnline: true, limit: 100 }
    });
    return data.rows;
};

export const fetchPremiumAccounts = async (gameId) => {
    const { data } = await $host.get(`/api/product/game/${gameId}/premium-accounts`);
    return data;
};