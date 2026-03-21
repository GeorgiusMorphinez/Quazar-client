import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { $host } from '../http';

const Support = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await $host.post('/api/support', { name, email, message });
            setSuccess(true);
            setName('');
            setEmail('');
            setMessage('');
        } catch (e) {
            setError(e.response?.data?.message || 'Ошибка отправки');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Container className="mt-5">
                <Card className="p-4 text-center">
                    <h4>Сообщение отправлено!</h4>
                    <p>Мы ответим вам в ближайшее время.</p>
                    <Button variant="primary" onClick={() => setSuccess(false)}>Написать ещё</Button>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="mt-5" style={{ maxWidth: '600px' }}>
            <Card className="p-4">
                <h3 className="text-center mb-4">Служба поддержки</h3>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ваше имя</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email для ответа</Form.Label>
                        <Form.Control
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Сообщение</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Отправка...' : 'Отправить'}
                    </Button>
                </Form>
                <hr />
                <p className="text-muted text-center">
                    Или напишите нам напрямую: <a href="mailto:quazar.support@gmail.com">quazar.support@gmail.com</a>
                </p>
            </Card>
        </Container>
    );
};

export default Support;