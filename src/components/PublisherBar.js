// client/src/components/PublisherBar.js (Change to ListGroup)
import React, { useContext } from 'react';
import { observer } from "mobx-react-lite";
import { Context } from "../index";
import { ListGroup } from "react-bootstrap";

const PublisherBar = observer(() => {
    const { game } = useContext(Context);

    return (
        <ListGroup>
            <ListGroup.Item
                style={{ cursor: "pointer", fontWeight: 'bold' }}
                active={game.selectedPublisher === null}
                onClick={() => game.setSelectedPublisher(null)}
            >
                Все издатели
            </ListGroup.Item>
            {game.publishers.map(publisher =>
                <ListGroup.Item
                    style={{ cursor: "pointer" }}
                    active={publisher.id === game.selectedPublisher?.id}
                    onClick={() => game.setSelectedPublisher(publisher)}
                    key={publisher.id}
                >
                    {publisher.name}
                </ListGroup.Item>
            )}
        </ListGroup>
    );
});

export default PublisherBar;