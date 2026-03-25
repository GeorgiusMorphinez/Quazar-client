import React, { useContext, useEffect, useState } from 'react';
import { Button, Dropdown, Form, Modal, Alert } from "react-bootstrap";
import { Context } from "../../index";
import { fetchTags, fetchPublishers } from "../../http/productAPI";
import { fetchPlatforms } from "../../http/platformAPI";
import { fetchProductTypes, updateProduct, deleteProduct, fetchOneProduct, fetchOnlineGames } from "../../http/productAPI";

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

    // Локальные состояния
    const [currentType, setCurrentType] = useState(null);
    const [currentTag, setCurrentTag] = useState(null);
    const [currentPublisher, setCurrentPublisher] = useState(null);

    // Загрузка общих данных (только при монтировании)
    useEffect(() => {
        fetchProductTypes().then(data => product.setTypes(data));
        fetchTags().then(data => game.setTags(data));
        fetchPublishers().then(data => game.setPublishers(data));
        fetchPlatforms().then(data => setPlatforms(data));
        fetchOnlineGames().then(data => game.setOnlineGames(data));
    }, [product, game]);

    // Загрузка данных редактируемого товара
    useEffect(() => {
        if (productId && show) {
            const loadProduct = async () => {
                try {
                    const data = await fetchOneProduct(productId);
                    console.log('=== EDIT PRODUCT LOADED ===');
                    console.log('Data:', data);
                    console.log('product_type_id:', data.product_type_id, 'type:', typeof data.product_type_id);
                    // Основные поля
                    setName(data.name);
                    setPrice(data.price);
                    setDescription(data.description);
                    setFile(null);
                    setError('');
                    setLoading(false);

                    // Определяем тип по product_type_id
                    const typeIdNum = parseInt(data.product_type_id);
                    const typeObj = product.types.find(t => t.id === data.product_type_id);
                    console.log('Found typeObj:', typeObj);
                    setCurrentType(typeObj || null);

                    // Определяем тег и издателя по их id
                    const tagObj = game.tags.find(t => t.id === data.tag_id);
                    setCurrentTag(tagObj || null);
                    const publisherObj = game.publishers.find(p => p.id === data.publisher_id);
                    setCurrentPublisher(publisherObj || null);

                    // Специфичные данные
                    if (data.subscription) {
                        console.log('Subscription data found');
                        setSpecificData({
                            platform_id: data.subscription.platform_id,
                            duration_days: data.subscription.duration_days
                        });
                        setQuantity(data.availableCodes || 0);
                    } else if (data.accounts) {
                        console.log('Accounts data found');
                        setSpecificData({
                            additional_info: data.additional_info || '',
                            quantity: data.availableAccounts || 0
                        });
                        setQuantity(data.availableAccounts || 0);
                    } else if (typeIdNum === 1) {
                        console.log('Game (type 1) - setting specificData');
                        setSpecificData({
                            is_online: data.is_online || false
                        });
                        setQuantity(1);
                    } else if (typeIdNum === 4) {
                        console.log('App (type 4) - setting empty specificData');
                        setSpecificData({});
                        setQuantity(1);
                    } else {
                        console.log('Unknown product type, no specific data');
                    }
                } catch (e) {
                    console.error('Error loading product:', e);
                    setError('Ошибка загрузки данных товара');
                }
            };
            loadProduct();
        }
    }, [productId, show, product.types, game.tags, game.publishers]);

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
            // Тип товара не передаём – он не должен меняться
            if (currentType?.id === 2 || currentType?.id === 3) {
                formData.append('quantity', String(quantity));
            }

            if (currentTag) {
                formData.append('tagId', String(currentTag.id));
            }
            if (currentPublisher) {
                formData.append('publisherId', String(currentPublisher.id));
            }

            const dataToSend = { ...specificData };
            if (currentType?.id === 2 || currentType?.id === 3) {
                dataToSend.quantity = quantity;
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
        console.log('Rendering specific fields, currentType:', currentType, 'specificData:', specificData);
        if (!currentType) return null;

        switch (currentType.id) {
            case 1: // Игра
                return (
                    <>
                        <Dropdown className="mb-3">
                            <Dropdown.Toggle variant="outline-secondary">
                                {currentTag?.name || "Выберите тег"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setCurrentTag(null)}>Без тега</Dropdown.Item>
                                {game.tags.map(tag => (
                                    <Dropdown.Item key={tag.id} onClick={() => setCurrentTag(tag)}>
                                        {tag.name}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown className="mb-3">
                            <Dropdown.Toggle variant="outline-secondary">
                                {currentPublisher?.name || "Выберите издателя"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setCurrentPublisher(null)}>Без издателя</Dropdown.Item>
                                {game.publishers.map(publisher => (
                                    <Dropdown.Item key={publisher.id} onClick={() => setCurrentPublisher(publisher)}>
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
                                    <Dropdown.Item key={platform.id} onClick={() => handleSpecificDataChange('platform_id', platform.id)}>
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
                            placeholder="Количество аккаунтов"
                            value={quantity}
                            onChange={e => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                            min="0"
                        />
                        <Dropdown className="mb-3">
                            <Dropdown.Toggle variant="outline-secondary">
                                {specificData.game_id ? game.onlineGames.find(g => g.id === specificData.game_id)?.name || "Выберите игру" : "Выберите игру"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {game.onlineGames.map(g => (
                                    <Dropdown.Item key={g.id} onClick={() => handleSpecificDataChange('game_id', g.id)}>
                                        {g.name}
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
                                {currentTag?.name || "Выберите тег"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setCurrentTag(null)}>Без тега</Dropdown.Item>
                                {game.tags.map(tag => (
                                    <Dropdown.Item key={tag.id} onClick={() => setCurrentTag(tag)}>
                                        {tag.name}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>

                        <Dropdown className="mb-3">
                            <Dropdown.Toggle variant="outline-secondary">
                                {currentPublisher?.name || "Выберите издателя"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setCurrentPublisher(null)}>Без издателя</Dropdown.Item>
                                {game.publishers.map(publisher => (
                                    <Dropdown.Item key={publisher.id} onClick={() => setCurrentPublisher(publisher)}>
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
                    <div className="mb-3">
                        <Form.Label>Тип товара</Form.Label>
                        <Form.Control
                            type="text"
                            value={currentType?.name || ''}
                            disabled
                            readOnly
                        />
                    </div>

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
                    disabled={loading || !currentType}
                >
                    {loading ? 'Обновление...' : 'Обновить'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditProduct;