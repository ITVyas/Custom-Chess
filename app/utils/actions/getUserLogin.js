'use server'
import db from "../db/db";

export default async function getUserLogin(id) {
    const user = await db.getUserById(id);
    return user.login;
}