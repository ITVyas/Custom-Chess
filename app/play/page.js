'use client';
import { useRef, useState } from 'react';
import './play.css';
import LocalPlayForm from './components/local-play-form/LocalPlayForm';
import { getPositionKey } from '@/chess-logic/utils';
import LocalGame from '../components/local-game/LocalGame';
import usePositions from '../hooks/usePositions';
import PlayingComponent from '../components/playing-component/PlayingComponent';
import ChallengesLobby from '../components/challanges-lobby/ChallengesLobby';
import useOnlineGameId from '../hooks/useOnlineGameId';
import { exists } from '../utils/util';
import OnlineGame from '../components/online-game/OnlineGame';

function createGameMetaChangeEvent() {
    let handler = null;
    return {
        setHandler(f) {
            handler = f;
        },

        notify(metaData) {
            if(handler) handler(metaData);
        }
    };
}

export default function PlayPage() {

    const gameMetaChangeEvent = useRef(createGameMetaChangeEvent());

    const [playStatus, setPlayStatus] = useState(null);
    const [viewStatus, setViewStatus] = useState(null);
    const { positions } = usePositions();
    const gameId = useOnlineGameId();

    console.log("Play/View statuses: ", playStatus, viewStatus);

    const currentGameParams = useRef(null);

    function startLocalGame(gameParams) {
        const positionIndex =  positions.findIndex(pos => String(getPositionKey(pos)) === gameParams.positionKey);
        if(positionIndex !== -1) {
            currentGameParams.current = {
                position: positions[positionIndex],
                gameType: 'local'
            }; 
            setViewStatus('game');
        }
    }

    if(!(playStatus === 'online' && viewStatus === 'game') && exists(gameId)) {
        return (
            <div className='connect-to-game'>
                <div>The online game is going on</div>
                <button className='btn' onClick={() => {
                    setPlayStatus('online');
                    setViewStatus('game');
                }}>Connect</button>
            </div>
        );
    }

    if(playStatus === null) {
        return (
            <div className='play-global-mode-picking'>
                <button onClick={() => {
                    setPlayStatus('local');
                    setViewStatus('form/lobby');
                }}>
                    Play locally
                </button>
                <button onClick={() => {
                    setPlayStatus('online');
                    setViewStatus('form/lobby');
                }}>
                    Play online
                </button>
            </div>
        );
    }
    
    if(playStatus === 'local') {
        if(viewStatus === 'form/lobby') {
            console.log('Drawing from local');
            return (<LocalPlayForm positions={positions} onClose={() => setPlayStatus(null)} onSubmit={startLocalGame} />);
        } else if(viewStatus === 'game') {
            console.log('Drawing game local');
            return <PlayingComponent gameMetaChangeEvent={gameMetaChangeEvent.current} gameComponent={(
                <LocalGame gameParams={currentGameParams.current} gameMetaChangeEvent={gameMetaChangeEvent.current} />
            )} />;
        }
    }
    
    if(playStatus === 'online') {
        if(viewStatus === 'form/lobby') {
            return <ChallengesLobby positions={positions} />
        } else if(viewStatus === 'game') {
            return <PlayingComponent gameMetaChangeEvent={gameMetaChangeEvent.current} gameComponent={(
                <OnlineGame gameId={gameId} gameMetaChangeEvent={gameMetaChangeEvent.current} />
            )} />;
        }
    }
}