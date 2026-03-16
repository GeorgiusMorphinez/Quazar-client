import { $authHost, $host } from "./index";

export const createPlatform = async (platform) => {
    const { data } = await $authHost.post('api/platform', platform);
    return data;
}

export const fetchPlatforms = async () => {
    const { data } = await $host.get('api/platform');
    return data;
}