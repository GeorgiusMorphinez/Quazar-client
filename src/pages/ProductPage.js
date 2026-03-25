import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Container, Row, Col, Image, Spinner, Card } from 'react-bootstrap';
import { fetchOneProduct, fetchPremiumAccounts } from '../http/productAPI';
import { createRating } from '../http/ratingAPI';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import EditProduct from '../components/modals/EditProduct';
import { $authHost } from '../http';

const ProductPage = observer(() => {
    const { user } = useContext(Context);
    const [product, setProduct] = useState({
        name: '',
        img: '',
        description: '',
        rating: 0,
        product_type_id: null,
        availableAccounts: 0
    });
    const [premiumAccounts, setPremiumAccounts] = useState([]);
    const [editAccountShow, setEditAccountShow] = useState(false);
    const [editAccountProductId, setEditAccountProductId] = useState(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editShow, setEditShow] = useState(false);
    const { id } = useParams();

    const loadProduct = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchOneProduct(id);
            setProduct(data);

            if (data.product_type_id === 1) {
                const accounts = await fetchPremiumAccounts(data.id);
                setPremiumAccounts(accounts);
            } else {
                setPremiumAccounts([]);
            }
        } catch (e) {
            console.error('Load error:', e);
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const loadPremiumAccounts = async () => {
        if (product.product_type_id === 1) {
            const accounts = await fetchPremiumAccounts(product.id);
            setPremiumAccounts(accounts);
        }
    };

    useEffect(() => {
        loadProduct();
    }, [loadProduct]);

    useEffect(() => {
        loadPremiumAccounts();
    }, [product.id]);

    const handleRatingSubmit = async () => {
        try {
            if (!user.isAuth) return alert('Авторизуйтесь!');
            await createRating(product.id, selectedRating);
            alert('Оценка сохранена!');
            await loadProduct();
        } catch (e) {
            alert(e.response?.data?.message || 'Ошибка оценки');
        }
    };

    const handleAddPremiumToBasket = async (accountId) => {
        if (!user.isAuth) {
            alert('Авторизуйтесь для покупки');
            return;
        }
        try {
            await $authHost.post('/api/basket/add', { product_id: accountId });
            alert('Товар добавлен в корзину');
            // Обновляем список аккаунтов, чтобы количество уменьшилось после покупки
            loadPremiumAccounts();
        } catch (e) {
            alert(e.response?.data?.message || 'Ошибка добавления в корзину');
        }
    };

    const imageUrl = product.img?.startsWith('http')
        ? product.img
        : `${process.env.REACT_APP_API_URL}/static/${product.img}`;

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5 text-center text-danger">
                <h3>{error}</h3>
            </Container>
        );
    }

    return (
        <Container className="mt-3">
            <Row>
                <Col md={4}>
                    <Image width={300} height={300} src={imageUrl} thumbnail alt={product.name} />
                </Col>
                <Col md={8}>
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>

                    <div className="rating-section mt-4">
                        <h4>Ваша оценка:</h4>
                        <div className="stars mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Button
                                    key={star}
                                    variant={selectedRating >= star ? "warning" : "outline-secondary"}
                                    onClick={() => setSelectedRating(star)}
                                    className="me-2"
                                    disabled={!user.isAuth}
                                >
                                    ★
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="success"
                            onClick={handleRatingSubmit}
                            disabled={!selectedRating || !user.isAuth}
                        >
                            {user.isAuth ? "Подтвердить оценку" : "Требуется авторизация"}
                        </Button>
                        <div className="mt-4">
                            <h5>Средний рейтинг: {product.rating}</h5>
                        </div>

                        {user.user.role === 'ADMIN' && (
                            <Button variant="outline-primary" className="mt-3" onClick={() => setEditShow(true)}>
                                🔧 Редактировать
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Блок премиум-аккаунтов */}
            {product.product_type_id === 1 && premiumAccounts.length > 0 && (
                <Row className="mt-5">
                    <Col>
                        <h3>Премиум-аккаунты</h3>
                        <p>Дополнительные аккаунты с особыми привилегиями</p>
                        <Row>
                            {premiumAccounts.map(acc => (
                                <Col md={4} key={acc.id} className="mb-3">
                                    <Card>
                                        <Card.Img
                                            variant="top"
                                            src={acc.img?.startsWith('http') ? acc.img : `${process.env.REACT_APP_API_URL}/static/${acc.img}`}
                                            style={{ height: '150px', objectFit: 'cover' }}
                                        />
                                        <Card.Body>
                                            <Card.Title>{acc.name}</Card.Title>
                                            <Card.Text>
                                                {acc.description}
                                                {acc.additional_info && (
                                                    <small className="d-block text-muted mt-2">{acc.additional_info}</small>
                                                )}
                                                <strong className="d-block mt-2">{acc.price} руб.</strong>
                                                <small>Доступно: {acc.availableCount}</small>
                                            </Card.Text>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <Button
                                                    variant="primary"
                                                    onClick={() => handleAddPremiumToBasket(acc.id)}
                                                    disabled={acc.availableCount === 0}
                                                >
                                                    {acc.availableCount > 0 ? 'Купить' : 'Нет в наличии'}
                                                </Button>
                                                {user.user.role === 'ADMIN' && (
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditAccountProductId(acc.id);
                                                            setEditAccountShow(true);
                                                        }}
                                                    >
                                                        ⚙️
                                                    </Button>
                                                )}
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            )}

            <EditProduct show={editShow} onHide={() => setEditShow(false)} productId={id} />
            <EditProduct
                show={editAccountShow}
                onHide={() => {
                    setEditAccountShow(false);
                    loadPremiumAccounts();
                }}
                productId={editAccountProductId}
            />
        </Container>
    );
});

export default ProductPage;