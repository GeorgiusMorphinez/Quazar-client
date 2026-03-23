import React, {useContext} from 'react';
import {observer} from "mobx-react-lite";
import {Context} from "../index";
import {ListGroup} from "react-bootstrap";

const TagBar = observer( () => {
    const { game } = useContext(Context); // Используем game контекст вместо product

    return (
        <ListGroup>
            <ListGroup.Item
                style={{cursor: "pointer", fontWeight: 'bold'}}
                active={game.selectedTag === null}
                onClick={() => game.setSelectedTag(null)}
            >
                Все тэги
            </ListGroup.Item>

            {game.tags.map(tag =>
                <ListGroup.Item
                    style={{cursor: "pointer"}}
                    active={tag.id === game.selectedTag?.id}
                    onClick={() => game.setSelectedTag(tag)}
                    key={tag.id}
                >
                    {tag.name}
                </ListGroup.Item>
            )}
        </ListGroup>
    );
});

export default TagBar;