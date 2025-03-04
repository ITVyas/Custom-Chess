import useChallenges from '@/app/hooks/useChallenges';
import './challenges-lobby.css';
import { useRef, useState } from 'react';
import { getPositionKey } from '@/chess-logic/utils';

export default function ChallengesLobby({ positions }) {

    const {challenges, sendChallenge, cancelChallenge, acceptChallenge} = useChallenges();
    const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
    const positionSelect = useRef(null);

     const positionOptionEls = positions ? positions.map(position => (
        <option key={getPositionKey(position)} value={getPositionKey(position)}>{position.name}</option>
    )) : null;

    const challangeEls = challenges.map(challenge => {
        const date = new Date(challenge.time);
        console.log(challenge);
        return (
            <div key={String(challenge.time) + '-' + challenge.senderId} className="challange">
                <span>{challenge.senderLogin}</span>
                <span>{
                `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
                }</span>
                <span>{challenge.position.hasOwnProperty('id') ? 'custom' : challenge.position.name}</span>
                {challenge.ownChallange ? (
                    <button onClick={() => {
                        cancelChallenge({time: challenge.time, senderId: challenge.senderId, key: challenge.key});
                    }} className='btn cancel-own-challange'>Cancel</button>
                ) : (
                    <button onClick={() => {
                        acceptChallenge(challenge);
                    }} className='btn accept-challange'>Accept</button>
                )}
            </div>
        );
    });

    return (
        <>
        <h1 style={{ textIndent: 20 }}>Challenges Lobby</h1>
        {!isCreatingChallenge && <button onClick={() => setIsCreatingChallenge(true)} className='btn create-challenge'>Create Challenge</button>}
        {isCreatingChallenge && (
            <div className='new-challenge-form'>
                <span style={{ marginLeft: 10 }}>Position: </span>
                <select ref={positionSelect} id="select-position">
                    {positionOptionEls}
                </select>
                <button onClick={async () => {
                    await sendChallenge({ position: positions.find(position => String(getPositionKey(position)) === positionSelect.current.value) });
                    setIsCreatingChallenge(false);
                }} className="btn send-challenge">Send</button>
                <button onClick={() => setIsCreatingChallenge(false)} className="btn cancel-challenge">Cancel</button>
            </div>
        )}
        <div className="challanges-lobby">
            <div className="challanges-header">
                <b>Player</b>
                <b>Time</b>
                <b>Position</b>
            </div>
            <div className="challanges-container">
                {challangeEls}
            </div>
        </div>
        </>
        
    );
}