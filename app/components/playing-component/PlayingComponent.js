import { useEffect, useState } from 'react';
import './playing-component.css';


export default function PlayingComponent({ gameComponent, gameMetaChangeEvent }) {

    const [metaData, setMetaData] = useState({ movingColor: 'white', status: {
        isPlaying: true
    } });

    useEffect(() => {
        gameMetaChangeEvent.setHandler(setMetaData);
    }, []);

    return (
        <div className="playground">
            <div className="board-part">
                {gameComponent}
            </div>
            <div className="game-meta-part">
                {metaData.status.isPlaying && (
                    <div>
                        Moving side:&nbsp;<b>{metaData.movingColor}</b>
                    </div>
                )}
                {!metaData.status.isPlaying && (
                    <div>
                        Winner:&nbsp;<b>{metaData.status.winner}</b>
                    </div>
                )}
            </div>
        </div>
    );
}