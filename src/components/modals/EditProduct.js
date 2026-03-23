import React, { useContext, useEffect, useState } from 'react';
import { Button, Dropdown, Form, Modal, Alert } from "react-bootstrap";
import { Context } from "../../index";
import { fetchPlatforms } from "../../http/platformAPI";
import { fetchProductTypes, updateProduct, deleteProduct, fetchOneProduct, fetchTags, fetchPublishers, fetchOnlineGames } from "../../http/productAPI";

const EditProduct = ({ show, onHide, productId }) => {
    const { product, game } = useContext(Context);
    const [platforms, setPlatforms] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [specificData, setSpecificData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    useEffect(() => {
        if (productId) {
            const loadProduct = async () => {
                try {
                    const data = await fetchOneProduct(productId);
                    setName(data.name);
                    setPrice(data.price);
                    setDescription(data.description);
                    product.setSelectedType(data.productType);
                    if (data.tag) game.setSelectedTag(data.tag);
                    if (data.publisher) game.setSelectedPublisher(data.publisher);
                    const onlineGamesData = await fetchOnlineGames();
                    game.setOnlineGames(onlineGamesData);
                    if (data.subscription) {
                        setSpecificData({
                            platform_id: data.subscription.platform_id,
                            duration_days: data.subscription.duration_days
                        });
                        setQuantity(data.availableCodes || 0); // Для подписок
                    } else if (data.accounts) {
                        setSpecificData({
                            additional_info: data.additional_info || ''
                        });
                        setQuantity(data.availableAccounts || 0);
                    } else if (data.product_type_id === 1) {
                        setSpecificData({
                            is_online: data.is_online || false
                        });
                    }
                } catch (e) {
                    setError('Ошибка загрузки данных товара');
                }
            };
            loadProduct();
        }
    }, [productId, game, product]);

    useEffect(() => {
        fetchProductTypes().then(data => product.setTypes(data));
        fetchTags().then(data => game.setTags(data));
        fetchPublishers().then(data => game.setPublishers(data));
        fetchPlatforms().then(data => setPlatforms(data));
    }, [product, game]);

    const handleSpecificDataChange = (key, value) => {
        setSpecificData(prev => ({ ...prev, [key]: value }));
    };

    const selectFile = e => {
        setFile(e.target.files[0]);
    };

    const update = async () => {
        setLoading(true);
        setError('');

        try {
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

            // Добавляем специфичные данные
            const dataToSend = { ...specificData };
            if (product.selectedType.id === 2 || product.selectedType.id === 3) {
                dataToSend.quantity = quantity;
            }
            if (product.selectedType.id === 1) {
                dataToSend.is_online = specificData.is_online; // уже есть
            }
            formData.append('specificData', JSON.stringify(dataToSend));

            if (file) formData.append('img', file);

            await updateProduct(productId, formData);
            onHide();
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteProd = async () => {
        if (window.confirm('Вы уверены, что хотите удалить товар?')) {
            try {
                await deleteProduct(productId);
                onHide();
            } catch (e) {
                setError(e.response?.data?.message || 'Ошибка удаления');
            }
        }
    };

    const renderSpecificFields = () => {
        if (!product.selectedType) return null;

        switch (product.selectedType.id) {
            case 1: // Ключ
                return (
                    <>
                        <Dropdown className="mb-3">
                            <Dropdown.Toggle variant="outline-secondary">
                                {game.selectedTag?.name || "Выберите тэг"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => game.setSelectedTag(null)}>
                                    Без тэга
                                </Dropdown.Item>
                                {game.tags.map(tag => (
                                    <Dropdown.Item
                                        key={tag.id}
                                        onClick={() => game.setSelectedTag(tag)}
                                    >
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
                                    <Dropdown.Item
                                        key={publisher.id}
                                        onClick={() => game.setSelectedPublisher(publisher)}
                                    >
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
                                {specificData.platform_id ? platforms.find(p => p.id === specificData.platform_id)?.name || "Выберите платформу" : "Выберите платформу"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {platforms.map(platform => (
                                    <Dropdown.Item
                                        key={platform.id}
                                        onClick={() => handleSpecificDataChange('platform_id', platform.id)}
                                    >
                                        {platform.name}
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
                            placeholder="Количество"
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
                        placeholder="Дополнительная информация"
                        value={specificData.additional_info || ''}
                        onChange={e => handleSpecificDataChange('additional_info', e.target.value)}
                        rows={3}
                    />
                    <Form.Control
                        className="mb-3"
                        type="number"
                        placeholder="Количество"
                        value={quantity}
                        onChange={e => setQuantity(Math.max(0, parseInt(e.target.value) || 0))} // Для редактирования
                        min="0"
                    />
                    <Dropdown className="mb-3">
                        <Dropdown.Toggle variant="outline-secondary">
                            {specificData.game_id ? game.onlineGames.find(g => g.id === specificData.game_id)?.name || "Выберите игру" : "Выберите игру"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                        {game.onlineGames.map(g => (
                            <Dropdown.Item
                                key={g.id}
                                onClick={() => handleSpecificDataChange('game_id', g.id)}
                            >
                                {g.name}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                    </Dropdown>
            </>
            );

            case 4:
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
                <Modal.Title>Редактировать товар</Modal.Title>
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
                                <Dropdown.Item
                                    key={type.id}
                                    onClick={() => product.setSelectedType(type)}
                                >
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
                <Button variant="outline-danger" onClick={deleteProd}>Удалить товар</Button>
                <Button variant="outline-danger" onClick={onHide}>Закрыть</Button>
                <Button
                    variant="outline-success"
                    onClick={update}
                    disabled={loading || !product.selectedType}
                >
                    {loading ? 'Обновление...' : 'Обновить'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditProduct;