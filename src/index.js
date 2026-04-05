import React, { createContext } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import UserStore from "./store/UserStore";
import GameStore from "./store/GameStore";
import BasketStore from "./store/BasketStore";
import ProductStore from "./store/ProductStore";
import OrderStore from "./store/OrderStore"; // Новый

export const Context = createContext(null);

const root = createRoot(document.getElementById('root'));

root.render(
    <Context.Provider value={{
        user: new UserStore(),
        game: new GameStore(),
        basket: new BasketStore(),
        product: new ProductStore(),
        order: new OrderStore() // Новый
    }}>
        <App />
    </Context.Provider>
);