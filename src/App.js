import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from "./components/AppRouter";
import NavBar from "./components/NavBar";
import { observer } from "mobx-react-lite";
import { Context } from "./index";
import { check } from "./http/userAPI"; // Измените на check вместо refreshToken
import { Spinner } from "react-bootstrap";

const App = observer(() => {
    const { user } = useContext(Context);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const userData = await check();
                    user.setUser(userData);
                    user.setIsAuth(true);
                }
            } catch (e) {
                console.error('Auth check error:', e);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Интервал для обновления токена
        const interval = setInterval(() => {
            if (localStorage.getItem('token')) {
                check().catch(() => localStorage.removeItem('token'));
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