import { $authHost } from "./index";

export const fetchOrders = async () => {
    const { data } = await $authHost.get('/api/orders');
    return data;
};