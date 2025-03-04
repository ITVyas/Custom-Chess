import { useRef } from "react";

export default function Promotion({ boardSize, pieces, position, onCancel, onPromotion }) {

    const mainRef = useRef(null);
    
    const pieceElements = pieces.map(piece => {
        return (<div key={'promotion-' + piece.key} className="promotion-piece" style={{
            width: '100%',
            aspectRatio: '1 / 1',
            backgroundImage: `url("${piece.img}")`
        }}
        onClick={() => {
            onPromotion(piece.key);
            onCancel();
        }}
        ></div>);
    });

    function clickHandler(e) {
        if(e.target === mainRef.current) {
            onCancel();
        } 
    }

    return (
        <div ref={mainRef} onClick={clickHandler} className="promotion-container">
            <span style={{
                width: `calc(100% / ${boardSize.columns})`,
                top: `${100*(boardSize.rows - position.row)/boardSize.rows}%`,
                left: `${100*(position.column - 1)/boardSize.columns}%`,
            }} className="promotion-pieces-container">
            {pieceElements}
            </span>
        </div>
    );
}