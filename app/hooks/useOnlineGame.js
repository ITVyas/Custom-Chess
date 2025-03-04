'use client'
import { useState, useEffect, useRef } from "react"
import { getSession } from "../utils/actions/auth";
import { exists } from "../utils/util";

export default function useOnlineGame(gameId) {
    const [game, setGame] = useState(null);
    const socket = useRef();

    async function dispatchMove(actionObject) {
        const session = await getSession();
        if(!exists(session.sessionId)) return;

        const message = {
            event: 'move',
            data: {
                action: actionObject,
                userId: session.userId
            }
        };

        socket.current.send(JSON.stringify(message));
    }

    useEffect(() => {
        socket.current = new WebSocket('ws://localhost:5001');

        socket.current.onopen = async () => {
            console.log('Socket is started');

            const session = await getSession();
            if(!exists(session.sessionId)) return;

            const connectionMessage = {
                event: 'game-connection',
                data: {
                    gameId: gameId,
                    userId: session.userId
                }
            };
            socket.current.send(JSON.stringify(connectionMessage));
        };

        socket.current.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if(message.event === 'game-connected') {
                setGame(message.data);
            } else if(message.event === 'moved') {
                console.log('Moved Data: ', message.data);

                setGame(prevGame => ({
                    ...prevGame,
                    positionGrid: prevGame.positionGrid.map((row, i) => {
                        return row.map((square, j) => {
                            const thisSquareChange = message.data.changes.find(change => {
                                return change.position.row === i + 1 && change.position.column === j + 1
                            });
                            if(thisSquareChange)
                                return thisSquareChange.square;
                            return square;
                        });
                    }),
                    movingColor: message.data.movingColor,
                    status: message.data.status,
                    possibleMoves: message.data.possibleMoves
                }));
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

    return {game, dispatchMove};
}