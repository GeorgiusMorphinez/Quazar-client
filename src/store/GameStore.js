import { makeAutoObservable } from "mobx";

export default class GameStore {
    constructor() {
        this._genres = []
        this._publishers = []
        this._selectedGenre = null
        this._selectedPublisher = null
        this._platforms = [];
        this._selectedPlatform = null;
        this._onlineGames = [];
        makeAutoObservable(this)
    }

    setGenres(genres) {
        this._genres = genres;
    }

    setPublishers(publishers) {
        this._publishers = publishers;
    }

    setSelectedGenre(genre) {
        this._selectedGenre = genre;
    }

    setSelectedPublisher(publisher) {
        this._selectedPublisher = publisher;
    }

    setPlatforms(platforms) { this._platforms = platforms; }
    setSelectedPlatform(platform) { this._selectedPlatform = platform; }

    setOnlineGames(games) {
        this._onlineGames = games;
    }

    get genres() {
        return this._genres;
    }

    get publishers() {
        return this._publishers;
    }

    get selectedGenre() {
        return this._selectedGenre;
    }

    get selectedPublisher() {
        return this._selectedPublisher;
    }

    get platforms() { return this._platforms; }
    get selectedPlatform() { return this._selectedPlatform; }

    get onlineGames() {
        return this._onlineGames;
    }
}