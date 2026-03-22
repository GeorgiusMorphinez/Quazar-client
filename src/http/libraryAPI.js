import { $authHost } from "./index";

export const fetchLibrary = async () => {
    const { data } = await $authHost.get('/api/library');
    return data;
};