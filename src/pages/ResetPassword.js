import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { $host } from '../http';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await $host.post('/api/user/reset-password', { token, newPassword: password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка сброса пароля');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Card style={{ width: 400 }} className="p-4">
                    <h4 className="text-center">Пароль успешно изменён</h4>
                    <p className="text-center mt-3">Вы будете перенаправлены на страницу входа...</p>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
            <Card style={{ width: 400 }} className="p-4">
                <h4 className="text-center">Установите новый пароль</h4>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group className="mb-3">
                        <Form.Label>Новый пароль</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Подтвердите пароль</Form.Label>
                        <Form.Control
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" disabled={loading} className="w-100">
                        {loading ? 'Сохранение...' : 'Сохранить пароль'}
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <Link to="/login">Вернуться к авторизации</Link>
                </div>
            </Card>
        </Container>
    );
};

export default ResetPassword;