import React from 'react';
import { Button, Form, Modal } from "react-bootstrap";
import { $authHost } from "../../http";
import { observer } from "mobx-react-lite";

const CreateTag = ({ show, onHide }) => {
    const [value, setValue] = React.useState('');

    const addTag = async () => {
        try {
            // Исправленный путь
            await $authHost.post('/api/tag', { name: value });
            onHide();
        } catch (e) {
            console.error('Ошибка:', e.response?.data || e.message);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Добавить тэг</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Control
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder="Введите название тэга"
                    />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>Закрыть</Button>
                <Button variant="outline-success" onClick={addTag}>Добавить</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default observer(CreateTag);