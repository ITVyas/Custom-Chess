'use server'

import { getSession } from "./auth"
import { exists } from "../util";
import db from "../db/db";
import saveFile from "./saveFile";

const PUBLIC_NEW_PIECES_PATH = ['img', 'pieces', 'custom'];

export default async function saveUserPiece({pieceLogic, pieceName, whitePieceImg, blackPieceImg}) {
    const session = await getSession();
    if(!exists(session.sessionId)) return {error: "No session"};
    const savedPiece = await db.savePiece({pieceLogic});
    await Promise.all([
        db.saveUserPiece({userId: session.userId, pieceId: savedPiece.id, pieceName: pieceName}),
        saveFile(whitePieceImg, PUBLIC_NEW_PIECES_PATH, `${savedPiece.id}-white.png`),
        saveFile(blackPieceImg, PUBLIC_NEW_PIECES_PATH, `${savedPiece.id}-black.png`)
    ]);
}