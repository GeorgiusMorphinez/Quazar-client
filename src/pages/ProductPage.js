import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Container, Row, Col, Image, Spinner } from 'react-bootstrap';
import { fetchOneProduct } from '../http/productAPI';
import { createRating } from '../http/ratingAPI';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import EditProduct from '../components/modals/EditProduct';

// Вспомогательная функция для URL изображения
const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${process.env.REACT_APP_API_URL}/static/${img}`;
};

const ProductPage = observer(() => {
    const { user } = useContext(Context);
    const [product, setProduct] = useState({
        name: '',
        img: '',
        description: '',
        rating: 0
    });
    const [selectedRating, setSelectedRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editShow, setEditShow] = useState(false);
    const { id } = useParams();

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchOneProduct(id);
            setProduct(data);
            // Если пользователь авторизован, проверим его оценку
            if (user.isAuth && data.ratings) {
                const userRating = data.ratings.find(r => r.user_id === user.user.id)?.rate;
                setSelectedRating(userRating || 0);
            }
        } catch (e) {
            console.error('Load error:', e);
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProduct();
    }, [id, user]);

    const handleRatingSubmit = async () => {
        try {
            if (!user.isAuth) return alert('Авторизуйтесь!');
            await createRating(product.id, selectedRating);
            alert('Оценка сохранена!');
            await loadProduct(); // Обновляем данные после оценки
        } catch (e) {
            alert(e.response?.data?.message || 'Ошибка оценки');
        }
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
            <Container className="mt-5 text-center text-danger">
                <h3>{error}</h3>
            </Container>
        );
    }

    return (
        <Container className="mt-3">
            <Row>
                <Col md={4}>
                    <Image
                        width={300}
                        height={300}
                        src={getImageUrl(product.img)}
                        thumbnail
                        alt={product.name}
                    />
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

                        {product.product_type_id === 3 && product.linkedGame && (
                            <p>Привязан к игре: {product.linkedGame.name}</p>
                        )}

                        {user.user.role === 'ADMIN' && (
                            <Button
                                variant="outline-primary"
                                className="mt-3"
                                onClick={() => setEditShow(true)}
                            >
                                🔧 Редактировать
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>

            <EditProduct show={editShow} onHide={() => setEditShow(false)} productId={id} />
        </Container>
    );
});

export default ProductPage;