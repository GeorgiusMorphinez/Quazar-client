import React, { useContext, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import { Context } from '../index';
import { observer } from 'mobx-react-lite';
import { fetchOrders } from '../http/orderAPI';

const Orders = observer(() => {
    const { order } = useContext(Context);

    useEffect(() => {
        fetchOrders().then(data => order.setOrders(data));
    }, []);

    return (
        <Container className="d-flex flex-column align-items-center mt-4" style={{ height: '80vh', overflowY: 'auto' }}>
            <h2>История заказов</h2>
            {order.orders.length === 0 ? (
                <p>Нет заказов</p>
            ) : (
                order.orders.map((ord, index) => (
                    <Card key={index} className="mb-3" style={{ width: '50%', position: 'relative' }}>
                        <Card.Body>
                            <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{ord.message}</Card.Text>
                            <small style={{ position: 'absolute', top: '10px', right: '10px', color: 'gray' }}>
                                {new Date(ord.created_at).toLocaleString()}
                            </small>
                        </Card.Body>
                    </Card>
                ))
            )}
        </Container>
    );
});

export default Orders;