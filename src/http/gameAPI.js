import {$authHost, $host} from "./index";

export const createGenre = async (genre) => {
    const response = await $authHost.post('api/genre', genre);
    return response.data;
}

export const fetchGenres = async () => {
    try {
        const { data } = await $host.get('/api/genre');
        return data;
    } catch (e) {
        console.error('Genres fetch error:', e);
        return [];
    }
};

export const createPublisher = async (publisher) => {
    const {data} = await $authHost.post('api/publisher', publisher);
    return data;
}

export const fetchPublishers = async () => {
    try {
        const { data } = await $host.get('/api/publisher');
        return data;
    } catch (e) {
        console.error('Publishers fetch error:', e);
        return [];
    }
};

export const createGame = async (game) => {
    const {data} = await $authHost.post('api/game', game);
    return data;
}

// Обновленная функция с поддержкой объекта параметров
export const fetchGames = async (params = {}) => {
    try {
        const { data } = await $host.get('/api/game', {
            params: {
                genreId: params.genreId,
                publisherId: params.publisherId,
                page: params.page,
                limit: params.limit
            }
        });
        return data;
    } catch (e) {
        console.error('Games fetch error:', e);
        return { count: 0, rows: [] };
    }
};

export const fetchOneGames = async (id) => {
    const {data} = await $host.get(`/api/game/${id}`);
    return data;
};

export const createRating = async (gameId, value) => {
    const { data } = await $authHost.post('/api/rating', { gameId, value });
    return data;
};