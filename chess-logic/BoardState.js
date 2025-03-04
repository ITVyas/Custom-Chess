import { PieceBaseStore } from './PieceBaseStore.js'
import { exists } from './utils.js';


export class BoardState {
    constructor(boardSize, pieces=[], pieceBases={}) {
        this.boardSquares = [];
        this.boardSize = {...boardSize};
        for(let i = 0; i < boardSize.rows; i++) {
            this.boardSquares.push([]);

            for(let j = 0; j < boardSize.columns; j++) {
                this.boardSquares[i].push({ piece: null });
            }
        }

        this.pieceBases = new PieceBaseStore(pieceBases);
        this.lastMoveChanges = [];

        pieces.forEach(piece => {
            const square = this.get(piece.position);
            if(!square) return;
            square.piece = {
                ...piece,
                ...(this.getDefaultPieceData())
            };
        });
    }


    getAllSquarePositionsWithDefendPiece(piecesColor) {
        const positions = [];
        this.boardSquares.forEach(row => {
            row.forEach(square => {
                if(!exists(square) || !exists(square.piece) || square.piece.color !== piecesColor) return;
                if(this.pieceBases.getBase(square.piece.key).logic.findIndex(l => l.type === 'defend') !== -1) {
                    positions.push(square.piece.position);
                }
            });
        });
        return positions;
    }

    getAllPiecePositionsByColor(color) {
        const positions = [];
        this.boardSquares.forEach(row => {
            row.forEach(square => {
                if(!exists(square) || !exists(square.piece) || square.piece.color !== color) return;
                positions.push(square.piece.position);
            });
        });
        return positions;
    }

    resetAttackedSquares() {
        this.boardSquares.forEach(row => {
            row.forEach(square => {
                if(!exists(square)) return;
                square.attacked = false;
            });
        });
    }

    setSquaresAttacked(positions) {
        positions.forEach(position => {
            const square = this.get(position);
            if(!exists(square)) return;
            square.attacked = true;
        });
    }

    removeSqaures(squarePositions) {
        const boardSize = this.boardSize;
        squarePositions.forEach(position => {
            if(position.row >= 1 && position.row <= boardSize.rows && position.column >= 1 && position.column <= this.boardSize.columns) {
                this.boardSquares[position.row - 1][position.column - 1] = null;
            }
        });
    }

    getDefaultPieceData() {
        return {
            movesDone: 0,
            lastMoveAgo: null
        };
    }

    get(position) {
        const boardSize = this.boardSize;
        if(!(position.row >= 1 && position.row <= boardSize.rows && position.column >= 1 && position.column <= this.boardSize.columns))
            return null;
        const squareContent = this.boardSquares[position.row - 1][position.column - 1];
        return squareContent ? squareContent : null;
    }

    getPiece(position) {
        const square = this.get(position);
        if(square && square.piece) {
            const pieceData = square.piece;
            const pieceBase = this.pieceBases.getBase(pieceData.key);
            pieceBase.position = pieceData.position;
            pieceBase.color = pieceData.color;
            return pieceBase;
        } else {
            return null;
        }
    }

    set(position, value) {
        const boardSize = this.boardSize;
        if(!(position.row >= 1 && position.row <= boardSize.rows && position.column >= 1 && position.column <= this.boardSize.columns))
            return;

        if(exists(value) && exists(value.piece)) {
            value.piece.position = position;
        }
        this.boardSquares[position.row - 1][position.column - 1] = value;

        const changeByPositionIndex = this.lastMoveChanges.findIndex(change => {
            return change.position.row === position.row && change.position.column === position.column;
        });

        if(changeByPositionIndex !== -1) this.lastMoveChanges.splice(changeByPositionIndex, 1);
        this.lastMoveChanges.push({ position, square: { 
            piece: value.piece ? { color: value.piece.color, key: value.piece.key, position: value.piece.position } :  null
        } });
    }

    countMoveForPiece(position) {
        const sqaure = this.get(position);
        if(!exists(sqaure) || !exists(sqaure.piece)) return;
        sqaure.piece.movesDone += 1;
        sqaure.piece.lastMoveAgo = 0;
    }

    getPosition() {
        const pieces = [];
        this.boardSquares.forEach(row => {
            row.forEach(sqaure => {
                if(sqaure && sqaure.piece) {
                    const pieceData = sqaure.piece;
                    const pieceBase = this.pieceBases.getBase(pieceData.key);
                    pieceBase.position = pieceData.position;
                    pieceBase.color = pieceData.color;
                    pieces.push(pieceBase);
                }
            });
        });
        return {
            boardSize: {...this.boardSize},
            pieces
        };
    }

    getPositionAsGrid() {
        const position = [];
        this.boardSquares.forEach(row => {
            const rowArr = [];
            
            row.forEach(sqaure => {
                if(!sqaure) {
                    rowArr.push(null);
                } else if(!sqaure.piece) {
                    rowArr.push({ piece: null });
                } else {
                    rowArr.push({ piece: sqaure.piece });
                }
            });

            position.push(rowArr);
        });

        return position;
    }

    updateLastMoveAgoForColor(color) {
        this.boardSquares.forEach(row => {
            row.forEach(square => {
                if(!square || !square.piece || square.piece.color !== color || !exists(square.piece.lastMoveAgo)) return;
                square.piece.lastMoveAgo += 1;
            });
        });
    }


    checkpoint() {
        this._checkpoint = structuredClone(this.boardSquares);
        this._checkpoint_changes = structuredClone(this.lastMoveChanges);
    }

    backToCheckpoint() {
        if(!exists(this._checkpoint)) return;

        this.boardSquares = structuredClone(this._checkpoint);
        this.lastMoveChanges = structuredClone(this._checkpoint_changes);;
    }

    deleteCheckpoint() {
        this._checkpoint = null;
        this._checkpoint_changes = null;
    }

    resetChanges() {
        this.lastMoveChanges = [];
    }
};
