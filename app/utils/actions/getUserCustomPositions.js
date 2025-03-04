'use server';
import { getSession } from "./auth";
import db from "../db/db";
import { exists } from "../util";

export default async function getUserCustomPositions() {
    const session = await getSession();
    if(!exists(session.sessionId)) return [];

    const userPositionsRaw = await db.getUserPositions(session.userId);
    return userPositionsRaw.map(userPositionRaw => {
        const position = JSON.parse(userPositionRaw.position);
        return {
            id: userPositionRaw.position_id,
            name: userPositionRaw.position_name, 
            pieces: position.pieces,
            pieceBases: position.pieceBases,
            boardSize: position.boardSize
        };
    });
}