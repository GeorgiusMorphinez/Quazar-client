import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Context } from '../index';
import { $authHost } from '../http';

const Library = () => {
    const { user } = useContext(Context);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user.isAuth) {
            $authHost.get('/api/library')
                .then(response => setGames(response.data))
                .catch(e => console.error(e))
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleLaunch = (game) => {
        alert(`Демо-версия. Запуск игры "${game.name}" пока не реализован.`);
    };

    if (!user.isAuth) {
        return (
            <Container className="mt-5 text-center">
                <h3>Пожалуйста, войдите в аккаунт, чтобы увидеть библиотеку.</h3>
            </Container>
        );
    }

    if (loading) {
        return <Container className="mt-5 text-center">Загрузка...</Container>;
    }

    if (games.length === 0) {
        return (
            <Container className="mt-5 text-center">
                <h3>Ваша библиотека пуста.</h3>
                <p>Купите игры, чтобы они появились здесь.</p>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <h2>Моя библиотека</h2>
            <Row>
                {games.map(entry => (
                    <Col md={3} key={entry.id} className="mb-4">
                        <Card>
                            <Card.Img
                                variant="top"
                                src={entry.product.img?.startsWith('http') ? entry.product.img : `${process.env.REACT_APP_API_URL}/static/${entry.product.img}`}
                                style={{ height: '180px', objectFit: 'cover' }}
                            />
                            <Card.Body>
                                <Card.Title>{entry.product.name}</Card.Title>
                                <Button variant="primary" onClick={() => handleLaunch(entry.product)}>
                                    Запустить
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default Library;