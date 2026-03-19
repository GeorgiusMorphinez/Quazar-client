import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from "./components/AppRouter";
import NavBar from "./components/NavBar";
import { observer } from "mobx-react-lite";
import { Context } from "./index";
import { check } from "./http/userAPI";
import { Spinner } from "react-bootstrap";

const App = observer(() => {
    const { user } = useContext(Context);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (user.token) {
                    const userData = await check();
                    user.setUser(userData);
                    user.setIsAuth(true);
                }
            } catch (e) {
                console.error('Auth check error:', e);
                user.setToken(null); // удаляем невалидный токен
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Не обязательно, но полезно для обновления токена
        const interval = setInterval(() => {
            if (user.token) {
                check().catch(() => user.setToken(null));
            }
        }, 600000); // 10 мин

        return () => clearInterval(interval);
    }, [user]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <BrowserRouter>
            <NavBar />
            <AppRouter />
        </BrowserRouter>
    );
});

export default App;