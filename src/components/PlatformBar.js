import React, { useContext } from 'react';
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { ListGroup } from "react-bootstrap";

const PlatformBar = observer(() => {
    const { game } = useContext(Context);  // Assume platforms in game store

    return (
        <ListGroup>
            <ListGroup.Item
                style={{ cursor: "pointer", fontWeight: 'bold' }}
                active={game.selectedPlatform === null}
                onClick={() => game.setSelectedPlatform(null)}
            >
                Все платформы
            </ListGroup.Item>
            {game.platforms.map(platform =>
                <ListGroup.Item
                    style={{ cursor: "pointer" }}
                    active={platform.id === game.selectedPlatform?.id}
                    onClick={() => game.setSelectedPlatform(platform)}
                    key={platform.id}
                >
                    {platform.name}
                </ListGroup.Item>
            )}
        </ListGroup>
    );
});

export default PlatformBar;