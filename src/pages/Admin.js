import React, { useState } from 'react';
import { Container, Button, Form, Alert } from 'react-bootstrap';
import { $authHost } from '../http';
import { SHOP_ROUTE } from '../utils/consts';
import { useNavigate } from 'react-router-dom';
import CreateTag from '../components/modals/CreateTag';
import CreatePublisher from '../components/modals/CreatePublisher';
import CreateProduct from '../components/modals/CreateProduct';


const Admin = () => {
    const navigate = useNavigate();

    // Состояния для отчетов
    const [reportType, setReportType] = useState('visits');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Состояния для модальных окон
    const [tagVisible, setTagVisible] = useState(false);
    const [publisherVisible, setPublisherVisible] = useState(false);
    const [productVisible, setProductVisible] = useState(false);

    const reportTypes = [
        { value: 'visits', label: 'Посещения пользователей' },
        { value: 'sales', label: 'Продажи игр' },
        { value: 'tags', label: 'Популярные тэги' },
        { value: 'carts', label: 'Неоформленные корзины' }
    ];

    const generateReport = async () => {
        try {
            setError('');
            setIsGenerating(true);

            if (!startDate || !endDate) {
                throw new Error('Укажите начальную и конечную даты');
            }

            // Используем $authHost для авторизованных запросов
            const response = await $authHost.get(
                `/api/reports/${reportType}`,
                {
                    params: { startDate, endDate },
                    responseType: 'blob'
                }
            );

            // Создаем ссылку для скачивания
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportType}_report.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

        } catch (e) {
            if (e.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        setError(errorData.message || 'Ошибка генерации отчёта');
                    } catch (parseError) {
                        setError('Ошибка при обработке ответа сервера');
                    }
                };
                reader.readAsText(e.response.data);
            } else {
                setError(e.message || 'Ошибка генерации отчёта');
            }
            console.error('Full error:', e);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Container className="d-flex flex-column">
            <h2>Панель администратора</h2>

            {/* Секция управления */}
            <div className="mb-4">

                <Button
                    variant="outline-dark"
                    className="mt-4 p-2"
                    onClick={() => setProductVisible(true)}
                >
                    Добавить продукт
                </Button>
                <Button
                    variant="outline-dark"
                    className="mt-4 p-2"
                    onClick={() => setTagVisible(true)}
                >
                    Добавить тэг
                </Button>
                <Button
                    variant="outline-dark"
                    className="mt-4 p-2"
                    onClick={() => setPublisherVisible(true)}
                >
                    Добавить издателя
                </Button>
            </div>

            {/* Секция отчетов */}
            <div className="report-section border p-4 rounded-3">
                <h4>Генерация отчетов</h4>

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Тип отчета</Form.Label>
                        <Form.Select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                        >
                            {reportTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <div className="date-range row g-3 mb-4">
                        <Form.Group className="col-md-6">
                            <Form.Label>Дата начала</Form.Label>
                            <Form.Control
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="col-md-6">
                            <Form.Label>Дата окончания</Form.Label>
                            <Form.Control
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </Form.Group>
                    </div>

                    {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

                    <div className="d-flex gap-3">
                        <Button
                            variant="primary"
                            onClick={generateReport}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Генерация...' : 'Создать отчет'}
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => navigate(SHOP_ROUTE)}
                        >
                            Вернуться в магазин
                        </Button>
                    </div>
                </Form>
            </div>

            {/* Модальные окна */}
            <CreateProduct show={productVisible} onHide={() => setProductVisible(false)} />
            <CreateTag show={tagVisible} onHide={() => setTagVisible(false)} />
            <CreatePublisher show={publisherVisible} onHide={() => setPublisherVisible(false)} />
        </Container>
    );
};

export default Admin;