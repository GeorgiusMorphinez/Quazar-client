import {makeAutoObservable} from "mobx";

export default class UserStore {
    constructor() {
        this._isAuth = false;
        this._user = {};
        makeAutoObservable(this);

        // При создании стора пытаемся восстановить пользователя из localStorage
        this.loadUserFromStorage();
    }

    loadUserFromStorage() {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                this._user = JSON.parse(userData);
                this._isAuth = true;
            } catch (e) {
                this.clearStorage();
            }
        }
    }

    saveUserToStorage(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    clearStorage() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    setIsAuth(bool) {
        this._isAuth = bool;
        if (!bool) this.clearStorage();
    }

    setUser(user) {
        this._user = user;
        if (user && Object.keys(user).length > 0) {
            this.saveUserToStorage(user);
        } else {
            this.clearStorage();
        }
    }

    get isAuth() {
        return this._isAuth;
    }
    get user() {
        return this._user;
    }
}