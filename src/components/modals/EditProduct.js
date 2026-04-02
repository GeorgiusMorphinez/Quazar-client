import React, { useContext, useEffect, useState } from 'react';
import { Button, Dropdown, Form, Modal, Alert } from "react-bootstrap";
import { Context } from "../../index";
import { fetchTags, fetchPublishers, fetchGamesAndApps } from "../../http/productAPI";
import { fetchProductTypes, updateProduct, deleteProduct, fetchOneProduct } from "../../http/productAPI";

const EditProduct = ({ show, onHide, productId }) => {
    const { product, game } = useContext(Context);
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
        fetchGamesAndApps().then(data => game.setOnlineGames(data)).catch(e => console.error(e));
    }, [product, game]);

    useEffect(() => {
        if (productId && show) {
            const loadProduct = async () => {
                try {
                    const data = await fetchOneProduct(productId);
                    console.log('EditProduct loadProduct data:', data);
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

                    // Специфичные данные
                    if (data.subscriptionProducts && data.subscriptionProducts.length > 0) {
                        // Подписка
                        const sub = data.subscriptionProducts[0];
                        setSpecificData({
                            target_product_id: sub.target_product_id,
                            duration_days: sub.duration_days,
                            available_count: sub.available_count
                        });
                        setQuantity(sub.available_count);
                    } else if (data.accounts && data.accounts.length > 0) {
                        // Аккаунт
                        setSpecificData({
                            additional_info: data.additional_info || '',
                            quantity: data.availableAccounts || 0,
                            game_id: data.target_product_id // если поле в ответе называется target_product_id
                        });
                        setQuantity(data.availableAccounts || 0);
                    } else if (data.product_type_id === 1 || data.product_type_id === 4) {
                        setSpecificData({
                            is_online: data.is_online || false
                        });
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

            if (currentTag) {
                formData.append('tagId', String(currentTag.id));
            }
            if (currentPublisher) {
                formData.append('publisherId', String(currentPublisher.id));
            }

            // Для подписки отдельно формируем specificData
            if (currentType?.id === 2) {
                const subscriptionData = {
                    target_product_id: specificData.target_product_id,
                    duration_days: specificData.duration_days,
                    available_count: specificData.available_count
                };
                formData.append('specificData', JSON.stringify(subscriptionData));
            } else {
                const dataToSend = { ...specificData };
                if (currentType?.id === 3) {
                    dataToSend.quantity = quantity;
                }
                formData.append('specificData', JSON.stringify(dataToSend));
            }

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
                                {specificData.target_product_id
                                    ? game.onlineGames.find(g => g.id === specificData.target_product_id)?.name || "Выберите игру или приложение"
                                    : "Выберите игру или приложение"}
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
                                {specificData.target_product_id ? game.onlineGames.find(g => g.id === specificData.target_product_id)?.name || "Выберите игру" : "Выберите игру"}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {game.onlineGames.map(g => (
                                    <Dropdown.Item key={g.id} onClick={() => handleSpecificDataChange('target_product_id', g.id)}>
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