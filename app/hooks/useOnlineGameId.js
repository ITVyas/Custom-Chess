'use client';

import { useEffect, useState, useRef } from "react";
import { getSession } from "../utils/actions/auth";
import { exists } from "../utils/util";

export default function useOnlineGameId() {
    const [gameId, setGameId] = useState(null);
    const socket = useRef();

    console.log('Game ID: ', gameId);
    
    useEffect(() => {
        socket.current = new WebSocket('ws://localhost:5001');
        
        socket.current.onopen = async () => {
            console.log('Socket is started');

            const session = await getSession();
            if(!exists(session.sessionId)) return;

            const connectionMessage = {
                event: 'current-game-id',
                data: {
                    userId: session.userId
                }
            };
            socket.current.send(JSON.stringify(connectionMessage));
        };

        socket.current.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log('Socket Game: ', event.data);
            if(message.event === 'current-game-id') {
                console.log('Socket message GameID: ', message.data.gameId);
                setGameId(message.data.gameId);
            }
        };

        socket.current.onerror = () => {
            console.log('Socket for challenges has some error.');
        };
        
        socket.current.onclose = () => {
            console.log('Socket for challenges is closed.');
        };

        return () => {
            socket.current.close(1000, 'Cleaning function');
            socket.current = null;
        };
    }, []);

    return gameId;
}