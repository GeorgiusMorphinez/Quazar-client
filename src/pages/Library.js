import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { $authHost } from '../http';

const Library = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const platform = params.get('platform');

        // Если параметр platform не равен 'desktop', перенаправляем на страницу загрузки
        if (platform !== 'desktop') {
            navigate('/download');
            return;
        }

        // Загружаем библиотеку
        const fetchLibrary = async () => {
            try {
                const { data } = await $authHost.get('/api/library');
                // Фильтруем: показываем только игры (тип 1) и приложения (тип 4)
                const gamesAndApps = data.filter(
                    item => item.product?.type?.id === 1 || item.product?.type?.id === 4
                );
                setItems(gamesAndApps);
            } catch (err) {
                console.error(err);
                setError('Не удалось загрузить библиотеку. Попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, [navigate, location]);

    const handleRun = (product) => {
        alert(`Демо-версия: запуск "${product.name}" пока не поддерживается.`);
    };

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (items.length === 0) {
        return (
            <Container className="mt-5 text-center">
                <h3>Ваша библиотека пуста</h3>
                <p>Приобретите игры или приложения, чтобы они появились здесь.</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h2>Моя библиотека</h2>
            <Row>
                {items.map((entry) => {
                    const product = entry.product;
                    // Формируем правильный URL изображения
                    const imageUrl = product.img?.startsWith('http')
                        ? product.img
                        : `${process.env.REACT_APP_API_URL}/static/${product.img}`;

                    return (
                        <Col key={entry.id} md={3} className="mb-4">
                            <Card className="h-100">
                                <Card.Img
                                    variant="top"
                                    src={imageUrl}
                                    style={{ height: '200px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                                    }}
                                />
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title>{product.name}</Card.Title>
                                    <Card.Text className="text-muted">
                                        {product.type?.name === 'Игра' ? '🎮 Игра' : '🖥️ Приложение'}
                                    </Card.Text>
                                    <Button
                                        variant="primary"
                                        onClick={() => handleRun(product)}
                                        className="mt-auto"
                                    >
                                        Запустить
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </Container>
    );
};

export default Library;