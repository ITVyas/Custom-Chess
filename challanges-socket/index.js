const ws = require('ws');
const redis = require('redis');

const createClient = redis.createClient;

const wss = new ws.Server({ port: 5000 }, () => {
    console.log('Challenge lobby websocket is running on port 5000');
});

const chessGamesWS = new WebSocket('ws://localhost:5001');

chessGamesWS.onerror = () => {
    console.log('Error occured during connecting Chess Games WebSocket');
};

chessGamesWS.onclose = () => {
    console.log('Chess Games WebSocket closed.');
};


const redisClient = createClient({
    socket: {
        port: 6379,
        host: '127.0.0.1'
    }
});

async function getChallenges() {
    const scanResult = await redisClient.scan('0', { MATCH: 'games-lobby:*' });
    return await Promise.all(scanResult.keys.map(async key => {
        const challenge = JSON.parse(await redisClient.get(key));
        challenge.key = `games-lobby:${challenge.time}-${challenge.senderId}`;
        return challenge;
    }));
}

async function addNewChallenge(newChallenge) {
    await redisClient.set(`games-lobby:${newChallenge.time}-${newChallenge.senderId}`, JSON.stringify(newChallenge));
    return {
        ...newChallenge,
        key: `games-lobby:${newChallenge.time}-${newChallenge.senderId}`
    };
}

async function cancelChallenge(cancelChallengeData) {
    await redisClient.del(cancelChallengeData.key);
}

async function acceptChallenge(acceptChallengeData) {
    console.log('accept challenge');
    const acceptedChallengeRaw = await redisClient.get(acceptChallengeData.key);
    
    console.log('accepted challenge raw: ', acceptChallengeData, acceptedChallengeRaw);
    if(acceptedChallengeRaw === null) return { success: false };

    const acceptedChallenge = JSON.parse(acceptedChallengeRaw);

    const players = [acceptChallengeData.senderId, acceptChallengeData.acceptorId];
    const whiteIndex = Math.floor(Math.random()*2);

    chessGamesWS.send(JSON.stringify({
        event: 'create-game',
        data: {
            position: acceptedChallenge.position,
            whitePlayerId: players[whiteIndex],
            blackPlayerId: players[(whiteIndex + 1) % 2]
        }
    }));

    const cancelledChallenges = [];

    await Promise.all([
        redisClient.scan('0', { MATCH: `games-lobby:*-${acceptChallengeData.senderId}`}).then(async scanResult => {
            await Promise.all(
                scanResult.keys.map(async key => {
                    await redisClient.del(key); 
                    cancelledChallenges.push(key);
                })
            )
        }),

        redisClient.scan('0', { MATCH: `games-lobby:*-${acceptChallengeData.acceptorId}`}).then(async scanResult => {
            await Promise.all(
                scanResult.keys.map(async key => {
                    await redisClient.del(key); 
                    cancelledChallenges.push(key);
                })
            )
        })
    ]);

    return { success: true, cancelledChallenges };
}

redisClient.on('error', err => console.log('Redis Client Error', err));

(async () => {
    await redisClient.connect();

    wss.on('connection', function(ws) {
        ws.on('message', function(message) {
            message = JSON.parse(message);
            switch(message.event) {
                case 'connection':
                    (async () => {
                        const challenges = await getChallenges();
                        ws.send(JSON.stringify({ event: 'refresh-challenges', challenges }));
                    })();
                    break;
                case 'send-challenge':
                    addNewChallenge(message.data).then(async (newChallenge) => {
                        await broadcastMsg({
                            event: 'add-challenges',
                            challenges: [newChallenge]
                        });
                    }); break;
                case 'cancel-challenge': 
                    cancelChallenge(message.data).then(async () => {
                        await broadcastMsg({
                            event: 'delete-challenges',
                            challenges: [message.data.key]
                        });
                    }); break;
                case 'accept-challenge':
                    acceptChallenge(message.data).then(result => {
                        console.log('ACCEPT RESULT: ', result);
                        ws.send(JSON.stringify({
                            event: 'accept-challenge-result',
                            data: result
                        }));

                        if(result.success) {
                            broadcastMsg({
                                event: 'delete-challenges',
                                challenges: result.cancelledChallenges
                            });
                        }
                    });
                    break;
            }
        });

        async function broadcastMsg(msg) {
            wss.clients.forEach(client => {
                client.send(JSON.stringify(msg));
            });
        }
    });
})();