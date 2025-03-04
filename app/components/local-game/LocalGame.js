import ChessBoard from "../chess-board/ChessBoard";
import {GameManager} from "@/chess-logic/GameManager";
import { BoardState } from "@/chess-logic/BoardState";
import { useEffect, useMemo, useState } from "react";
import { addMoveToPosition } from "@/chess-logic/piece-logic-module";

export default function LocalGame({gameParams, gameMetaChangeEvent}) {
    const gameManager = useMemo(() => new GameManager(
        new BoardState(gameParams.position.boardSize, gameParams.position.pieces, gameParams.position.pieceBases)
    ), []);

    const [gameState, setGameState] = useState({ movingColor: 'white', status: { isPlaying: true, winner: null } });
    
    useEffect(() => gameMetaChangeEvent.notify(gameState), [gameState]);

    const position = gameManager.getPosition();
    const gameManagerInterface = {
        getAllMovesForPiece(position) {
            const allMoves = gameManager.getAllPossibleMovesForPiece(position);
            //console.log(allMoves);
            return allMoves;
        },

        getPieceAtPosition(position) {
            return gameManager.getPieceAtPosition(position)
        },

        tryMove(piecePosition, move) {
            const success = gameManager.dispatchMove({
                from: piecePosition,
                to: addMoveToPosition(piecePosition, move.move),
                params: move.params
            });
            if(success) {
                setGameState({
                    status: gameManager.getGameStatus(),
                    movingColor: this.getMovingColor()
                });
                return true;
            } else {
                return false;
            } 
        },

        getMovingColor() {
            return gameManager.getMovingColor();
        },

        getPieceBase(key) {
            return gameManager.getPieceBase(key);
        },

        isGamePlaying() {
            return gameState.status.isPlaying;
        }
    };


    return (
        <ChessBoard position={position} gameManagerInterface={gameManagerInterface}/>
    );
}