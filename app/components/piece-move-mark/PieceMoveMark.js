const mapMoveTypeOnlyAndClass = {
    'move' : ' move-only',
    'take' : ' take-only'
};

export default function PieceMoveMark({ position, boardSize, onClick, invertPosition, moveTypeOnly=null, isDragPieceOver=false }) {
    const htmlRow = invertPosition ? position.row - 1 : boardSize.rows - position.row;
    const htmlCol = invertPosition ? boardSize.rows - position.column : position.column - 1;
    
    
    return (
        <div onClick={onClick} className={
            "piece-move-mark" + 
            (moveTypeOnly ? mapMoveTypeOnlyAndClass[moveTypeOnly] : '') +
            (isDragPieceOver ? ' hovered' : '')
        } style={{
            top: `${100*htmlRow/boardSize.rows}%`,
            left: `${100*htmlCol/boardSize.columns}%`,
            width: `${100/boardSize.rows}%`
        }}></div>
    );
}