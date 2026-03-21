import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-dark text-white mt-5 py-4">
            <Container>
                <Row>
                    <Col md={4}>
                        <h5>Quazar</h5>
                        <p>Цифровой магазин игр, подписок и аккаунтов.</p>
                    </Col>
                    <Col md={4}>
                        <h5>Контакты</h5>
                        <p>
                            <a href="mailto:quazar.support@gmail.com" className="text-white text-decoration-none">
                                quazar.support@gmail.com
                            </a>
                        </p>
                        <p>Служба поддержки: ежедневно 10:00–20:00</p>
                    </Col>
                    <Col md={4}>
                        <h5>Полезные ссылки</h5>
                        <ul className="list-unstyled">
                            <li><a href="/" className="text-white text-decoration-none">Главная</a></li>
                            <li><a href="/basket" className="text-white text-decoration-none">Корзина</a></li>
                            <li><a href="/orders" className="text-white text-decoration-none">Заказы</a></li>
                            <li><a href="/support" className="text-white text-decoration-none">Поддержка</a></li>
                        </ul>
                    </Col>
                </Row>
                <hr className="bg-secondary" />
                <div className="text-center">
                    <small>&copy; {currentYear} Quazar. Все права защищены.</small>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;