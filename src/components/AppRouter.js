import React, {useContext} from 'react';
import {authRoutes, publicRoutes} from "../routes";
import {LOGIN_ROUTE, SHOP_ROUTE} from "../utils/consts";
import {Context} from "../index";
import {observer} from "mobx-react-lite";
import { Routes, Route, Navigate } from 'react-router-dom';

const AppRouter = observer(() => {
    const { user } = useContext(Context);

    return (
        <Routes>
            {user.isAuth && authRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
            ))}
            {publicRoutes.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
            ))}
            <Route path="*" element={
                user.isAuth
                    ? <Navigate to={SHOP_ROUTE} />
                    : <Navigate to={LOGIN_ROUTE} />
            } />
        </Routes>
    );
});

export default AppRouter;
