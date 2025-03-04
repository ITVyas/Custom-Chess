import '../create.css';
import { useState, useContext } from "react";
import { PiecesContext } from "@/app/context/PieceContext";
import ChessBoard from '@/app/components/chess-board/ChessBoard';
import { deepCopy } from '@/app/utils/util';
import { getPieceKey, getPositionKey } from '@/chess-logic/utils';
import PositionSaveForm from './PositionSaveForm/PositionSaveForm';
import { PositionContext, UpdatePositionContext } from '@/app/context/PositionContext';
import saveUserPosition from '@/app/utils/actions/saveUserPosition';

function getEmptyPosition() {
    return {
        name: 'empty',
        boardSize: {
            rows: 8, columns: 8
        },
        pieces: [],
        pieceBases: {}
    };
}

function arePositionsEqual(p1, p2) {
    return p1.row === p2.row && p1.column === p2.column;
}

export default function CreatePosition() {
    const [boardStartPosition, setBoardStartPosition] = useState(getEmptyPosition());
    const [piecePanelPieckedKey, setPiecePanelPickedKey] = useState(null);
    const [piecesColor, setPiecesColor] = useState('white');
    const [isPositionSaveFormShown, setIsPositionSaveFormShown] = useState(false);

    const pieces = useContext(PiecesContext);
    const positions = useContext(PositionContext);
    const updatePositions = useContext(UpdatePositionContext);

    const boardSize = {rows: 8, columns: 8};

    function handlePickPosition(position) {
        setBoardStartPosition(position);
    }

    console.log(boardStartPosition);

    const positionsPanelBtns = [getEmptyPosition(), ...(positions ? positions : [])].map(position => {
        let classes = "position-option";
        if(['standard', 'empty'].includes(position.name)) classes += " default";
        const positionKey = getPositionKey(position);

        return (
            <div key={positionKey} onClick={() => handlePickPosition(position)} className={classes}>{position.name}</div>
        );
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

    function switchPiecesColor() {
        setPiecesColor(piecesColor === 'white' ? 'black' : 'white');
    }


    function placePiece(pieceObj) {
        const newPosition = deepCopy(boardStartPosition);

        const pieceData = { position: pieceObj.position, color: pieceObj.color, key: getPieceKey(pieceObj) };
        console.log(pieceData.key);
        
        const pieceBase = { logic: pieceObj.logic, whiteImagePath: pieceObj.whiteImagePath, blackImagePath: pieceObj.blackImagePath};
        const piecesNumberWithThisBase = newPosition.pieces.reduce((acc, piece) => {
            if(piece.key === pieceBase.key) return acc + 1;
            return acc;
        }, 0);

        const pieceAtPositionIndex = newPosition.pieces.findIndex(currentPiece => arePositionsEqual(currentPiece.position, pieceObj.position));
        if(pieceAtPositionIndex !== -1) {
            if(newPosition.pieces[pieceAtPositionIndex].key === pieceData.key && newPosition.pieces[pieceAtPositionIndex].color === pieceObj.color) {
                newPosition.pieces.splice(pieceAtPositionIndex, 1);
                if(piecesNumberWithThisBase === 1) {
                    delete newPosition.pieceBases[pieceData.key];
                }
                    
            } else {
                const removed = newPosition.pieces.splice(pieceAtPositionIndex, 1, pieceData)[0];
                const removedBaseLikeNumber = newPosition.pieces.reduce((acc, piece) => {
                    if(piece.key === removed.key) return acc + 1;
                    return acc;
                }, 0);

                if(removedBaseLikeNumber === 0) {
                    delete newPosition.pieceBases[removed.key];
                }

                if(piecesNumberWithThisBase === 0)
                    newPosition.pieceBases[pieceData.key] = pieceBase;
            }
        } else {
            newPosition.pieces.push(pieceData);
            if(piecesNumberWithThisBase === 0)
                newPosition.pieceBases[pieceData.key] = pieceBase;
        } 

        setBoardStartPosition(newPosition);
    }


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

        placePiece(pieceObject);
    }


    const position = {
        boardSize: boardStartPosition.boardSize,
        pieces: boardStartPosition.pieces.map(pieceData => {
            const pieceBase = boardStartPosition.pieceBases[pieceData.key];
            pieceData = {
                ...pieceData, ...pieceBase
            };
            delete pieceData.key;
            return pieceData;
        })
    };
   
    return (
        <>
            {isPositionSaveFormShown && <PositionSaveForm onClose={() => {setIsPositionSaveFormShown(false)}} onSubmit={(formValues) => {
                saveUserPosition(structuredClone(boardStartPosition), formValues.name).then(updatePositions);
                setIsPositionSaveFormShown(false);
                setBoardStartPosition(getEmptyPosition());
            }} />}
            <div className="create-top-container">
                <div className="board-container">
                    <ChessBoard position={position} externalClickHandler={handleBoardClick}  />
                </div>

                <div className="right-panel">
                    <div className="positions-panel">
                        {positionsPanelBtns}
                    </div>
                    <div className="right-panel-bottom">
                        <button onClick={() => {
                            setIsPositionSaveFormShown(true);
                        }} className="btn save-position-btn">Save</button>
                    </div>
                </div>
            </div>
            <div className="pieces-bottom-panel">
                <div className="pieces-color-change" onClick={switchPiecesColor}>
                    <div id="piece-color-indicator" style={{
                        backgroundColor: piecesColor
                    }}></div>
                </div>
                {pieceElements}
            </div>
        </>
    ); 
}