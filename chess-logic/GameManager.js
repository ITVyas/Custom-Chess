import { addMoveToPosition, ConditionalMove, Move, Trigger } from "./piece-logic-module.js";
import { exists } from "./utils.js";

export class GameManager {
    constructor(startBoardState) {
        this.boardState = startBoardState;
        this.movingColor = 'white';

        this.setAttackedSquares();
        this.winner = null;
    }

    getPositionAsGrid() {
        return this.boardState.getPositionAsGrid();
    }

    setAttackedSquares() {
        this.boardState.resetAttackedSquares();

        const enemyColor = this.movingColor === 'white' ? 'black' : 'white';

        const positions = this.boardState.getAllPiecePositionsByColor(enemyColor);

        const attackedSquaresSet = ((arr) => {
            return {
                push(position) {
                    if(arr.findIndex(pos => pos.row === position.row && pos.column === position.column) === -1) arr.push(position);
                },

                get() { return arr }
            };
        })([]);

        positions.forEach(position => {
            const moves = this.getAllPossibleMovesForPiece(position, enemyColor, false);
            moves.forEach(move => {
                if(move.params.type === 'move' && move.params.take) attackedSquaresSet.push(addMoveToPosition(position, move.move));
                else if(move.params.type === 'conditional') {
                    if(exists(move.move)) attackedSquaresSet.push(addMoveToPosition(position, move.move));
                    move.params.resultCfgs.forEach(resultCfg => {
                        if(resultCfg.position.row === 0 && resultCfg.position.column === 0) return;
                        if(['clear', 'ally-piece', 'piece-here'].includes(resultCfg.type)) attackedSquaresSet.push(addMoveToPosition(position, resultCfg.position));
                    });
                } 
            });
        });

        console.log('attacked positions: ', attackedSquaresSet.get());
        this.boardState.setSquaresAttacked(attackedSquaresSet.get());
    }



    filterMovesByDefendLogic(position, moves) {
        console.log('START FILTERING');
        console.log(moves, position);
        const startMovingColor = this.movingColor;
        const filteredMoves = [];
        this.boardState.checkpoint();

        moves.forEach((move, index) => {
            if(index > 0) {
                this.boardState.backToCheckpoint();
                this.movingColor = startMovingColor;
            }
            
            const dispatchResult = this.dispatchMove({ from: position, to: addMoveToPosition(position, move.move), params: move.params }, false);
            if(!dispatchResult) return;

            this.setAttackedSquares();

            const positionsWithDefent = this.boardState.getAllSquarePositionsWithDefendPiece(startMovingColor);
            console.log('Attacked positions: ', positionsWithDefent);
            if(positionsWithDefent.findIndex(position => {
                console.log(this.boardState.get(position));
                return this.boardState.get(position).attacked;
            }) !== -1) {
                console.log('Move denied. ', move);
                return;
            }

            filteredMoves.push(move);
        });

        this.boardState.backToCheckpoint();
        this.boardState.deleteCheckpoint();
        this.movingColor = startMovingColor;
        console.log("Filtered: ", filteredMoves, '\nColor: ', this.movingColor);
        return filteredMoves;
    }

    getAllPossibleMovesForPiece(position, forceMovingColor=null, filterByDefendLogic=true) {
        const square = this.boardState.get(position);
        if(!square || !square.piece) return [];

        const piece = square.piece;
        const pieceLogic = this.boardState.pieceBases.getBaseField(piece.key, 'logic');
        if(
            (!forceMovingColor && piece.color !== this.movingColor) ||
            (forceMovingColor && piece.color !== forceMovingColor)
        ) return [];

        const triggers = pieceLogic.filter(l => l.type === 'trigger').map(l => Trigger.fromParams(l.params));

        const addActicvatedTriggersToMoveObject = (moveObject) => {
            const activatedTriggers = [];
            triggers.forEach(trigger => {
                if(trigger.checkIfTriggers(this.boardState, moveObject, piece))
                    activatedTriggers.push(trigger);
            });
            moveObject.params.triggers = activatedTriggers.map(trigger => trigger.consequence);
        }

        const allMovesForMoveLogics = pieceLogic.filter(l => l.type === 'move').map(l => {
            const moveLogic = Move.fromParams(l.params);
            moveLogic.initAllMoveMasks({ boardSize:  this.boardState.boardSize}, piece.color);


            return moveLogic.getAllPossibleMoves(this.boardState, piece).map(move => {
                const moveObject = {
                    move, params: { type: 'move', take: l.params.moveType.take }
                };
                addActicvatedTriggersToMoveObject(moveObject);
                return moveObject
            });
        }).flat();

        const allMovesFormConditionalLogic = pieceLogic.filter(l => l.type === 'conditional').map(l => {
            const condLogic = ConditionalMove.fromParams(l.params);
            return condLogic.getAllPossibleMoves(this.boardState, piece).map(moveObject => {
                addActicvatedTriggersToMoveObject(moveObject);
                return moveObject;
            });
        }).flat();

        const allMoves = [...allMovesForMoveLogics, ...allMovesFormConditionalLogic];
        return filterByDefendLogic ? this.filterMovesByDefendLogic(position, allMoves) : allMoves;
    }

