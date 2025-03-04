import '@/app/components/chess-board/chess-board.css';
import Piece from '@/app/components/piece/Piece';
import { Move, addMoveToPosition } from '@/chess-logic/piece-logic-module';
import PieceMoveMark from '../piece-move-mark/PieceMoveMark';

function createPossibleMoveElement(position, boardSize, moveType=[]) {
    let moveTypeOnly = null;

    if(Object.entries(moveType).reduce((acc, val) => (val[1]? acc + 1: acc), 0) === 1) {
        if(moveType.take) moveTypeOnly = 'take';
        else if(moveType.move) moveTypeOnly = 'move';
    }

    return (
        <PieceMoveMark 
            key={'move-mark-'+position.row+'-'+position.column} 
            position={position} 
            boardSize={boardSize}
            moveTypeOnly={moveTypeOnly}
        />
    );
}

function emptyBoardSimulate(boardSize) {
    return {
        get: (position) => {
            if(position.row < 1 || position.row > boardSize.rows) return null;
            if(position.column < 1 || position.column > boardSize.columns) return null;
            return {piece: null};
        }
    };
}

function createAllPossibleMoveMarksFromLogic(logics, position, boardSize) {
    return logics.map(logic => {
        if(logic.type !== 'move') return [];
        if(!logic.visible) return [];
        logic = logic.params;
        const moveLogic = new Move(logic.movePattern, logic.rotate, logic.doRepeatPattern, {move: true, take: true}, logic.doesJumpOver);
        moveLogic.initAllMoveMasks({boardSize: boardSize});
        const board = emptyBoardSimulate(boardSize);
        return moveLogic
            .applyMasksOnBoard(board, {position: position, color: 'white'})
            .map(move => addMoveToPosition(position, move))
            .map(position => createPossibleMoveElement(position, boardSize, logic.moveType));
    }).flat();
}

export default function SinglePieceChessBoard({ boardSize, piece, position }) {
    const pieceElement = piece ? (
        <Piece boardSize={boardSize} 
                piece={{...piece, position: position, color: 'white'}} />
    ) : null;

    const moveMarks = piece ? createAllPossibleMoveMarksFromLogic(piece.logic, position, boardSize) : [];

    return (
        <>
            <div onClick={(e) => {}} 
                className="chess-board standard cb-12 center top-indent">
                {pieceElement}
                {moveMarks}
            </div>
        </>
    );
}