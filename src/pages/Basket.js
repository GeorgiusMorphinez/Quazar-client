import React, { useContext, useEffect, useState } from 'react';
import { Container, Card, Row, Col, Image, Button, Alert } from 'react-bootstrap';
import { Context } from '../index';
import { observer } from "mobx-react-lite";
import { fetchBasket, removeFromBasket } from '../http/basketAPI';
import { useNavigate } from 'react-router-dom';
import { SHOP_ROUTE } from '../utils/consts';
import { $authHost } from "../http";
import { fetchOrders } from '../http/orderAPI';

const Basket = observer(() => {
    const { user, basket, order } = useContext(Context);
    const navigate = useNavigate();
    const [checkoutMode, setCheckoutMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cardParts, setCardParts] = useState(['', '', '', '']);

    useEffect(() => {
        if (user.isAuth) {
            fetchBasket().then(data => {
                basket.setBasket(data);
            });
        } else {
            navigate('/login');
        }
    }, [user.isAuth, basket, navigate]);

    const handleRemove = async (id) => {
        setLoading(true);
        try {
            await removeFromBasket(id);
            const updatedBasket = await fetchBasket();
            basket.setBasket(updatedBasket);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCardChange = (index, value) => {
        if (/^\d{0,4}$/.test(value)) {
            const newParts = [...cardParts];
            newParts[index] = value;
            setCardParts(newParts);
        }
    };

    const validateCard = () => {
        return cardParts.every(part => part.length === 4);
    };

    const getImageUrl = (img) => {
        if (!img) return '';
        return img.startsWith('http') ? img : `${process.env.REACT_APP_API_URL}/static/${img}`;
    };

    const handleCheckout = async () => {
        try {
            if (!validateCard()) {
                throw new Error('Номер карты должен состоять из 4 групп по 4 цифры');
            }

            const cardNumber = cardParts.join('');
            const items = basket.basket.basketItems?.map(item => ({
                id: item.id,
                product_id: item.product_id,
                quantity: 1, // всегда 1
                price: item.basketProduct.price
            })) || [];

            const { data } = await $authHost.post('/api/basket/checkout', {
                items,
                cardNumber
            });

            basket.setBasket({ basketItems: [] });
            await fetchOrders().then(data => order.setOrders(data));

            alert(data.message);
            navigate(SHOP_ROUTE);
        } catch (e) {
            alert(e.response?.data?.message || e.message);
            console.error(e);
        }
    };

    // Вычисляем общую сумму, преобразуя цены в числа
    const total = basket.basket?.basketItems?.reduce((sum, item) => {
        const price = parseFloat(item.basketProduct?.price) || 0;
        return sum + price;
    }, 0) || 0;

    return (
        <Container className="mt-4">
            <h2>Корзина</h2>

            {!checkoutMode ? (
                <>
                    {basket.basket?.basketItems?.length ? (
                        <>
                            {basket.basket.basketItems.map(item => (
                                <Card key={item.id} className="mb-3">
                                    <Card.Body>
                                        <Row className="align-items-center">
                                            <Col md={3}>
                                                <Image
                                                    src={getImageUrl(item.basketProduct?.img)}
                                                    alt={item.basketProduct?.name || 'No name'}
                                                    style={{ width: '100px' }}
                                                    thumbnail
                                                />
                                            </Col>
                                            <Col md={3}>
                                                <h5>{item.basketProduct?.name || 'No name'}</h5>
                                                <div className="text-danger fw-bold">
                                                    {parseFloat(item.basketProduct?.price || 0).toFixed(2)} руб.
                                                </div>
                                            </Col>
                                            <Col md={3}>
                                                <div>Количество: 1</div>
                                            </Col>
                                            <Col md={3} className="d-flex justify-content-end">
                                                <Button
                                                    variant="outline-danger"
                                                    onClick={() => handleRemove(item.id)}
                                                    disabled={loading}
                                                >
                                                    Удалить
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            ))}

                            <div className="d-flex justify-content-between align-items-center mt-4">
                                <h4>Итого: {total.toFixed(2)} руб.</h4>
                                <Button
                                    variant="success"
                                    size="lg"
                                    onClick={() => setCheckoutMode(true)}
                                >
                                    Оформить заказ
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Alert variant="info">Корзина пуста</Alert>
                    )}
                </>
            ) : (
                <Card>
                    <Card.Body>
                        <h4>Оформление заказа</h4>
                        <p className="fs-5">Общая сумма: <strong>{total.toFixed(2)} руб.</strong></p>

                        <Form className="mt-4">
                            <Form.Group className="mb-4">
                                <Form.Label>Номер карты</Form.Label>
                                <div className="d-flex">
                                    {[0, 1, 2, 3].map(index => (
                                        <Form.Control
                                            key={index}
                                            type="text"
                                            value={cardParts[index]}
                                            onChange={(e) => handleCardChange(index, e.target.value)}
                                            maxLength={4}
                                            placeholder="0000"
                                            className="text-center me-2"
                                            style={{ width: '80px' }}
                                        />
                                    ))}
                                </div>
                                <Form.Text className="text-muted">
                                    Введите 16-значный номер карты, разделенный на 4 группы по 4 цифры
                                </Form.Text>
                            </Form.Group>

                            <div className="d-flex justify-content-between">
                                <Button
                                    variant="secondary"
                                    onClick={() => setCheckoutMode(false)}
                                >
                                    Назад к корзине
                                </Button>
                                <Button
                                    variant="success"
                                    onClick={handleCheckout}
                                    disabled={!validateCard()}
                                >
                                    Подтвердить покупку
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
});

export default Basket;