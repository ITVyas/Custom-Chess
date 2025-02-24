import { DefaultPieces } from "@/app/components/chess-board/place-pieces";
import getCustomUserPieces from "@/app/utils/actions/getAllUserPieces";
import { exists } from "@/app/utils/util";

export async function getAllUserPieces() {
    const defaultPiecesNames = ['pawn', 'rook', 'bishop', 'knight', 'queen', 'king'];
    const defaultPieces = defaultPiecesNames.map(pieceName => {
        return DefaultPieces._defaultPiece(pieceName);
    });
    const customPieces = await getCustomUserPieces();
    return {
        default: defaultPieces,
        custom: customPieces
    };
}

export function getPieceKey(pieceObj) {
    return exists(pieceObj.id) ? pieceObj.id : pieceObj.name;
}