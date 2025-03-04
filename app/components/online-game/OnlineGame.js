import { exists } from "@/chess-logic/utils";
import ChessBoard from "../chess-board/ChessBoard";
import useOnlineGame from "@/app/hooks/useOnlineGame";
import { addMoveToPosition } from "@/chess-logic/piece-logic-module";
import { useEffect } from "react";

export default function OnlineGame({ gameId, gameMetaChangeEvent }) {
    
    const { game, dispatchMove } = useOnlineGame(gameId);

    useEffect(() => {
        if(game) gameMetaChangeEvent.notify({ status: game.status, movingColor: game.movingColor })
    }, [game]);
    
    const position = {
        boardSize: {},
        pieces: []
    };
    let gameManagerInterface;
    let playerColor = 'white';

    if(exists(game)) {
        playerColor = game.playerColor;
        position.boardSize = {
            rows: game.positionGrid.length,
            columns: game.positionGrid[0].length
        };
        game.positionGrid.forEach(row => {
            row.forEach(square => {
                if(exists(square) && exists(square.piece)) {
                    const pieceData = square.piece;
                    const pieceBase = game.pieceBases[pieceData.key]
                    const piece = {
                        ...pieceData,
                        ...pieceBase
                    };
                    delete piece.key;
                    position.pieces.push(piece);
                }
            });
        });
    
        gameManagerInterface = {
            getAllMovesForPiece(position) {
                const possibleMovesObject = game.possibleMoves.find(mvObj => mvObj.position.row === position.row && mvObj.position.column === position.column)
                return exists(possibleMovesObject) ? possibleMovesObject.moves : [];
            },
    
            getPieceAtPosition(position) { 
                const square = game.positionGrid[position.row - 1][position.column - 1];
                if(!exists(square) || !exists(square.piece)) return null;

                const pieceData = square.piece;
                const pieceBase = game.pieceBases[pieceData.key]
                const piece = {
                    ...pieceData,
                    ...pieceBase
                };
                delete piece.key;
                return piece;
            },
    
            tryMove(piecePosition, move) {
                dispatchMove({
                    from: piecePosition,
                    to: addMoveToPosition(piecePosition, move.move),
                    params: move.params
                })
            },
    
            getMovingColor() {
                return game.movingColor;
            },
    
            getPieceBase(key) {
                return game.pieceBases[key];
            },
    
            isGamePlaying() {
                return game.status.isPlaying;
            }
        };
    }

    return (
        <ChessBoard position={position} gameManagerInterface={gameManagerInterface} viewFromColor={playerColor}/>
    );
}