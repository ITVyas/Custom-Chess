import { WebSocketServer } from 'ws';
import { GameManager } from '../chess-logic/GameManager.js';
import { BoardState } from '../chess-logic/BoardState.js';
import { v4 as uuidv4 } from 'uuid';

const wss = new WebSocketServer({ port: 5001 }, () => {
    console.log('Chess games websocket is running on port 5001');
});


const games = {};

function createGame(gameCreationData) {
    console.log('CREATE GAME');
    if(gameCreationData.whitePlayerId === gameCreationData.blackPlayerId) {
        return { success: false };
    }

    const gameManager = new GameManager(
        new BoardState(
            gameCreationData.position.boardSize, gameCreationData.position.pieces, gameCreationData.position.pieceBases
        )
    );

    const game = {
        manager: gameManager,
        playerIds: {
            white: gameCreationData.whitePlayerId,
            black: gameCreationData.blackPlayerId
        }
    };

    const gameId = uuidv4();
    games[gameId] = game;

    return {
        success: true,
        gameId: gameId
    };
}


function getGameByConnectionData(connectionData) {
    for(const gameId in games) {
        const game = games[gameId];
        if(gameId === connectionData.gameId)
            return {
                game,
                gameId
            };
    }

    return null;
}

function createConnectionResponseDataFromGame(game, playerId) {
    const playerColor = game.playerIds.white === playerId ? 'white' : 'black';
    const possibleMoves = playerColor === game.manager.getMovingColor() ? game.manager.getAllPossibleMoves() : [];
    return {
        playerColor,
        positionGrid: game.manager.getPositionAsGrid(),
        pieceBases: game.manager.boardState.pieceBases.keyPiecePrototype,
        status: game.manager.getGameStatus(),
        movingColor: game.manager.getMovingColor(),
        possibleMoves
    };
}

function getUserCurrentGameId(userData) {
    for(const gameId in games) {
        const game = games[gameId];
        if([game.playerIds.white, game.playerIds.black].includes(userData.userId))
            return gameId;
    }

    return null;
}

function dispatchMove(game, dispatchData) {
    if(![game.playerIds.white, game.playerIds.black].includes(dispatchData.userId)) 
        return { done: false };
    const userColor = game.playerIds.white === dispatchData.userId ? 'white' : 'black';
    if(game.manager.getMovingColor() !== userColor) return { done: false };

    const result = game.manager.dispatchMove(dispatchData.action);
    if(!result.done) return result;

    result.changes = game.manager.getLastMoveChanges();
    result.movingColor = game.manager.getMovingColor();
    result.status = game.manager.getGameStatus();
    result.possibleMoves = {
        [game.playerIds.white] : result.movingColor === 'white' ? game.manager.getAllPossibleMoves() : [],
        [game.playerIds.black] : result.movingColor === 'black' ? game.manager.getAllPossibleMoves() : [],
    };
    return result;
}

function deleteGame(gameId) {
    delete games[gameId];
}

wss.on('connection', function(ws) {
    let game = null;

    ws.on('message', function(message) {
        message = JSON.parse(message);

        switch(message.event) {
            case 'current-game-id':
                ws.userId = message.data.userId;
                ws.send(JSON.stringify({
                    event: 'current-game-id',
                    data: {
                        gameId: getUserCurrentGameId(message.data)
                    }
                }));
                break;
            case 'create-game': 
                const result = createGame(message.data);
                ws.send(JSON.stringify({ event: 'game-created', data: result }));

                console.log('IDs: ', message.data.whitePlayerId, message.data.blackPlayerId);
                if(result.success) {
                    broadcastMsgForSpecificUsers(JSON.stringify({
                        event: 'current-game-id',
                        data: {
                            gameId: result.gameId
                        }
                    }), [message.data.whitePlayerId, message.data.blackPlayerId]);
                }
                
                break;
            case 'game-connection':
                (() => {
                    const result = getGameByConnectionData(message.data);
                    game = result.game;
                    ws.id = result.gameId;
                    ws.userId = message.data.userId;

                    ws.send(JSON.stringify({
                        event: 'game-connected',
                        data: createConnectionResponseDataFromGame(game, message.data.userId)
                    }));
                })();
                break;
            case 'move':
                if(game === null) return;
                (() => {
                    const result = dispatchMove(game, message.data);
                    if(!result.done) return;

                    [game.playerIds.white, game.playerIds.black].forEach(userId => {
                        sendForClientsWithUserIdAndGameId(
                            JSON.stringify({
                                event: 'moved',
                                data: {
                                    movingColor: result.movingColor,
                                    possibleMoves: result.possibleMoves[userId],
                                    changes: result.changes,
                                    status: result.status
                                }
                            }),
                            userId,
                            ws.id
                        );
                    });

                    if(!result.status.isPlaying) {
                        deleteGame(ws.id);
                        closeForSpecificGame(ws.id);
                    }
                })();
                break;
            case 'finish-game': break;
        }
    });
});

function broadcastMsgForSpecificGame(msg, gameId) {
    wss.clients.forEach(client => {
        if(client.id === gameId)
            client.send(msg);
    });
}

function sendForClientsWithUserIdAndGameId(msg, userId, gameId) {
    wss.clients.forEach(client => {
        if(client.id === gameId && client.userId === userId)
            client.send(msg);
    });
}

function broadcastMsgForSpecificUsers(msg, userIds) {
    console.log('Spec Users broadcast', userIds);
    wss.clients.forEach(client => {
        console.log('ClientID: ', client.userId);
        if(userIds.includes(client.userId))
            client.send(msg);
    });
}

function closeForSpecificGame(gameId) {
    wss.clients.forEach(client => {
        if(client.id === gameId)
            client.close();
    });
}