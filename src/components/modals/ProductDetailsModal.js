// client/src/components/modals/ProductDetailsModal.js
import React, {useState, useEffect} from 'react';
import {Modal, Button, Image, Row, Col, Card, Spinner, Alert} from 'react-bootstrap';
import {fetchOneProduct} from '../../http/productAPI';
import {$authHost} from '../../http';

const ProductDetailsModal = ({show, onHide, productId}) => {
    const [product, setProduct] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (productId && show) {
            const loadData = async () => {
                setLoading(true);
                setError('');
                try {
                    const productData = await fetchOneProduct(productId);
                    setProduct(productData);

                    // Загружаем купленные аккаунты для этого продукта
                    const {data: accountsData} = await $authHost.get(`/api/library/product/${productId}/accounts`);
                    setAccounts(accountsData);
                } catch (e) {
                    setError(e.message);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [productId, show]);

    const handleRun = () => {
        alert(`Демо-версия: запуск "${product?.name}" пока не поддерживается.`);
    };

    const imageUrl = product?.img?.startsWith('http')
        ? product.img
        : `${process.env.REACT_APP_API_URL}/static/${product?.img}`;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Информация о товаре</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading && (
                    <div className="text-center">
                        <Spinner animation="border"/>
                    </div>
                )}
                {error && <Alert variant="danger">{error}</Alert>}
                {product && !loading && (
                    <>
                        <Row>
                            <Col md={4}>
                                <Image src={imageUrl} fluid thumbnail/>
                            </Col>
                            <Col md={8}>
                                <h3>{product.name}</h3>
                                <p>{product.description}</p>
                                <Button variant="primary" onClick={handleRun}>
                                    Запустить
                                </Button>
                            </Col>
                        </Row>

                        <hr/>

                        <h5>Приобретённые аккаунты</h5>
                        {accounts.length === 0 ? (
                            <p>Нет приобретённых аккаунтов</p>
                        ) : (
                            <Row>
                                {accounts.map(acc => (
                                    <Col md={6} key={acc.id} className="mb-3">
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>{acc.productName}</Card.Title>
                                                <Card.Text>
                                                    <strong>Логин:</strong> {acc.login}<br/>
                                                    <strong>Пароль:</strong> {acc.password}<br/>
                                                    {acc.additional_info && (
                                                        <>
                                                            <strong>Доп. информация:</strong> {acc.additional_info}
                                                        </>
                                                    )}
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}

                        {/* Раздел для подписок (пока пуст) */}
                        <h5 className="mt-4">Подписки</h5>
                        <p>Нет приобретённых подписок</p>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Закрыть
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProductDetailsModal;