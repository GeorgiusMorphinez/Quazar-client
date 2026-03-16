import { $authHost, $host } from "./index";

export const createProduct = async (formData) => {
    const { data } = await $authHost.post('/api/product', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
}

export const fetchProducts = async (params = {}) => {
    try {
        const { data } = await $host.get('/api/product', {
            params: {
                productTypeId: params.productTypeId,
                genreId: params.genreId,
                publisherId: params.publisherId,
                platformId: params.platformId, // Добавлен
                page: params.page,
                limit: params.limit
            }
        });
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
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
};

export const deleteProduct = async (id) => {
    const { data } = await $authHost.delete(`/api/product/${id}`);
    return data;
};