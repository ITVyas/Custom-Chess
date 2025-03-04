'use server'

import { getSession } from "./auth"
import { exists } from "../util";
import db from "../db/db";

export default async function saveUserPosition(position, positionName) {
    const session = await getSession();
    if(!exists(session.sessionId)) return {error: "No session"};


    const result = await db.savePosition(position);
    await db.saveUserPosition({ userId: session.userId, positionId: result.id, positionName });
}