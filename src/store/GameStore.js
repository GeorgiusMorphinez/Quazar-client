import { makeAutoObservable } from "mobx";

export default class GameStore {
    constructor() {
        this._genres = []
        this._publishers = []
        this._games = []
        this._selectedGenre = null
        this._selectedPublisher = null
        this._page = 1
        this._totalCount = 0
        this._limit = 3
        this._platforms = [];
        this._selectedPlatform = null;
        this._onlineGames = [];
        this._selectedGame = null;
        makeAutoObservable(this)
    }

    setGenres(genres) {
        this._genres = genres;
    }

    setPublishers(publishers) {
        this._publishers = publishers;
    }

    setGames(games) {
        this._games = games.map(game => ({
            ...game,
            rating: game.rating || 0
        }));
    }

    setSelectedGenre(genre) {
        this.setPage(1)
        this._selectedGenre = genre;
    }

    setSelectedPublisher(publisher) {
        this.setPage(1)
        this._selectedPublisher = publisher;
    }

    setPage(page) {
        this._page = page;
    }

    setTotalCount(count) {
        this._totalCount = count;
    }

    setPlatforms(platforms) { this._platforms = platforms; }
    setSelectedPlatform(platform) { this._selectedPlatform = platform; }

    setOnlineGames(games) {
        this._onlineGames = games;
    }

    setSelectedGame(game) {
        this._selectedGame = game;
    }

    get genres() {
        return this._genres;
    }

    get publishers() {
        return this._publishers;
    }

    get games() {
        return this._games;
    }

    get selectedGenre() {
        return this._selectedGenre;
    }

    get selectedPublisher() {
        return this._selectedPublisher;
    }

    get page() {
        return this._page;
    }

    get totalCount() {
        return this._totalCount;
    }

    get limit() {
        return this._limit;
    }

    get platforms() { return this._platforms; }
    get selectedPlatform() { return this._selectedPlatform; }

    get onlineGames() {
        return this._onlineGames;
    }

    get selectedGame() {
        return this._selectedGame;
    }

}