    getAllPossibleMoves() {
        const currentMovingPiecePositions = this.boardState.getAllPiecePositionsByColor(this.movingColor);
        const possibleMoves = [];

        currentMovingPiecePositions.forEach(position => {
            possibleMoves.push({
                position: position,
                moves: this.getAllPossibleMovesForPiece(position)
            });
        });
        return possibleMoves;
    }

    getPieceAtPosition(position) {
        return this.boardState.getPiece(position);
    }

    checkIfLost() {
        const defendPiecesSquares = this.boardState.getAllSquarePositionsWithDefendPiece(this.movingColor);
        const isLost = defendPiecesSquares.reduce((acc, squarePosition) => {
            if(acc) return true;
            return this.boardState.get(squarePosition).attacked && this.getAllPossibleMovesForPiece(squarePosition).length === 0;
        }, false);
        

        if(isLost) {
            this.switchMovingColor();
            this.winner = this.movingColor;
        } 
        
        return isLost;
    }

    nextMove() {
        this.boardState.updateLastMoveAgoForColor(this.movingColor);
        this.switchMovingColor();
        this.setAttackedSquares();

        this.checkIfLost();
    }

    switchMovingColor() {
        this.movingColor = this.movingColor === 'white' ? 'black' : 'white';
    }

    getPosition() {
        return this.boardState.getPosition();
    }

    getLastMoveChanges() {
        return this.boardState.lastMoveChanges;
    }

    dispatchMove({ from, to, params }, setNextMove=true) {
        if(this.winner) return { done: false };

        const square = this.boardState.get(from);
        if(!square || !square.piece) return { done: false };

        const piece = square.piece;
        if(piece.color !== this.movingColor) return { done: false };

        switch(params.type) {
            case 'move':
                this.boardState.resetChanges();
                this.boardState.set(from, { piece: null });
                this.boardState.set(to, {piece});
                if(setNextMove) {
                    this.boardState.countMoveForPiece(to);
                    this.nextMove();
                    if(exists(params.triggers) && params.triggers.length > 0) {
                        this.dispatchTrigger(to, params.triggers[0]);
                    }
                }
                
                return { done: true };
            case 'conditional':
                this.boardState.resetChanges();
                if(ConditionalMove.applyLegalMove(params, from, this.boardState, piece)) {
                    if(setNextMove) {
                        this.boardState.countMoveForPiece(to);
                        this.nextMove();
                        if(exists(params.triggers) && params.triggers.length > 0) {
                            this.dispatchTrigger(piece.position, params.triggers[0]);
                        }
                    }
                    return { done: true };
                }
                return { done: false };
            default:
                return { done: false };
        }
    }

    dispatchTrigger(position, params) {
        if(params.type === 'transformation') {
            const square = this.boardState.get(position);
            console.log(JSON.stringify(square));
            if(exists(square) && exists(square.piece)) {
                square.piece = {
                    ...square.piece,
                    ...(this.boardState.getDefaultPieceData()),
                    key: params.pieceKey
                };
            }
        }
    }

    getMovingColor() {
        return this.movingColor;
    }

    getPieceBase(key) {
        return this.boardState.pieceBases.getBase(key);
    }

    getGameStatus() {
        return {
            isPlaying: !Boolean(this.winner),
            winner: this.winner
        };
    }

};