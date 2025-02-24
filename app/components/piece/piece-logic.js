
function rotate90degMovePattern(movePattern) {
    return { row: -movePattern.column, column: movePattern.row };
}

export function addMoveToPosition(position, move) {
    return { row: position.row + move.row, column: position.column + move.column };
}

export class Move {
    constructor(movePattern, rotate, doRepeatPattern, moveType, doesJumpOver) {
        if(movePattern.row === 0 && movePattern.column === 0) throw new Error('Zero move');
        this.movePattern = movePattern;
        this.rotate = rotate;
        this.doRepeatPattern = doRepeatPattern;
        this.moveType = moveType;
        this.doesJumpOver = doesJumpOver;
    }

    _multiplyMovePattern(n) {
        return {row: this.movePattern.row * n, column: this.movePattern.column * n};
    }

    initAllMoveMasks(boardParams) {
        const boardSize = boardParams.boardSize;
        this.allMoveMasks = [];

        if(this.movePattern.row === 0 && this.movePattern.column === 0) return;
        const maxMovesOnRows = Math.floor((boardSize.rows - 1) / Math.abs(this.movePattern.row));
        const maxMovesOnCols = Math.floor((boardSize.columns - 1) / Math.abs(this.movePattern.column));
        const maxMovesNumber = Math.min(maxMovesOnRows, maxMovesOnCols);

        const baseMovesMask = [this.movePattern];
        if(this.doRepeatPattern) {
            for(let i = 2 ; i <= maxMovesNumber; i++) {
                baseMovesMask.push(this._multiplyMovePattern(i));
            }
        }
        
        this.allMoveMasks.push(baseMovesMask);

        if(this.rotate.once || this.rotate.twice || this.rotate.threeTimes) {
            const rotatedMasks = [];
            rotatedMasks.push(baseMovesMask.map(rotate90degMovePattern));
            rotatedMasks.push(rotatedMasks[0].map(rotate90degMovePattern));
            rotatedMasks.push(rotatedMasks[1].map(rotate90degMovePattern));

            if(this.rotate.once) this.allMoveMasks.push(rotatedMasks[0]);
            if(this.rotate.twice) this.allMoveMasks.push(rotatedMasks[1]);
            if(this.rotate.threeTimes) this.allMoveMasks.push(rotatedMasks[2]);
        }
    }

    _applyMaskOnBoard(mask, board, piece) {
        const moves = [];
        for(let move of mask) {
            const boardSquare = board.get(addMoveToPosition(piece.position, move));
            if(!boardSquare) break;
            if(!boardSquare.piece) {
                moves.push(move);
                continue;
            }
            if(boardSquare.piece.color !== piece.color) moves.push(move);
            break;
        }
        return moves;
    }

    applyMasksOnBoard(board, piece) {
        if(!this.allMoveMasks) return [];
        return this.allMoveMasks.map(mask => this._applyMaskOnBoard(mask, board, piece)).flat();
    }

    getAllPossibleMoves(board, piece) {
        return this.applyMasksOnBoard(board, piece);
    }

    exportParams() {
        return {
            movePattern: this.movePattern,
            doRepeatPattern: this.doRepeatPattern,
            rotate: this.rotate,
            moveType: this.moveType,
            doesJumpOver: this.doesJumpOver
        };
    }
}

export class ConditionMove {

}

export class Trigger {

}

export class Important {

}

export const DefaultPiecesLogic = (() => {

    const PiecesLogicMap = {
        'bishop': [
            {
                'type': 'move',
                'params': new Move(
                    {row: 1, column: 1}, 
                    { once: true, twice:true, threeTimes: true },
                    true, 
                    { move: true, take: true },
                    false
                ).exportParams()
            }
        ],

        'rook': [
            {
                'type': 'move',
                'params': new Move(
                    {row: 0, column: 1}, 
                    { once: true, twice:true, threeTimes: true },
                    true, 
                    { move: true, take: true },
                    false
                ).exportParams()
            }
        ],

        'knight': [
            {
                'type': 'move',
                'params': new Move(
                    {row: 1, column: 2}, 
                    { once: true, twice:true, threeTimes: true },
                    false, 
                    { move: true, take: true },
                    false
                ).exportParams()
            },
            {
                'type': 'move',
                'params': new Move(
                    {row: 2, column: 1}, 
                    { once: true, twice:true, threeTimes: true },
                    false, 
                    { move: true, take: true },
                    false
                ).exportParams()
            }
        ],

        'queen' : [
            {
                'type': 'move',
                'name': 'Straight',
                'params': new Move(
                    {row: 0, column: 1}, 
                    { once: true, twice:true, threeTimes: true },
                    true, 
                    { move: true, take: true },
                    false
                ).exportParams()
            },
            {
                'type': 'move',
                'name': 'Diagonal',
                'params': new Move(
                    {row: 1, column: 1}, 
                    { once: true, twice:true, threeTimes: true },
                    true, 
                    { move: true, take: true },
                    false
                ).exportParams()
            }
        ],

        'king': [
            {
                'type': 'move',
                'name': 'Straight',
                'params': new Move(
                    {row: 0, column: 1}, 
                    { once: true, twice:true, threeTimes: true },
                    false, 
                    { move: true, take: true },
                    false
                ).exportParams()
            },
            {
                'type': 'move',
                'name': 'Diagonal',
                'params': new Move(
                    {row: 1, column: 1}, 
                    { once: true, twice:true, threeTimes: true },
                    false, 
                    { move: true, take: true },
                    false
                ).exportParams()
            },
            {
                'type': 'defend'
            },
            
        ],
        'pawn': [
            {
                'type': 'move',
                'name': 'One square move',
                'params': new Move(
                    {row: 1, column: 0}, 
                    { once: false, twice:false, threeTimes: false },
                    false, 
                    { move: true, take: false },
                    false
                ).exportParams()
            },
            {
                'type': 'move',
                'name': 'Take right',
                'params': new Move(
                    {row: 1, column: 1}, 
                    { once: false, twice:false, threeTimes: false },
                    false, 
                    { move: false, take: true },
                    false
                ).exportParams()
            },
            {
                'type': 'move',
                'name': 'Take left',
                'params': new Move(
                    {row: 1, column: -1}, 
                    { once: false, twice:false, threeTimes: false },
                    false, 
                    { move: false, take: true },
                    false
                ).exportParams()
            }
        ]
    };

    return {
        get: (type) => PiecesLogicMap[type]
    };
})();