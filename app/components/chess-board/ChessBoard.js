import { useRef, useState } from 'react';
import './chess-board.css';
import Piece from '@/app/components/piece/Piece';
import { getPieceKey } from '@/app/create/components/create-util';
import { exists } from '@/app/utils/util';
import FloatPiece from '../float-piece/FloatPiece';
import { addMoveToPosition } from '../../../chess-logic/piece-logic-module';
import PieceMoveMark from '../piece-move-mark/PieceMoveMark';
import Promotion from '../promotion/Promotion';

function arePositionsEqual(pos1, pos2) {
    return pos1.row === pos2.row && pos1.column === pos2.column; 
}


export default function ChessBoard({ position, externalClickHandler, gameManagerInterface, viewFromColor='white' }) {

    const dragRef = useRef(null);
    const [dragPiece, setDragPiece] = useState(null);
    const [selectedPiece, setSelectedPiece] = useState(null);

    const [promotion, setPromotion] = useState(null);

    let currentDragHoveredSquareAction = null;

    function getMoveAction(move) {

        const tryMoveAction = () => {
            gameManagerInterface.tryMove(selectedPiece.position, move);
            setSelectedPiece(null);
        };

        return () => {
            if(exists(move.params.triggers) && move.params.triggers.length > 0) {
                const trigger = move.params.triggers[0];
                if(trigger.type === 'transformation') {
                    setPromotion({
                        status: 'in progress', 
                        position: addMoveToPosition(selectedPiece.position, move.move),
                        pieces: trigger.value.map(pieceKey => ({
                            key: pieceKey,
                            img: gameManagerInterface.getPieceBase(pieceKey)[`${'white'}ImagePath`]
                        })),
                        action: (key) => {
                            trigger.pieceKey = key;
                            tryMoveAction();
                        }
                    });
                } else {
                    tryMoveAction();
                }
            } else {
                tryMoveAction();
            }
        };
    }

    const movesOnPiece = [];
    const moveElements = [];
    if(selectedPiece) {
        selectedPiece.moves.forEach((move, i) => {
            const squarePos = addMoveToPosition(selectedPiece.position, move.move);
            const piece = gameManagerInterface.getPieceAtPosition(squarePos);
            if(piece) {
                movesOnPiece.push(move);
            } else {
                const isDragPieceOver = exists(dragPiece) && arePositionsEqual(dragPiece.mouseBoardPosition, squarePos);
                if(isDragPieceOver) {
                    currentDragHoveredSquareAction = getMoveAction(move);
                }

                moveElements.push((
                    <PieceMoveMark onClick={getMoveAction(move)}
                        key={`move-option-${i}`} 
                        position={squarePos}
                        boardSize={position.boardSize}
                        invertPosition={viewFromColor === 'black'}
                        isDragPieceOver={isDragPieceOver} />
                ));
            }
        });
    }
    

    const pieceElements = position.pieces.map(piece => {
        const pieceKey = getPieceKey(piece);
        const isDragging = Boolean(dragPiece) && dragPiece.piece === piece;
        const isSelected = Boolean(selectedPiece) && arePositionsEqual(piece.position, selectedPiece.position);

        const takeThePieceMoveIndex = movesOnPiece.findIndex(move => arePositionsEqual(
            addMoveToPosition(selectedPiece.position, move.move), piece.position
        ));
        const isTakeable = takeThePieceMoveIndex !== -1;

        const piecePositionKey = String(pieceKey) + `-drag: ${isDragging}-` + piece.position.row + piece.position.column;
        const isDragPieceOver = isTakeable && exists(dragPiece) && arePositionsEqual(dragPiece.mouseBoardPosition, piece.position);
        
        if(isDragPieceOver) {
            currentDragHoveredSquareAction = getMoveAction(movesOnPiece[takeThePieceMoveIndex]);
        }

        return (
            <Piece key={piecePositionKey}
                piece={piece}
                boardSize={position.boardSize}
                isSelected={isSelected}
                isDragging={isDragging}
                isTakeable={isTakeable}
                isDragPieceOver={isDragPieceOver}
                invertPosition={viewFromColor === 'black'}
                onClick={isTakeable ? getMoveAction(movesOnPiece[takeThePieceMoveIndex]) : () => {}}
            />
        );
    });

    const dragPieceElement = Boolean(dragPiece) && (
        <FloatPiece ref={dragRef} piece={dragPiece.piece} boardSize={position.boardSize} startBoardCoords={dragPiece.startBoardCoords}/>
    );

    const movePiecesHandlers = {
        mouseDownHandler: (e) => {
            if(!gameManagerInterface || !gameManagerInterface.isGamePlaying()) return;
            const boardElement = e.currentTarget;
            if(e.target === boardElement) {
                setSelectedPiece(null);
                return false
            };
            
            const rect = boardElement.getBoundingClientRect();
            const mouseBoardCoords = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            const xRatio = mouseBoardCoords.x/boardElement.offsetWidth; 
            const yRatio = mouseBoardCoords.y/boardElement.offsetHeight; 

            const maxRows = position.boardSize.rows;
            const maxCols = position.boardSize.columns;
            const mouseBoardPosition = {
                row: maxRows - Math.floor(yRatio*maxRows),
                column: Math.floor(xRatio*maxCols) + 1
            };

            if(viewFromColor === 'black') {
                mouseBoardPosition.row = position.boardSize.rows - mouseBoardPosition.row + 1;
                mouseBoardPosition.column = position.boardSize.columns - mouseBoardPosition.column + 1;
            }

            const piece = gameManagerInterface.getPieceAtPosition(mouseBoardPosition);
            if(piece && piece.color === gameManagerInterface.getMovingColor()) {
                if(!selectedPiece || !arePositionsEqual(selectedPiece.position, mouseBoardPosition)) {
                    setSelectedPiece({
                        position: mouseBoardPosition,
                        moves: gameManagerInterface ? gameManagerInterface.getAllMovesForPiece(mouseBoardPosition) : [] 
                    });
                }
                
                setDragPiece({
                    piece,
                    startBoardCoords: mouseBoardCoords,
                    mouseBoardPosition: mouseBoardPosition
                });
            }
        },

        mouseMoveHandler: (e) => {
            if(!gameManagerInterface || !gameManagerInterface.isGamePlaying()) return;
            if(!exists(dragPiece)) return;

            const boardElement = e.currentTarget;
            const rect = boardElement.getBoundingClientRect();
            const mouseBoardCoords = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            dragRef.current.style.top = `${mouseBoardCoords.y}px`;
            dragRef.current.style.left = `${mouseBoardCoords.x}px`;

            const xRatio = mouseBoardCoords.x/boardElement.offsetWidth; 
            const yRatio = mouseBoardCoords.y/boardElement.offsetHeight; 

            const maxRows = position.boardSize.rows;
            const maxCols = position.boardSize.columns;
            const mouseBoardPosition = {
                row: maxRows - Math.floor(yRatio*maxRows),
                column: Math.floor(xRatio*maxCols) + 1
            };

            if(viewFromColor === 'black') {
                mouseBoardPosition.row = position.boardSize.rows - mouseBoardPosition.row + 1;
                mouseBoardPosition.column = position.boardSize.columns - mouseBoardPosition.column + 1;
            }

            if(!arePositionsEqual(dragPiece.mouseBoardPosition, mouseBoardPosition)) {
                setDragPiece({
                    ...dragPiece,
                    mouseBoardPosition: mouseBoardPosition
                });
            }
        },

        mouseReleaseHandler: (e) => {
            if(!gameManagerInterface || !gameManagerInterface.isGamePlaying()) return;
            if(!exists(dragPiece)) return;

            if(exists(currentDragHoveredSquareAction)) {
                currentDragHoveredSquareAction();
            }

            setDragPiece(null);
            dragRef.current = null;
        }
    };
    
    return (
        <>
            <div onClick={(e) => {
                    if(typeof(externalClickHandler) === 'function') {
                        externalClickHandler(e);
                    }
                }} 
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={(e) => {
                    movePiecesHandlers.mouseDownHandler(e);
                }}
                onMouseMove={(e) => {
                    movePiecesHandlers.mouseMoveHandler(e);
                }}
                onMouseUp={(e) => {
                    movePiecesHandlers.mouseReleaseHandler(e);
                }}
                className="chess-board standard cb-12 center top-indent">
                {pieceElements}
                {moveElements}
                {dragPieceElement}

                { (Boolean(promotion) && promotion.status === 'in progress') && 
                    <Promotion boardSize={position.boardSize} position={promotion.position} pieces={promotion.pieces} onPromotion={promotion.action} onCancel={() => setPromotion(null)} /> }
            </div>
        </>
    );
}