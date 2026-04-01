import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Modal, Image, Spinner } from 'react-bootstrap';
import { $authHost } from '../http';

const Library = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const isLauncher = /QuazarLauncher/.test(navigator.userAgent);
        if (!isLauncher) {
            navigate('/download');
            return;
        }

        const fetchLibrary = async () => {
            try {
                const { data } = await $authHost.get('/api/library');
                setGames(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, [navigate]);

    const handleOpenModal = async (product) => {
        setSelectedProduct(product);
        setShowModal(true);
        setLoadingAccounts(true);
        setLoadingSubscriptions(true);
        try {
            const { data } = await $authHost.get(`/api/library/product/${product.id}/subscriptions`);
            setSubscriptions(data);
        } catch (e) {
            console.error('Error fetching subscriptions:', e);
        } finally {
            setLoadingSubscriptions(false);
        }
        try {
            const { data } = await $authHost.get(`/api/library/product/${product.id}/accounts`);
            setAccounts(data);
        } catch (e) {
            console.error('Error fetching accounts:', e);
        } finally {
            setLoadingAccounts(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setAccounts([]);
    };

    const handleRun = (product) => {
        alert(`Демо-версия: запуск "${product.name}" пока не поддерживается.`);
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <>
            <Container className="mt-4">
                <h2>Моя библиотека</h2>
                <Row>
                    {games.map((entry) => (
                        <Col key={entry.id} md={3} className="mb-4">
                            <Card style={{ cursor: 'pointer' }} onClick={() => handleOpenModal(entry.product)}>
                                <Card.Img
                                    variant="top"
                                    src={entry.product.img?.startsWith('http')
                                        ? entry.product.img
                                        : `${process.env.REACT_APP_API_URL}/static/${entry.product.img}`}
                                />
                                <Card.Body>
                                    <Card.Title>{entry.product.name}</Card.Title>
                                    <Button variant="primary" onClick={(e) => { e.stopPropagation(); handleRun(entry.product); }}>
                                        Запустить
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
                {selectedProduct && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>{selectedProduct.name}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md={4}>
                                    <Image
                                        src={selectedProduct.img?.startsWith('http')
                                            ? selectedProduct.img
                                            : `${process.env.REACT_APP_API_URL}/static/${selectedProduct.img}`}
                                        fluid
                                        thumbnail
                                    />
                                </Col>
                                <Col md={8}>
                                    <p>{selectedProduct.description}</p>
                                    <Button variant="primary" onClick={() => handleRun(selectedProduct)}>
                                        Запустить
                                    </Button>
                                </Col>
                            </Row>
                            <hr />
                            <h5>Купленные аккаунты</h5>
                            {loadingAccounts ? (
                                <Spinner animation="border" size="sm" />
                            ) : accounts.length > 0 ? (
                                accounts.map(acc => (
                                    <div key={acc.id} className="mb-3 p-2 border rounded">
                                        <div><strong>Логин:</strong> {acc.login}</div>
                                        <div><strong>Пароль:</strong> {acc.password}</div>
                                        {acc.additional_info && <div><strong>Доп. информация:</strong> {acc.additional_info}</div>}
                                    </div>
                                ))
                            ) : (
                                <p>Нет приобретённых аккаунтов.</p>
                            )}
                            <hr />
                            <h5>Активные подписки</h5>
                            {loadingSubscriptions ? (
                                <Spinner animation="border" size="sm" />
                            ) : subscriptions.length > 0 ? (
                                subscriptions.map(sub => (
                                    <div key={sub.id} className="mb-3 p-2 border rounded">
                                        <div><strong>Название:</strong> {sub.name}</div>
                                        <div><strong>Длительность:</strong> {sub.duration_days} дней</div>
                                        <div><strong>Активна до:</strong> {new Date(sub.end_date).toLocaleDateString()}</div>
                                    </div>
                                ))
                            ) : (
                                <p>Нет активных подписок.</p>
                            )}
                        </Modal.Body>
                    </>
                )}
            </Modal>
        </>
    );
};

export default Library;