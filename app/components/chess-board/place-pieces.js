import { createRange } from "@/app/utils/util";
import { DefaultPiecesLogic } from "@/app/components/piece/piece-logic";

const PiecePositions = {
    _createPiecesSymmetrically(whiteRowIndex, columnIndices, name, boardShape={rows: 8, columns: 8}) {
        return columnIndices.map(i => {
            const white = DefaultPieces._defaultPiece(name);
            const black = DefaultPieces._defaultPiece(name);
            white.color = 'white';
            black.color = 'black';

            white.position = { row: whiteRowIndex + 1, column: i+1 };
            black.position = { row: boardShape.rows - whiteRowIndex, column: i+1 };

            return [white, black];
        }).flat();
    },
        
    getStandard() {
        const pawns = this._createPiecesSymmetrically(1, createRange(8), 'pawn');
        const rooks = this._createPiecesSymmetrically(0, createRange(8, 0, 7), 'rook');
        const knights = this._createPiecesSymmetrically(0, createRange(8, 1, 5), 'knight');
        const bishops = this._createPiecesSymmetrically(0, createRange(8, 2, 3), 'bishop');
        const queens = this._createPiecesSymmetrically(0, [3], 'queen');
        const kings = this._createPiecesSymmetrically(0, [4], 'king');
        return [...pawns, ...rooks, ...knights, ...bishops, ...queens, ...kings];
    }
};

const DefaultPieces = {
    _defaultPiece(pieceName) {
        return { 
            name: pieceName, 
            whiteImagePath: `/img/pieces/standard/${pieceName}-white.png`,
            blackImagePath: `/img/pieces/standard/${pieceName}-black.png`,
            logic: DefaultPiecesLogic.get(pieceName)
        };
    },
};

export {PiecePositions, DefaultPieces};