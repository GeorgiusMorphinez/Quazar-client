import React, { useContext, useEffect, useState } from 'react';
import { Button, Dropdown, Form, Modal, Alert } from "react-bootstrap";
import { Context } from "../../index";
import { fetchTags, fetchPublishers, fetchGamesAndApps } from "../../http/productAPI";
import { fetchPlatforms } from "../../http/platformAPI";
import { fetchProductTypes, updateProduct, deleteProduct, fetchOneProduct } from "../../http/productAPI";

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

    const [currentType, setCurrentType] = useState(null);
    const [currentTag, setCurrentTag] = useState(null);
    const [currentPublisher, setCurrentPublisher] = useState(null);

    useEffect(() => {
        fetchProductTypes().then(data => product.setTypes(data));
        fetchTags().then(data => game.setTags(data));
        fetchPublishers().then(data => game.setPublishers(data));
        fetchPlatforms().then(data => setPlatforms(data));
        fetchGamesAndApps().then(data => game.setOnlineGames(data)).catch(e => console.error(e));
    }, [product, game]);

    useEffect(() => {
        if (productId && show) {
            const loadProduct = async () => {
                try {
                    const data = await fetchOneProduct(productId);
                    console.log('=== EDIT PRODUCT LOADED ===');
                    console.log('Data:', data);
                    console.log('product_type_id:', data.product_type_id);
                    console.log('type object (from data.type):', data.type);
                    console.log('tag object (from data.tag):', data.tag);
                    console.log('publisher object (from data.publisher):', data.publisher);
                    console.log('product.types length:', product.types.length);
                    console.log('game.tags length:', game.tags.length);
                    console.log('game.publishers length:', game.publishers.length);
                    setName(data.name);
                    setPrice(data.price);
                    setDescription(data.description);
                    setFile(null);
                    setError('');
                    setLoading(false);

                    const typeObj = product.types.find(t => t.id === data.product_type_id);
                    setCurrentType(typeObj || null);

                    const tagObj = game.tags.find(t => t.id === data.tag_id);
                    setCurrentTag(tagObj || null);
                    const publisherObj = game.publishers.find(p => p.id === data.publisher_id);
                    setCurrentPublisher(publisherObj || null);

                    // Специфичные данные – проверяем наличие реальных данных
                    if (data.subscription && data.subscription.duration_days) {
                        // Подписка
                        setSpecificData({
                            platform_id: data.subscription.platform_id,
                            duration_days: data.subscription.duration_days
                        });
                        setQuantity(data.availableCodes || 0);
                    } else if (data.accounts && data.accounts.length > 0) {
                        // Аккаунт
                        setSpecificData({
                            additional_info: data.additional_info || '',
                            quantity: data.availableAccounts || 0
                        });
                        setQuantity(data.availableAccounts || 0);
                    } else if (data.product_type_id === 1) {
                        // Игра
                        setSpecificData({
                            is_online: data.is_online || false
                        });
                        setQuantity(1);
                    } else if (data.product_type_id === 4) {
                        // Приложение
                        setSpecificData({});
                        setQuantity(1);
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
                                    <Dropdown.Item key={g.id} onClick={() => handleSpecificDataChange('game_id', g.id)}>
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