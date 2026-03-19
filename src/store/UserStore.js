import { makeAutoObservable } from "mobx";
import { jwtDecode } from 'jwt-decode';

export default class UserStore {
    constructor() {
        this._isAuth = false;
        this._user = {};
        this._token = localStorage.getItem('token') || null;
        if (this._token) {
            try {
                const decoded = jwtDecode(this._token);
                this._user = decoded;
                this._isAuth = true;
            } catch (e) {
                localStorage.removeItem('token');
            }
        }
        makeAutoObservable(this);
    }

    setIsAuth(bool) {
        this._isAuth = bool;
    }

    setUser(user) {
        this._user = user;
    }

    setToken(token) {
        this._token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    get isAuth() {
        return this._isAuth;
    }

    get user() {
        return this._user;
    }

    get token() {
        return this._token;
    }
}