'use server'

import dbActions from "../db/db-actions";
import { generateAccessAndRefreshTokens } from "../server-access-api";
import { cookies } from "next/headers";

function parseFormSignInData(formData) {
    return {
        login: formData.get('login'),
        password: formData.get('password')
    }
}

async function setUserCookies(creds) {
    const cookieStore = await cookies();
    cookieStore.set('userId', creds.id);
}

export async function signin(creds) {
    if(creds instanceof FormData) creds = parseFormSignInData(creds);

    const result = await dbActions.matchUser(creds.login, creds.password);
    if(!result) return { success: false, msg: "No such user" };
    creds.id = result.id;
    await setUserCookies(creds);

    return await generateAccessAndRefreshTokens(creds, 30*1000, 60*1000);
}