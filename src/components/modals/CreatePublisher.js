import React from 'react';
import { Button, Form, Modal } from "react-bootstrap";
import { $authHost } from "../../http";

const CreatePublisher = ({show, onHide}) => {
    const [value, setValue] = React.useState('');

    const addPublisher = async () => {
        try {
            console.log('Токен при отправке:', localStorage.getItem('token'));
            // Исправленный путь
            const response = await $authHost.post('/api/publisher', {
                name: value.trim()
            });
            console.log('Ответ сервера:', response.data);
            onHide();
        } catch (e) {
            console.error('Полная ошибка:', {
                message: e.message,
                response: e.response?.data,
                config: e.config
            });
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Добавить издателя
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Control
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder={"Введите название типа"}
                    />
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={onHide}>Закрыть</Button>
                <Button variant="outline-success" onClick={addPublisher}>Добавить</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreatePublisher;
