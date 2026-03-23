import { makeAutoObservable } from "mobx";

export default class GameStore {
    constructor() {
        this._tags = []
        this._publishers = []
        this._selectedTag = null
        this._selectedPublisher = null
        this._platforms = [];
        this._selectedPlatform = null;
        this._onlineGames = [];
        makeAutoObservable(this)
    }

    setTags(tags) {
        this._tags = tags;
    }

    setPublishers(publishers) {
        this._publishers = publishers;
    }

    setSelectedTag(tag) {
        this._selectedTag = tag;
    }

    setSelectedPublisher(publisher) {
        this._selectedPublisher = publisher;
    }

    setPlatforms(platforms) { this._platforms = platforms; }
    setSelectedPlatform(platform) { this._selectedPlatform = platform; }

    setOnlineGames(games) {
        this._onlineGames = games;
    }

    get tags() {
        return this._tags;
    }

    get publishers() {
        return this._publishers;
    }

    get selectedTag() {
        return this._selectedTag;
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