import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button, Alert } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

const Download = () => {
    const [isInWebView, setIsInWebView] = useState(false);

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('quazar') || ua.includes('webview') || ua.includes('wv')) {
            setIsInWebView(true);
        }
    }, []);

    const windowsUrl = 'https://github.com/GeorgiusMorphinez/Quazar-launcher/releases/download/v1.0.0/QuazarLauncher-x86_64-1.0.0+1-Installer.exe';
    const androidUrl = 'https://github.com/GeorgiusMorphinez/Quazar-launcher/releases/download/v1.0.0/app-release.apk';

    if (isInWebView) {
        return (
            <Container className="mt-5 text-center">
                <Alert variant="warning">
                    <h4>Скачивание лаунчера недоступно из самого лаунчера.</h4>
                    <p>Пожалуйста, используйте веб-версию сайта в браузере для загрузки.</p>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Скачать лаунчер Quazar</h1>
            <Row>
                <Col md={6} className="mb-4">
                    <Card className="h-100 text-center">
                        <Card.Body>
                            <Card.Title>Windows</Card.Title>
                            <Card.Text>
                                Скачайте установщик для Windows и запустите его.
                            </Card.Text>
                            <Button variant="primary" href={windowsUrl} download size="lg">
                                Скачать .exe
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} className="mb-4">
                    <Card className="h-100 text-center">
                        <Card.Body>
                            <Card.Title>Android</Card.Title>
                            <Card.Text>
                                Отсканируйте QR-код или нажмите кнопку, чтобы скачать APK.
                            </Card.Text>
                            <div className="d-flex justify-content-center mb-3">
                                <QRCodeSVG value={androidUrl} size={150} />
                            </div>
                            <Button variant="success" href={androidUrl} download size="lg">
                                Скачать APK
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Download;