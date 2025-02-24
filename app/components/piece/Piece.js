
export default function Piece({ image, movingLogic, startPosition, boardSize }) {
    return (
        <div className="chess-piece" style={{
            backgroundImage: `url("${image}")`,
            gridRow: boardSize.rows - startPosition.row + 1,
            gridColumn: startPosition.column
        }}></div>
    );
}