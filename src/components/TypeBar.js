// client/src/components/TypeBar.js
import React, { useContext } from 'react';
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { ListGroup } from "react-bootstrap";

const TypeBar = observer(() => {
    const { product } = useContext(Context);

    const getTypeIcon = (typeId) => {
        switch (typeId) {
            case 1: return '🎮'; // Игра
            case 2: return '🔄'; // Подписка
            case 3: return '👤'; // Аккаунт
            case 4: return '🖥️'; // Приложение
            default: return '📦';
        }
    };

    return (
        <ListGroup>
            <ListGroup.Item
                style={{ cursor: "pointer", fontWeight: 'bold' }}
                active={product.selectedType === null}
                onClick={() => product.setSelectedType(null)}
                className="d-flex align-items-center"
            >
                <span className="me-2">📦</span>
                Все товары
            </ListGroup.Item>

            {product.types
                .filter(type => type.id !== 3) // исключаем аккаунты из общего каталога
                .map(type => (
                    <ListGroup.Item
                        style={{ cursor: "pointer" }}
                        active={type.id === product.selectedType?.id}
                        onClick={() => product.setSelectedType(type)}
                        key={type.id}
                        className="d-flex align-items-center"
                    >
                        <span className="me-2">{getTypeIcon(type.id)}</span>
                        {type.name}
                    </ListGroup.Item>
                ))}
        </ListGroup>
    );
});

export default TypeBar;