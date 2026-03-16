import React, { useContext } from 'react';
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { ListGroup } from "react-bootstrap";

const GameBar = observer(() => {
    const { game } = useContext(Context);

    return (
        <ListGroup>
            <ListGroup.Item
                style={{ cursor: "pointer", fontWeight: 'bold' }}
                active={game.selectedGame === null}
                onClick={() => game.setSelectedGame(null)}
            >
                Все игры
            </ListGroup.Item>
            {game.onlineGames.map(g => (
                <ListGroup.Item
                    style={{ cursor: "pointer" }}
                    active={g.id === game.selectedGame?.id}
                    onClick={() => game.setSelectedGame(g)}
                    key={g.id}
                >
                    {g.name}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
});

export default GameBar;