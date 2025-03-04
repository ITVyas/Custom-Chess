import { useEffect } from "react";

export default function FloatPiece({ ref, piece, boardSize, startBoardCoords }) {

    useEffect(() => {
        ref.current.style.top = `${startBoardCoords.y}px`;
        ref.current.style.left = `${startBoardCoords.x}px`;
    }, []);

    return (
        <div ref={ref} className="chess-piece float" style={{
            backgroundImage: `url("${piece[`${piece.color}ImagePath`]}")`,
            width: `${100/boardSize.rows}%`
        }}></div>
    );
}