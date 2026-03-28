import React, { useContext, useEffect, useState } from 'react';
import { Button, Dropdown, Form, Modal, Alert } from "react-bootstrap";
import { Context } from "../../index";
import { fetchPlatforms } from "../../http/platformAPI";
import {
    fetchProductTypes,
    createProduct,
    fetchTags,
    fetchPublishers,
    fetchGamesAndApps
} from "../../http/productAPI";

const CreateProduct = ({ show, onHide }) => {
    const { product, game } = useContext(Context);
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [specificData, setSpecificData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProductTypes().then(data => product.setTypes(data)).catch(e => console.error(e));
        fetchTags().then(data => game.setTags(data)).catch(e => console.error(e));
        fetchPublishers().then(data => game.setPublishers(data)).catch(e => console.error(e));
        fetchGamesAndApps().then(data => game.setOnlineGames(data)).catch(e => console.error(e));
    }, [product, game]);

    const handleSpecificDataChange = (key, value) => {
        setSpecificData(prev => ({ ...prev, [key]: value }));
    };

    const selectFile = e => {
        setFile(e.target.files[0]);
    };

    const addProduct = async () => {
        setLoading(true);
        setError('');
        try {
            if (!product.selectedType) throw new Error('Выберите тип товара');
            if (!name.trim()) throw new Error('Введите название товара');
            if (price <= 0) throw new Error('Цена должна быть больше 0');
            if (!file) throw new Error('Выберите изображение');

            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('price', String(price));
            formData.append('description', description);
            formData.append('productTypeId', String(product.selectedType.id));
            formData.append('quantity', String(quantity));

            if (game.selectedTag) {
                formData.append('tagId', String(game.selectedTag.id));
            }
            if (game.selectedPublisher) {
                formData.append('publisherId', String(game.selectedPublisher.id));
            }


            const dataToSend = { ...specificData };
            if (product.selectedType.id === 3 && specificData.game_id) {
                dataToSend.game_id = specificData.game_id;
            }

            formData.append('specificData', JSON.stringify(dataToSend));
            formData.append('img', file);

            await createProduct(formData);
            onHide();
            // Сброс формы
            setName("");
            setPrice(0);
            setDescription("");
            setFile(null);
            setQuantity(1);
            setSpecificData({});
            product.setSelectedType(null);
            game.setSelectedTag(null);
            game.setSelectedPublisher(null);
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const renderSpecificFields = () => {
        if (!product.selectedType) return null;

        switch (product.selectedType.id) {
            case 1: // Игра
                return (
                    <>
                        <Dropdown className="mb-3">
                            <Dropdown.Toggle variant="outline-secondary">
                                {game.selectedTag?.name || "Выберите тег"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => game.setSelectedTag(null)}>
                                    Без тега
                                </Dropdown.Item>
                                {game.tags.map(tag => (
                                    <Dropdown.Item key={tag.id} onClick={() => game.setSelectedTag(tag)}>
                                        {tag.name}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown className="mb-3">
                            <Dropdown.Toggle variant="outline-secondary">
                                {game.selectedPublisher?.name || "Выберите издателя"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => game.setSelectedPublisher(null)}>
                                    Без издателя
                                </Dropdown.Item>
                                {game.publishers.map(publisher => (
                                    <Dropdown.Item key={publisher.id} onClick={() => game.setSelectedPublisher(publisher)}>
                                        {publisher.name}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Form.Check
                            type="checkbox"
                            label="Онлайн игра"
                            checked={specificData.is_online || false}
                            onChange={e => handleSpecificDataChange('is_online', e.target.checked)}
                        />
                    </>
                );

            case 2: // Подписка
                return (
                    <>
                        <Dropdown className="mb-3">
                            <Dropdown.Toggle variant="outline-secondary">
                                {specificData.target_product_id ? game.onlineGames.find(g => g.id === specificData.target_product_id)?.name || "Выберите игру или приложение" : "Выберите игру или приложение"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {game.onlineGames.map(g => (
                                    <Dropdown.Item key={g.id} onClick={() => handleSpecificDataChange('target_product_id', g.id)}>
                                        {g.name} ({g.type?.name === 'Приложение' ? 'Приложение' : 'Игра'})
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                        <Form.Control
                            className="mb-3"
                            type="number"
                            placeholder="Длительность в днях"
                            value={specificData.duration_days || ''}
                            onChange={e => handleSpecificDataChange('duration_days', e.target.value)}
                            min="1"
                        />
                        <Form.Control
                            className="mb-3"
                            type="number"
                            placeholder="Доступное количество"
                            value={specificData.available_count || ''}
                            onChange={e => handleSpecificDataChange('available_count', e.target.value)}
                            min="0"
                        />
                        <Form.Control
                            className="mb-3"
                            type="number"
                            placeholder="Количество кодов"
                            value={quantity}
                            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                        />
                    </>
                );

            case 3: // Аккаунт
                return (
                    <>
                        <Form.Control
                            className="mb-3"
                            as="textarea"
                            placeholder="Дополнительная информация об аккаунте"
                            value={specificData.additional_info || ''}
                            onChange={e => handleSpecificDataChange('additional_info', e.target.value)}
                            rows={3}
                        />
                        <Form.Control
                            className="mb-3"
                            type="number"
                            placeholder="Количество аккаунтов"
                            value={quantity}
                            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                        />
                        <Dropdown className="mb-3">
                            <Dropdown.Toggle variant="outline-secondary">
                                {specificData.game_id ? game.onlineGames.find(g => g.id === specificData.game_id)?.name || "Выберите игру или приложение" : "Выберите игру или приложение"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {game.onlineGames.map(g => (
                                    <Dropdown.Item key={g.id} onClick={() => {
                                        handleSpecificDataChange('game_id', g.id);
                                        game.setSelectedGame(g);
                                    }}>
                                        {g.name} ({g.type?.name === 'Приложение' ? 'Приложение' : 'Игра'})
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </>
                );

            case 4: // Приложение
                return (
                    <>
                        <Dropdown className="mb-3">
                            <Dropdown.Toggle variant="outline-secondary">
                                {game.selectedTag?.name || "Выберите тег"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => game.setSelectedTag(null)}>
                                    Без тега
                                </Dropdown.Item>
                                {game.tags.map(tag => (
                                    <Dropdown.Item key={tag.id} onClick={() => game.setSelectedTag(tag)}>
                                        {tag.name}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown className="mb-3">
                            <Dropdown.Toggle variant="outline-secondary">
                                {game.selectedPublisher?.name || "Выберите издателя"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => game.setSelectedPublisher(null)}>
                                    Без издателя
                                </Dropdown.Item>
                                {game.publishers.map(publisher => (
                                    <Dropdown.Item key={publisher.id} onClick={() => game.setSelectedPublisher(publisher)}>
                                        {publisher.name}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Добавить товар</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Dropdown className="mb-3">
                        <Dropdown.Toggle variant="outline-primary">
                            {product.selectedType?.name || "Выберите тип товара"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {product.types.map(type => (
                                <Dropdown.Item key={type.id} onClick={() => product.setSelectedType(type)}>
                                    {type.name}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>

                    <Form.Control
                        className="mb-3"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Название товара"
                    />

                    <Form.Control
                        className="mb-3"
                        type="number"
                        value={price}
                        onChange={e => setPrice(Number(e.target.value))}
                        placeholder="Цена"
                        min="0"
                        step="0.01"
                    />

                    <Form.Control
                        className="mb-3"
                        as="textarea"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Описание товара"
                        rows={3}
                    />

                    <Form.Control
                        className="mb-3"
                        type="file"
                        onChange={selectFile}
                    />

                    {renderSpecificFields()}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>Закрыть</Button>
                <Button variant="outline-success" onClick={addProduct} disabled={loading || !product.selectedType}>
                    {loading ? 'Добавление...' : 'Добавить'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateProduct;