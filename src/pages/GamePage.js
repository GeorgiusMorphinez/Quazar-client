import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Container, Row, Col, Image, Spinner } from 'react-bootstrap';
import { fetchOneGames } from '../http/gameAPI';
import { createRating } from '../http/ratingAPI';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';

const GamePage = observer(() => {
    const { user } = useContext(Context);
    const [game, setGame] = useState({
        info: [],
        ratings: [],
        name: '',
        img: '',
        rating: 0
    });
    const [selectedRating, setSelectedRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();

    const loadGame = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchOneGames(id);

            setGame({
                name: data.name,
                img: data.img,
                info: data.info || [],
                ratings: data.ratings || [],
                rating: data.rating || 0
            });

            if (user.isAuth && data.ratings) {
                // Используем user_id вместо userId
                const userRating = data.ratings.find(r => r.user_id === user.user.id)?.rate;
                setSelectedRating(userRating || 0);
            }
        } catch (e) {
            console.error('Load error:', e);
            setError('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    }, [id, user]);

    useEffect(() => {
        loadGame();
    }, [loadGame]);

    const handleRatingSubmit = async () => {
        try {
            if (!user.isAuth) return alert('Авторизуйтесь!');
            await createRating(id, selectedRating);
            await loadGame(); // Перезагружаем данные после оценки
            alert('Оценка сохранена!');
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
                        src={`${process.env.REACT_APP_API_URL}/static/${game.img}`}
                        thumbnail
                        alt={game.name}
                    />
                </Col>

                <Col md={8}>
                    <h2>{game.name}</h2>

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
                            <h5>Средний рейтинг: {game.rating}</h5>
                            <small>На основе {game.ratings.length} оценок</small>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="mt-5">
                <Col>
                    <h3>Описание</h3>
                    {game.info.length > 0 ? (
                        game.info.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="p-3 mb-3 border rounded"
                            >
                                <strong>{item.title}:</strong> {item.description}
                            </div>
                        ))
                    ) : (
                        <div className="text-muted">Дополнительная информация отсутствует</div>
                    )}
                </Col>
            </Row>
        </Container>
    );
});

export default GamePage;