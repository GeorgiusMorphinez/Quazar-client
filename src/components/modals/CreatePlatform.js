import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { createPlatform } from '../../http/platformAPI';

const CreatePlatform = ({ show, onHide }) => {
    const [name, setName] = useState('');
    const [codeFormat, setCodeFormat] = useState('000XXX000'); // По умолчанию

    const addPlatform = async () => {
        try {
            await createPlatform({ name, code_format: codeFormat });
            onHide();
        } catch (e) {
            alert(e.response?.data?.message || 'Ошибка при добавлении платформы');
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Добавить платформу</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Название платформы</Form.Label>
                        <Form.Control
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введите название платформы"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Формат кода (например, 000XXX000)</Form.Label>
                        <Form.Control
                            value={codeFormat}
                            onChange={(e) => setCodeFormat(e.target.value)}
                            placeholder="Формат кода для подписок"
                        />
                        <Form.Text className="text-muted">
                            0 - случайная цифра (0-9), X - случайная буква (A-Z uppercase)
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>Закрыть</Button>
                <Button variant="outline-success" onClick={addPlatform}>Добавить</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreatePlatform;