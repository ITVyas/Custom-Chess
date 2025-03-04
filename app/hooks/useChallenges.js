'use client';
import { useEffect, useRef, useState } from "react";
import { getSession } from "../utils/actions/auth";
import { exists } from "../utils/util";
import getUserLogin from "../utils/actions/getUserLogin";

export default function useChallenges() {
    const [challenges, setChallenges] = useState([]);
    const socket = useRef();

    console.log("Challenges: ", challenges);
    
    async function sendChallenge(challengeRawData) {
        const session = await getSession();
        if(!exists(session.sessionId)) return;

        challengeRawData.time = Date.now();
        challengeRawData.senderId = session.userId;

        const message = {
            event: 'send-challenge',
            data: challengeRawData
        };

        socket.current.send(JSON.stringify(message));
    }

    async function cancelChallenge(cancelChallengeData) {
        const session = await getSession();
        if(!exists(session.sessionId)) return;

        if(cancelChallengeData.senderId !== session.userId) return;

        const message = {
            event: 'cancel-challenge',
            data: {
                key: cancelChallengeData.key
            }
        };

        socket.current.send(JSON.stringify(message));
    }

    async function acceptChallenge(challenge) {
        const session = await getSession();
        if(!exists(session.sessionId)) return;

        const message = {
            event: 'accept-challenge',
            data: {
                time: challenge.time,
                senderId: challenge.senderId,
                acceptorId: session.userId,
                key: challenge.key
            }
        };

        socket.current.send(JSON.stringify(message));
    }

    useEffect(() => {
        socket.current = new WebSocket('ws://localhost:5000');

        socket.current.onopen = () => {
            console.log('Socket is started');
            const connectionMessage = {
                event: 'connection'
            };
            socket.current.send(JSON.stringify(connectionMessage));
        };

        socket.current.onmessage = async (event) => {
            const session = await getSession();
            if(!exists(session.sessionId)) return;

            const message = JSON.parse(event.data);
            if(message.event === 'refresh-challenges') {
                setChallenges(await Promise.all(message.challenges.map(async challenge => ({
                            ...challenge,
                            senderLogin: await getUserLogin(challenge.senderId),
                            ownChallange: challenge.senderId === session.userId
                        })
                    ))
                );
            } else if(message.event === 'add-challenges') {
                console.log(message);
                const addChallenges = await Promise.all(message.challenges.map(async challenge => ({
                        ...challenge,
                        senderLogin: await getUserLogin(challenge.senderId),
                        ownChallange: challenge.senderId === session.userId
                    })
                ));
                setChallenges(challs => [...challs, ...addChallenges]);
            } else if(message.event === 'delete-challenges') {
                setChallenges(challs => challs.filter(chall => {
                    return !message.challenges.includes(chall.key)
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

    return {challenges, sendChallenge, cancelChallenge, acceptChallenge};
}