import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Image, Alert } from 'react-bootstrap';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { fetchLibrary } from '../http/libraryAPI';

const Library = observer(() => {
    const { user } = useContext(Context);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user.isAuth) {
            fetchLibrary()
                .then(data => setGames(data))
                .catch(e => setError(e.message))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user.isAuth]);

    const handleLaunch = (game) => {
        alert(`Демо-версия. Запуск игры "${game.name}" пока не реализован.`);
    };

    if (!user.isAuth) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="info">Войдите в аккаунт, чтобы просмотреть библиотеку.</Alert>
            </Container>
        );
    }

    if (loading) return <Container className="mt-5 text-center">Загрузка...</Container>;
    if (error) return <Container className="mt-5 text-center text-danger">{error}</Container>;

    return (
        <Container className="mt-4">
            <h2 className="mb-4">Моя библиотека</h2>
            {games.length === 0 ? (
                <Alert variant="secondary">У вас пока нет игр. Посетите магазин, чтобы купить.</Alert>
            ) : (
                <Row>
                    {games.map(game => (
                        <Col key={game.id} md={3} className="mb-4">
                            <Card className="h-100">
                                <Image
                                    variant="top"
                                    src={game.img?.startsWith('http') ? game.img : `${process.env.REACT_APP_API_URL}/static/${game.img}`}
                                    style={{ height: '180px', objectFit: 'cover' }}
                                />
                                <Card.Body>
                                    <Card.Title>{game.name}</Card.Title>
                                    <Button variant="primary" onClick={() => handleLaunch(game)}>
                                        Запустить
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
});

export default Library;