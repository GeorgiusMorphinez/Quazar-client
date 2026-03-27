import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button } from 'react-bootstrap';
import { $authHost } from '../http';
import ProductDetailsModal from '../components/modals/ProductDetailsModal';

const Library = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [showModal, setShowModal] = useState(false);
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
                const gamesAndApps = data.filter(item =>
                    item.product?.type?.id === 1 || item.product?.type?.id === 4
                );
                setGames(gamesAndApps);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchLibrary();
    }, [navigate]);

    const handleDetails = (productId) => {
        setSelectedProductId(productId);
        setShowModal(true);
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <Container className="mt-4">
            <h2>Моя библиотека</h2>
            <Row>
                {games.map((entry) => (
                    <Col key={entry.id} md={3} className="mb-4">
                        <Card>
                            <Card.Img
                                variant="top"
                                src={entry.product.img?.startsWith('http')
                                    ? entry.product.img
                                    : `${process.env.REACT_APP_API_URL}/static/${entry.product.img}`}
                            />
                            <Card.Body>
                                <Card.Title>{entry.product.name}</Card.Title>
                                <Button variant="primary" onClick={() => handleDetails(entry.product.id)}>
                                    Подробнее
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <ProductDetailsModal
                show={showModal}
                onHide={() => setShowModal(false)}
                productId={selectedProductId}
            />
        </Container>
    );
};

export default Library;