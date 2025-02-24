import { useEffect, useState } from 'react';
import './chess-board.css';
import Piece from '@/app/components/piece/Piece';
import { getPieceKey } from '@/app/create/components/create-util';

function arePositionsEqual(pos1, pos2) {
    return pos1.row === pos2.row && pos1.column === pos2.column; 
}

export default function ChessBoard({ startPosition, boardSize, boardClickHandler }) {
    const [currentPosition, setCurrentPosition] = useState(startPosition);
    const [pieces, setPieces] = useState([]);
    
    useEffect(() => {
        setCurrentPosition(startPosition);
    }, [startPosition]);
    
    useEffect(() => {
        setPieces(currentPosition.map(piece => {
            const pieceKey = getPieceKey(piece);
            const piecePositionKey = String(pieceKey) + piece.position.row + piece.position.column;
            return (
                <Piece key={piecePositionKey}
                    image={piece[`${piece.color}ImagePath`]}
                    startPosition={piece.position}
                    boardSize={boardSize}
                />
            );
        }));
    }, [currentPosition]);
    

    function placePiece(pieceObj) {
        const pieceAtPositionIndex = currentPosition.findIndex(currentPiece => arePositionsEqual(currentPiece.position, pieceObj.position));
        const newPosition = [...currentPosition];
        if(pieceAtPositionIndex !== -1) {
            if(getPieceKey(newPosition[pieceAtPositionIndex]) === getPieceKey(pieceObj) && newPosition[pieceAtPositionIndex].color === pieceObj.color)
                newPosition.splice(pieceAtPositionIndex, 1);
            else
                newPosition.splice(pieceAtPositionIndex, 1, pieceObj);
        } else {
            newPosition.push(pieceObj);
        }
        setCurrentPosition(newPosition);
    }
    
    return (
        <>
            <div onClick={(e) => {
                    const callbackAcceptor = boardClickHandler(e);
                    if(callbackAcceptor) return callbackAcceptor(placePiece);
                    return;
                }} 
                className="chess-board standard cb-12 center top-indent">
                {pieces}
            </div>
        </>
    );
}