import { makeAutoObservable } from "mobx";

export default class GameStore {
    constructor() {
        this._tags = []
        this._publishers = []
        this._selectedTag = null
        this._selectedPublisher = null
        this._onlineGames = [];
        this._selectedGame = null;
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

    setOnlineGames(games) {
        this._onlineGames = games;
    }

    setSelectedGame(game) {
        this._selectedGame = game;
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

    get onlineGames() {
        return this._onlineGames;
    }

    get selectedGame() {
        return this._selectedGame;
    }
}