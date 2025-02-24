'use server';
import { exists } from "../util";
import { getSession } from "./auth";
import db from "../db/db";

export default async function getCustomUserPieces() {
    const session = await getSession();
    if(!exists(session.sessionId)) return {error: 'No session'};

    const userPiecesRaw = await db.getUserPieces(session.userId);
    
    return userPiecesRaw.map(userPiece => ({
        id: userPiece.piece_id, 
        name: userPiece.piece_name,
        logic: JSON.parse(userPiece.piece).pieceLogic,
        whiteImagePath: `/img/pieces/custom/${userPiece.piece_id}-white.png`,
        blackImagePath: `/img/pieces/custom/${userPiece.piece_id}-black.png`
    }));
}