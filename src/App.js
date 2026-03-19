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
                const token = localStorage.getItem('token');
                if (token) {
                    // Пытаемся проверить токен на сервере
                    const userData = await check();
                    user.setUser(userData);
                    user.setIsAuth(true);
                } else {
                    // Если токена нет, но в сторе остались данные — чистим
                    user.setUser({});
                    user.setIsAuth(false);
                }
            } catch (e) {
                console.error('Auth check error:', e);
                user.setUser({});
                user.setIsAuth(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
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