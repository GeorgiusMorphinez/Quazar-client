// client/src/components/CheckoutForm.js
const CheckoutForm = ({ total, items }) => {
    const [cardNumber, setCardNumber] = useState(['', '', '', '']);
    const [quantity, setQuantity] = useState(1);

    const handleSubmit = async () => {
        // Проверка карты: 4 группы по 4 цифры
        if (cardNumber.some(group => group.length !== 4)) {
            alert('Неверный номер карты');
            return;
        }

        // Отправка заказа на сервер
        await $authHost.post('/api/orders', {
            items,
            total: total * quantity,
            cardNumber: cardNumber.join('')
        });

        // Показ успешного сообщения и генерация ключа
    };

    const validateCard = (parts) => {
        return parts.every(part => /^\d{4}$/.test(part));
    };

// Использовать перед отправкой
    if (!validateCard(cardParts)) {
        alert('Номер карты должен состоять из 4 групп по 4 цифры');
        return;
    }

    return (
        <Form>
            <Form.Group>
                <Form.Label>Количество</Form.Label>
                <Form.Control
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    min="1"
                />
            </Form.Group>

            <Form.Group>
                <Form.Label>Номер карты</Form.Label>
                <div className="d-flex">
                    {[...Array(4)].map((_, i) => (
                        <Form.Control
                            key={i}
                            value={cardNumber[i]}
                            onChange={e => {
                                const newCard = [...cardNumber];
                                newCard[i] = e.target.value.slice(0, 4);
                                setCardNumber(newCard);
                            }}
                            maxLength={4}
                            className="me-2"
                        />
                    ))}
                </div>
            </Form.Group>

            <Button onClick={handleSubmit}>Купить</Button>
        </Form>
    );
};