import { exists } from '@/app/utils/util';
import '../create.css';
import { useState, useContext } from "react";
import { PiecePositions } from "@/app/components/chess-board/place-pieces";
import { PiecesContext } from "@/app/context/PieceContext";
import ChessBoard from '@/app/components/chess-board/ChessBoard';
import { deepCopy } from '@/app/utils/util';
import { getPieceKey } from './create-util';

function getAllUserPositionStates() {
    const defaultBoardStates = [{name: "Empty", state: []}, {name: "Standard", state: PiecePositions.getStandard()}];
    const customBoardStates = [];
    return {
        default: defaultBoardStates,
        custom: customBoardStates
    };
}


export default function CreatePosition() {
    const [boardStartPosition, setBoardStartPosition] = useState([]);
    const [piecePanelPieckedKey, setPiecePanelPickedKey] = useState(null);
    const [piecesColor, setPiecesColor] = useState('white');
    const pieces = useContext(PiecesContext);

    const boardSize = {rows: 8, columns: 8};

    function handlePickPosition(position) {
        setBoardStartPosition(position.state);
    }

    const positionsPanelBtns = Object.entries(getAllUserPositionStates()).map(entry => {
        return entry[1].map(position => {
            let classes = "position-option";
            if(entry[0] === "default") classes += " default";
            return (
                <div key={position.name} onClick={() => handlePickPosition(position)} className={classes}>{position.name}</div>
            );
        });
    }).flat();

    function handlePanelPieceClick(key) {
        if(piecePanelPieckedKey !== key) setPiecePanelPickedKey(key);
        else setPiecePanelPickedKey(null);
    }

    const pieceElements = Boolean(pieces) && pieces.map(piece => {
        let classes = "bot-panel-piece";
        const elementKey = getPieceKey(piece);
        if(elementKey === piecePanelPieckedKey) classes += " active";
        return (
            <div key={elementKey} onClick={() => handlePanelPieceClick(elementKey)} className={classes} style={{
                backgroundImage: `url("${piece[`${piecesColor}ImagePath`]}")`
            }}></div>
        );
    });

    function handleBoardClick(event) {
        if(!piecePanelPieckedKey) return;
        const parent = event.currentTarget;
        const rect = parent.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        const boardWidth = event.currentTarget.scrollWidth,
            squareLength = boardWidth / boardSize.columns;
        const row = boardSize.rows - Math.floor(offsetY / squareLength),
            column = Math.floor(offsetX / squareLength) + 1;
        const position = {row, column};

        const pieceObjectIndex = pieces.findIndex(piece => getPieceKey(piece) === piecePanelPieckedKey);
        const pieceObject = deepCopy(pieces[pieceObjectIndex]);
        pieceObject.color = piecesColor;
        pieceObject.position = position;

        return (callback) => callback(pieceObject);
    }

    function switchPiecesColor(event) {
        const newColor = piecesColor === 'white' ? 'black' : 'white'
        event.currentTarget.firstElementChild.style.backgroundColor = newColor === 'white' ? 'rgba(255, 255, 255)' : 'rgba(0, 0, 0)';
        setPiecesColor(newColor);
    }

    return (
        <>
            <div className="create-top-container">
                <div className="board-container">
                    <ChessBoard boardClickHandler={handleBoardClick} startPosition={boardStartPosition} boardSize={boardSize} />
                </div>

                <div className="right-panel">
                    <div className="positions-panel">
                        {positionsPanelBtns}
                    </div>
                </div>
            </div>
            <div className="pieces-bottom-panel">
                <div className="pieces-color-change" onClick={switchPiecesColor}>
                    <div id="piece-color-indicator" style={{
                        backgroundColor: 'rgba(255, 255, 255)'
                    }}></div>
                </div>
                {pieceElements}
            </div>
        </>
    ); 
}