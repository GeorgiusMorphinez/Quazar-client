import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { $host } from '../http';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            console.log('Sending request to:', `${process.env.REACT_APP_API_URL}/api/user/forgot-password`);
            const response = await $host.post('/api/user/forgot-password', { email });
            console.log('Response:', response);
            setSuccess(true);
        } catch (e) {
            console.error('Full error object:', e);
            console.error('Response data:', e.response?.data);
            console.error('Response status:', e.response?.status);
            console.error('Response headers:', e.response?.headers);
            setError(e.response?.data?.message || e.message || 'Ошибка отправки запроса');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Card style={{ width: 400 }} className="p-4">
                    <h4 className="text-center">Проверьте почту</h4>
                    <p className="text-center mt-3">
                        Если пользователь с таким email существует, мы отправили инструкцию по сбросу пароля.
                    </p>
                    <div className="text-center mt-3">
                        <Link to="/login">Вернуться к авторизации</Link>
                    </div>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Card style={{ width: 400 }} className="p-4">
                <h4 className="text-center">Восстановление пароля</h4>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" disabled={loading} className="w-100">
                        {loading ? 'Отправка...' : 'Отправить ссылку'}
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <Link to="/login">Вспомнили пароль? Войти</Link>
                </div>
            </Card>
        </Container>
    );
};

export default ForgotPassword;