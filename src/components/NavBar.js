import React, { useContext } from 'react';
import { Context } from "../index";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {ADMIN_ROUTE, LOGIN_ROUTE, SHOP_ROUTE, ORDERS_ROUTE, LIBRARY_ROUTE} from "../utils/consts";
import { observer } from "mobx-react-lite";
import { BASKET_ROUTE } from "../utils/consts";
import { $authHost } from "../http";

const NavBar = observer(() => {
    const { user, basket } = useContext(Context);
    const navigate = useNavigate();

    const logOut = async () => {
        try {
            await $authHost.post('/api/user/logout');
        } catch (e) {
            console.error('Logout API error:', e);
        } finally {
            localStorage.removeItem('token');
            user.setUser({});
            user.setIsAuth(false);
            basket.setBasket({ basketItems: [] });
            navigate(SHOP_ROUTE);
        }
    };

    return (
        <Navbar bg="dark" variant="dark">
            <Container>
                <Link to={SHOP_ROUTE} style={{ color: 'white', textDecoration: 'none' }}>Quazar</Link>
                {user.isAuth ?
                    <Nav className="ml-auto" style={{ color: 'white' }}>
                        {user.user.role === 'ADMIN' &&
                            <Button
                                variant={"outline-light"}
                                onClick={() => navigate(ADMIN_ROUTE)}
                            >
                                Админ панель
                            </Button>
                        }
                        <Button
                            variant={"outline-light"}
                            onClick={logOut}
                            className="ml-2"
                        >
                            Выйти
                        </Button>
                        <Button
                            variant="outline-light"
                            onClick={() => navigate(BASKET_ROUTE)}
                            className="ml-2"
                        >
                            🛒 Корзина
                        </Button>
                        <Button
                            variant="outline-light"
                            onClick={() => navigate(ORDERS_ROUTE)}
                            className="ml-2"
                        >
                            📜 Заказы
                        </Button>
                        <Button
                            variant="outline-light"
                            onClick={() => navigate(LIBRARY_ROUTE)}
                            className="ml-2"
                        >
                            📚 Библиотека
                        </Button>
                    </Nav>
                    :
                    <Nav className="ml-auto" style={{ color: 'white' }}>
                        <Button
                            variant={"outline-light"}
                            onClick={() => navigate(LOGIN_ROUTE)}
                        >
                            Авторизация
                        </Button>
                    </Nav>
                }
            </Container>
        </Navbar>
    );
});

export default NavBar;