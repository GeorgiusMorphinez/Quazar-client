import { makeAutoObservable } from "mobx";

export default class BasketStore {
    constructor() {
        this._basket = {
            basketItems: [] // Инициализируем пустым массивом
        };
        makeAutoObservable(this);
    }

    setBasket(basket) {
        this._basket = basket || { basketItems: [] };
    }

    get basket() {
        return this._basket;
    }

}
