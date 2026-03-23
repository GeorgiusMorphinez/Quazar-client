import React, { useContext } from 'react';
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { ListGroup } from "react-bootstrap";

const TypeBar = observer(() => {
    const { product } = useContext(Context);

    const getTypeIcon = (typeId) => {
        switch (typeId) {
            case 1: return '🎮'; // Игры
            case 2: return '🔄'; // Подписки
            case 3: return '👤'; // Аккаунты
            case 4: return '🖥️'; // Приложения
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

            {product.types.map(type => (
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