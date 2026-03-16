import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Card, Col, Image, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Context } from "../index";
import { observer } from "mobx-react-lite";
import { LOGIN_ROUTE } from "../utils/consts";
import { $authHost } from "../http";
import star from '../assets/star.png';

const GameItem = observer(({ game }) => {
    const navigate = useNavigate();
    const { user, basket } = useContext(Context);
    const [isInBasket, setIsInBasket] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkBasketStatus = useCallback(async () => {
        if (user.isAuth && basket.basket?.basketItems) {
            const exists = basket.basket.basketItems.some(
                item => item.game_id === game.id
            );
            setIsInBasket(exists);
        }
    }, [user.isAuth, basket.basket, game.id]);

    useEffect(() => {
        checkBasketStatus();
    }, [checkBasketStatus]);

    const handleAddToBasket = async () => {
        if (!user.isAuth) {
            navigate(LOGIN_ROUTE);
            return;
        }

        setLoading(true);
        try {
            await $authHost.post('/api/basket/add', {
                game_id: game.id
            });

            const { data } = await $authHost.get('/api/basket');
            basket.setBasket(data);
            setIsInBasket(true);
        } catch (e) {
            alert(e.response?.data?.message || 'Ошибка при добавлении в корзину');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Col md={3} className="mt-3">
            <Card style={{ width: 150, cursor: "pointer" }} border="light">
                <Image
                    width={150}
                    height={150}
                    src={`${process.env.REACT_APP_API_URL}/static/${game.img}`}
                    alt={game.name}
                    onClick={() => navigate(`/game/${game.id}`)}
                    style={{ objectFit: 'cover' }}
                />
                <div className="mt-1 d-flex justify-content-between align-items-center">
                    <Button
                        variant={isInBasket ? "success" : "outline-dark"}
                        size="sm"
                        onClick={handleAddToBasket}
                        disabled={loading || isInBasket}
                    >
                        {loading ? 'Добавление...' : isInBasket ? 'В корзине' : 'В корзину'}
                    </Button>
                    <div className="d-flex align-items-center ms-2">
                        {/* Отображаем рейтинг, если он есть */}
                        <div>{game.rating || 0}</div>
                        <Image width={18} height={18} src={star} className="ms-1" />
                    </div>
                </div>
                <div className="text-center mt-1">
                    <div><strong>{game.name}</strong></div>
                    <div className="text-danger fw-bold">{game.price} руб.</div>
                </div>
            </Card>
        </Col>
    );
});

export default GameItem;