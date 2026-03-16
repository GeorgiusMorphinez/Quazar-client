import React, {useContext, useEffect, useState} from 'react';
import {Button, Col, Dropdown, Form, Row} from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import {Context} from "../../index";
import {createGame, fetchGenres, fetchPublishers} from "../../http/gameAPI";

console.log('Токен при отправке:', localStorage.getItem('token'));

const CreateGame = (({show, onHide}) => {
    const {game} = useContext(Context);
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [file, setFile] = useState(null);
    const [info, setInfo] = useState([]);

    useEffect(() => {
        fetchGenres()
            .then(data => {
                console.log('Полученные жанры:', data); // Логирование
                game.setGenres(data);
            })
            .catch(e => console.error('Ошибка загрузки жанров:', e));

        fetchPublishers()
            .then(data => {
                console.log('Полученные издатели:', data); // Логирование
                game.setPublishers(data);
            })
            .catch(e => console.error('Ошибка загрузки издателей:', e));
    }, [game]);

    const addInfo = () => {
        setInfo([...info, {title: '', description: '', number: Date.now()}]);
    };

    const removeInfo = (number) => {
        setInfo(info.filter(i => i.number !== number));
    };

    const changeInfo = (key, value, number) => {
        setInfo(info.map(i => i.number === number ? {...i, [key]: value} : i));
    };

    const selectFile = e => {
        setFile(e.target.files[0]);
    };

    const addDevice = async () => {
        try {
            console.log('Выбранный жанр:', game.selectedGenre);
            console.log('Выбранный издатель:', game.selectedPublisher);
            console.log('Данные для отправки:', {
                name: name,
                price: price,
                genreId: game.selectedGenre.id, // Должно быть числом
                publisherId: game.selectedPublisher.id, // Должно быть числом
                file: file?.name,
                info: info,
            });

            const formData = new FormData();
            formData.append('name', name);
            formData.append('price', String(price));
            formData.append('genreId', String(game.selectedGenre.id));
            formData.append('publisherId', String(game.selectedPublisher.id));
            formData.append('img', file);
            formData.append('info', JSON.stringify(info));

            const response = await createGame(formData);
            console.log('Ответ сервера:', response.data);
            onHide();
        } catch (e) {
            console.error('Полная ошибка:', e.response?.data);
            console.error('Ошибка создания игры:', e.response?.data);
            alert(e.response?.data?.message || 'Ошибка сервера');

        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Добавить игру</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Dropdown className="mb-3">
                        <Dropdown.Toggle>{game.selectedGenre?.name || "Выберите жанр"}</Dropdown.Toggle>
                        <Dropdown.Menu>
                            {game.genres.map(genre =>
                                <Dropdown.Item
                                    key={genre.id}
                                    onClick={() => game.setSelectedGenre(genre)}
                                >
                                    {genre.name}
                                </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>

                    <Dropdown className="mb-3">
                        <Dropdown.Toggle>{game.selectedPublisher?.name || "Выберите издателя"}</Dropdown.Toggle>
                        <Dropdown.Menu>
                            {game.publishers.map(publisher =>
                                <Dropdown.Item
                                    key={publisher.id}
                                    onClick={() => game.setSelectedPublisher(publisher)}
                                >
                                    {publisher.name}
                                </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>

                    <Form.Control
                        className="mb-3"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Название игры"
                    />

                    <Form.Control
                        className="mb-3"
                        type="number"
                        value={price}
                        onChange={e => setPrice(Number(e.target.value))}
                        placeholder="Цена"
                    />

                    <Form.Control
                        className="mb-3"
                        type="file"
                        onChange={selectFile}
                    />

                    <Button
                        variant="outline-secondary"
                        onClick={addInfo}
                        className="mb-3"
                    >
                        Добавить свойство
                    </Button>

                    {info.map((i, index) => (
                        <Row key={i.number} className="mb-3">
                            <Col md={4}>
                                <Form.Control
                                    value={i.title}
                                    onChange={(e) => changeInfo('title', e.target.value, i.number)}
                                    placeholder="Название свойства"
                                />
                            </Col>
                            <Col md={4}>
                                <Form.Control
                                    value={i.description}
                                    onChange={(e) => changeInfo('description', e.target.value, i.number)}
                                    placeholder="Описание свойства"
                                />
                            </Col>
                            <Col md={4}>
                                <Button
                                    variant="outline-danger"
                                    onClick={() => removeInfo(i.number)}
                                >
                                    Удалить
                                </Button>
                            </Col>
                        </Row>
                    ))}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>Закрыть</Button>
                <Button variant="outline-success" onClick={addDevice}>Добавить</Button>
            </Modal.Footer>
        </Modal>
    );
});

export default CreateGame;
