import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Card, Col, Image, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Context } from "../index";
import { observer } from "mobx-react-lite";
import { LOGIN_ROUTE } from "../utils/consts";
import { $authHost } from "../http";
import star from '../assets/star.png';

const ProductItem = observer(({ product }) => {
    const navigate = useNavigate();
    const { user, basket } = useContext(Context);
    const [isInBasket, setIsInBasket] = useState(false);
    const [loading, setLoading] = useState(false);

    const getTypeBadge = (typeId) => {
        switch (typeId) {
            case 1: return { text: '🎮 Ключ', variant: 'primary' };
            case 2: return { text: '🔄 Подписка', variant: 'success' };
            case 3: return { text: '👤 Аккаунт', variant: 'warning' };
            default: return { text: '📦 Товар', variant: 'secondary' };
        }
    };

    const checkBasketStatus = useCallback(async () => {
        if (user.isAuth && basket.basket?.basketItems) {
            const exists = basket.basket.basketItems.some(
                item => item.product_id === product.id
            );
            setIsInBasket(exists);
        }
    }, [user.isAuth, basket.basket, product.id]);

    useEffect(() => {
        checkBasketStatus();
    }, [checkBasketStatus]);

    const handleAddToBasket = async () => {
        if (!user.isAuth) {
            navigate(LOGIN_ROUTE);
            return;
        }

        // Проверяем доступность аккаунтов
        if (product.product_type_id === 3 && product.availableAccounts === 0) {
            alert('Аккаунты временно отсутствуют в наличии');
            return;
        }

        setLoading(true);
        try {
            await $authHost.post('/api/basket/add', {
                product_id: product.id
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

    const typeBadge = getTypeBadge(product.product_type_id);

    return (
        <Col md={4} className="mt-3">
            <Card style={{ cursor: "pointer" }} border="light" className="h-100">
                <div style={{ position: 'relative' }}>
                    <Image
                        width="100%"
                        height={200}
                        src={product.img?.startsWith('http')
                            ? product.img
                            : `${process.env.REACT_APP_API_URL}/static/${product.img}`}
                        alt={product.name}
                        onClick={() => navigate(`/product/${product.id}`)}
                        style={{ objectFit: 'cover' }}
                    />
                    <Badge
                        bg={typeBadge.variant}
                        style={{ position: 'absolute', top: '10px', left: '10px' }}
                    >
                        {typeBadge.text}
                    </Badge>
                </div>

                <Card.Body className="d-flex flex-column">
                    <Card.Title
                        onClick={() => navigate(`/product/${product.id}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        {product.name}
                    </Card.Title>

                    <Card.Text className="flex-grow-1">
                        {product.description && product.description.length > 100
                            ? `${product.description.substring(0, 100)}...`
                            : product.description
                        }
                    </Card.Text>

                    {product.product_type_id === 3 && (
                        <small className="text-muted mb-2">
                            В наличии: {product.availableAccounts} аккаунтов
                        </small>
                    )}

                    <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <Button
                                variant={isInBasket ? "success" : "outline-dark"}
                                size="sm"
                                onClick={handleAddToBasket}
                                disabled={loading || isInBasket || (product.product_type_id === 3 && product.availableAccounts === 0)}
                                className="flex-grow-1 me-2"
                            >
                                {loading ? 'Добавление...' :
                                    isInBasket ? 'В корзине' :
                                        (product.product_type_id === 3 && product.availableAccounts === 0) ? 'Нет в наличии' : 'В корзину'}
                            </Button>

                            <div className="d-flex align-items-center">
                                <div>{product.rating || 0}</div>
                                <Image width={18} height={18} src={star} className="ms-1" />
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-danger fw-bold fs-5">{product.price} руб.</div>
                        </div>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );
});
//src
export default ProductItem;