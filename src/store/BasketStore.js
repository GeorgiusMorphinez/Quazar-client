import { makeAutoObservable } from "mobx";

export default class BasketStore {
    constructor() {
        this._basket = {
            basketGames: [] // Инициализируем пустым массивом
        };
        makeAutoObservable(this);
    }

    setBasket(basket) {
        this._basket = basket || { basketGames: [] };
    }

    get basket() {
        return this._basket;
    }

    get total() {
        return this._basket.basketGames?.reduce((sum, item) =>
            sum + (item.game?.price || 0) * item.quantity, 0) || 0;
    }
}
