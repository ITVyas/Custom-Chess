export default function Piece({ piece, boardSize, isDragging, isSelected, isTakeable, invertPosition, isDragPieceOver=false, onClick=() => {} }) {
    const htmlRow = invertPosition ? piece.position.row - 1 : boardSize.rows - piece.position.row;
    const htmlCol = invertPosition ? boardSize.rows - piece.position.column : piece.position.column - 1;
    
    return (
        <div onClick={onClick} className={
            "chess-piece" + 
                (isDragging ? ' dragging' : '') + 
                (isSelected ? ' selected' : '') +
                (isTakeable ? ' takeable' : '') +
                (isDragPieceOver ? ' hovered' : '')
            } style={{
            backgroundImage: (`url("${piece[`${piece.color}ImagePath`]}")` + (isTakeable ? ', radial-gradient(circle at center, transparent 75%, rgba(0, 0, 0, 0.3) 100%)' : '')),
            top: `${100*htmlRow/boardSize.rows}%`,
            left: `${100*htmlCol/boardSize.columns}%`,
            width: `${100/boardSize.rows}%`
        }}></div>
    );
}

