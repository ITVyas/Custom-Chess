import '@/app/components/chess-board/chess-board.css';
import Piece from '@/app/components/piece/Piece';
import { Move, addMoveToPosition } from '@/app/components/piece/piece-logic';

function createPossibleMoveElement(position, boardSize, moveType=[]) {
    let classes = 'possible-move-mark';

    if(Object.entries(moveType).reduce((acc, val) => (val[1]? acc + 1: acc), 0) === 1) {
        if(moveType.take) classes += ' take-only';
        else if(moveType.move) classes += ' move-only';
    }

    return (
        <div key={'move-mark-'+position.row+'-'+position.column} style={{
            gridRow: boardSize.rows - position.row + 1,
            gridColumn: position.column
        }} className={'possible-move-mark-container'}>
            <div className={classes}></div>
        </div>
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
        const moveLogic = new Move(logic.movePattern, logic.rotate, logic.doRepeatPattern, logic.moveType, logic.doesJumpOver);
        moveLogic.initAllMoveMasks({boardSize: boardSize});
        const emptyBoard = emptyBoardSimulate(boardSize);
        return moveLogic.applyMasksOnBoard(emptyBoard, {position: position, color: 'white'})
            .map(move => addMoveToPosition(position, move)).map(position => createPossibleMoveElement(position, boardSize, logic.moveType));
    }).flat();
}

export default function SinglePieceChessBoard({ boardSize, piece, position }) {

    const pieceElement = piece ? (
        <Piece boardSize={boardSize} 
            startPosition={position}
            image={piece.whiteImagePath} />
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