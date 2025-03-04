import { enPassant, longCastles, pawnFirstLongMove, pawnPromotion, shortCastles } from "./special-piece-logics.js";
import { getPieceCfgFromCfgPart, getSqaureCfgFromCfgPart,doSquareAndCfgMatch, doPieceAndCfgMatch } from "./board-state-utils.js";
import { exists } from "./utils.js";


function rotate90degMovePattern(movePattern) {
    return { row: -movePattern.column, column: movePattern.row };
}

function muliplyMove(move, n) {
    return {row: move.row * n, column: move.column * n};
}

export function get180degRotatedMove(move) {
    return {row: -move.row, column: -move.column};
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

    static fromParams(params) {
        return new Move(params.movePattern, params.rotate, params.doRepeatPattern, params.moveType, params.doesJumpOver);
    }

    initAllMoveMasks(boardParams, pieceColor='white') {
        const boardSize = boardParams.boardSize;
        this.allMoveMasks = [];

        if(this.movePattern.row === 0 && this.movePattern.column === 0) return;
        const maxMovesOnRows = Math.floor((boardSize.rows - 1) / Math.abs(this.movePattern.row));
        const maxMovesOnCols = Math.floor((boardSize.columns - 1) / Math.abs(this.movePattern.column));
        const maxMovesNumber = Math.min(maxMovesOnRows, maxMovesOnCols);

        const basePattern = pieceColor === 'white' ? this.movePattern : get180degRotatedMove(this.movePattern);
        const baseMovesMask = [basePattern];
        if(this.doRepeatPattern) {
            for(let i = 2 ; i <= maxMovesNumber; i++) {
                baseMovesMask.push(muliplyMove(basePattern, i));
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
                if(this.moveType.move) moves.push(move);
            } else {
                if(boardSquare.piece.color !== piece.color && this.moveType.take) moves.push(move);
                break;
            }
        
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

export class ConditionalMove {
    constructor(configSquares, resultType, flip, move=null) {
        this.flip = flip;
        this.configSquares = configSquares;
        this.resultType = resultType;
        this.move = move;
    }

    static fromParams(params) {
        return new ConditionalMove(params.configSquares, params.resultType, params.flip, params.move);
    }

    _areConfigsMatchBoard(centerPoisition, configs, board) {
        return configs.reduce((checkResult, cfg) => {
            if(!checkResult) return false;
            const realPosition = addMoveToPosition(centerPoisition, cfg.position);
            const pieceCfg = getPieceCfgFromCfgPart(cfg.pieceCfg);
            const squareCfg = getSqaureCfgFromCfgPart(cfg.squareCfg);

            const squareMatchResult = doSquareAndCfgMatch(board.get(realPosition), squareCfg);
            if(!squareMatchResult) return false;

            const pieceMatchResult = doPieceAndCfgMatch(board.get(realPosition).piece, pieceCfg, board.get(centerPoisition).piece.color);
           // console.log(pieceMatchResult);
            if(!pieceMatchResult) return false;

            return true;
        }, true);
    }

    _getMovesForConfigArr(configs, board, piece) {
        //console.log(this.resultType === 'move');
        if(this.resultType === 'move') {
            const moveLogic = Move.fromParams(this.move.params);
            moveLogic.initAllMoveMasks({boardSize: board.boardSize}, piece.color);
            return moveLogic.getAllPossibleMoves(board, piece).map(move => ({move, params: {type: 'move'}}));
        } else if(this.resultType === 'position') {
            //console.log('POSITION');
            const pieceMoveIndex = configs.findIndex(cfg => cfg.resultCfg.type === 'piece-here');
            const params = {
                type: 'conditional',
                resultCfgs: configs.map(cfg => ({...cfg.resultCfg, position: cfg.position}))
            };
            //console.log('INDEX: ' , pieceMoveIndex);
            if(pieceMoveIndex === -1) 
                return [{ move: null, params}];
            return [{ move: configs[pieceMoveIndex].position, params}];
        }  else return [];
    }

    static flipConfigs(configs, mode) {
        let reflectFunction;
        switch(mode) {
            case 'vertical':
                reflectFunction = (pos) => ({row: -pos.row, column: pos.column}); break;
            case 'horizontal': 
                reflectFunction = (pos) => ({row: pos.row, column: -pos.column}); break;
            default:
                return configs;
        }

        return configs.map(cfg => ({
            ...cfg,
            position: reflectFunction(cfg.position)
        }));
    }

    _getAllPossibleMovesFlip(board, piece, flip=null) {
        const position = piece.position;
        const configs = !exists(flip) ? this.configSquares : ConditionalMove.flipConfigs(this.configSquares, flip);
        const matchResult = this._areConfigsMatchBoard(position, configs, board);
        //console.log(`\nMATCH: ${matchResult}\n`);

        if(!matchResult) return [];
        return this._getMovesForConfigArr(configs, board, piece);
    }

    getAllPossibleMoves(board, piece) {
        if(piece.color === 'black') {
            this.configSquares = ConditionalMove.flipConfigs(this.configSquares, 'vertical');
        }

        //console.log('NULL FLIP');
        const normalMoves = this._getAllPossibleMovesFlip(board, piece);
        //console.log('VERT FLIP');
        const vertFlipMoves = this.flip.verical ? this._getAllPossibleMovesFlip(board, piece, 'vertical') : [];
        //console.log('HORIZ FLIP');
        const horizontal = this.flip.horizontal ? this._getAllPossibleMovesFlip(board, piece, 'horizontal') : [];

        [...vertFlipMoves, ...horizontal].forEach(move => {
            if(normalMoves.findIndex(mv => move.move.row === mv.move.row && move.move.column === mv.move.column) !== -1)
                return;
            normalMoves.push(move);
        });

        return normalMoves;
    }

    static applyLegalMove(moveDescriber, position, board, piece) {
        moveDescriber.resultCfgs.forEach(resultCfg => {
            const realPosition = addMoveToPosition(position, resultCfg.position);
            switch(resultCfg.type) {
                case 'same': return;
                case 'clear': board.set(realPosition, {piece: null}); break;
                case 'piece-here': board.set(realPosition, {piece}); break;
                case 'ally-piece':
                    const newAllyPiece = board.getDefaultPieceData();
                    newAllyPiece.color = piece.color;
                    newAllyPiece.key = resultCfg.value;
                    board.set(realPosition, {piece: newAllyPiece})
                    break;
            }
        });
        return true;
    }

    exportParams() {
        return {
            configSquares: this.configSquares,
            flip: this.flip,
            resultType: this.resultType,
            ...(this.move ? {move: this.move} : {})
        };
    }
}

export class Trigger {
    constructor(condition, consequence) {
        this.condition = condition;
        this.consequence = consequence;
    }

    static fromParams(params) {
        return new Trigger(params.condition, params.consequence);
    }

    checkIfTriggers(board, move, piece) {
        switch(this.condition.type) {
            case 'row':
                if(piece.color === 'white')
                    return addMoveToPosition(piece.position, move.move).row >= this.condition.value;
                else 
                    return addMoveToPosition(piece.position, move.move).row <= board.boardSize.rows - this.condition.value + 1;
            case 'column':
                if(piece.color === 'white')
                    return addMoveToPosition(piece.position, move.move).column >= this.condition.value;
                else 
                    return addMoveToPosition(piece.position, move.move).column <= board.boardSize.columns - this.condition.value + 1;
            case 'capture': 
                if(move.params.type === 'move') {
                    const goalPosition = addMoveToPosition(piece.position, move.move);
                    const square = board.get(goalPosition);
                    return exists(square) && exists(square.piece) && square.piece.color !== piece.color;
                } else if(move.params.type === 'conditional') {
                    const resultCfgs = move.params.resultCfgs;
                    return resultCfgs.reduce((acc, cfg) => {
                        if(acc) return true;
                        if(['clear', 'ally-piece', 'piece-here'].includes(cfg.type)) {
                            const goalPosition = addMoveToPosition(piece.position, cfg.position);
                            const square = board.get(goalPosition);
                            return exists(square) && exists(square.piece) && square.piece.color !== piece.color; 
                        } else return false;
                    }, false);
                } else return false;
            default: 
                return false;
        }
    }

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
            shortCastles,
            longCastles
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
            },
            pawnFirstLongMove,
            enPassant,
            pawnPromotion
        ]
    };

    return {
        get: (type) => PiecesLogicMap[type]
    };
})();