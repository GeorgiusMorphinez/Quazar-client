import React, {useContext} from 'react';
import {observer} from "mobx-react-lite";
import {Context} from "../index";
import {ListGroup} from "react-bootstrap";

const GenreBar = observer( () => {
    const { game } = useContext(Context); // Используем game контекст вместо product

    return (
        <ListGroup>
            <ListGroup.Item
                style={{cursor: "pointer", fontWeight: 'bold'}}
                active={game.selectedGenre === null}
                onClick={() => game.setSelectedGenre(null)}
            >
                Все жанры
            </ListGroup.Item>

            {game.genres.map(genre =>
                <ListGroup.Item
                    style={{cursor: "pointer"}}
                    active={genre.id === game.selectedGenre?.id}
                    onClick={() => game.setSelectedGenre(genre)}
                    key={genre.id}
                >
                    {genre.name}
                </ListGroup.Item>
            )}
        </ListGroup>
    );
});

export default GenreBar;