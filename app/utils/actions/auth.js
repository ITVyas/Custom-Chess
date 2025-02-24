'use server';
import { cookies } from "next/headers";
import db from "../db/db";
import { redirect } from "next/navigation";

const SESSION_COOKIES_KEY = 'cch-session';
const SESSION_COOKIES_PARAMS = {
    httpOnly: true,
    sameSite: 'strict',
    secure: false
};

const saveSession = async (cookieStore, session) => {
    if(session.sessionId) {
        cookieStore.set(SESSION_COOKIES_KEY, JSON.stringify(session), SESSION_COOKIES_PARAMS);
    } else {
        const sessionId = (await db.saveSession(session.userId)).sessionId;
        session.sessionId = sessionId;
        cookieStore.set(SESSION_COOKIES_KEY, JSON.stringify(session), SESSION_COOKIES_PARAMS);
    }
};

const destroySession = (cookieStore, session) => {
    if(cookieStore.has(SESSION_COOKIES_KEY)) {
        cookieStore.delete(SESSION_COOKIES_KEY);
    }
    db.deleteSession(session.sessionId);
};


export async function getSession() {
    const cookieStore = await cookies();
    let session = {};

    if(cookieStore.has(SESSION_COOKIES_KEY)) {
        const cookieSession = JSON.parse(cookieStore.get(SESSION_COOKIES_KEY).value);
        Object.entries(cookieSession).forEach(([key, value]) => session[key] = value);
    }
    return session;
}

export async function login(formData) {
    const cookieStore = await cookies();
    const login = formData.get('login');
    const password = formData.get('password');

    const user = await db.getUserByCreds({login, password});
    if(!user) return {error: "Wrong Credentials"};

    const session = await getSession();
    session.userId = user.id;
    session.login = user.login;

    await saveSession(cookieStore, session);
    redirect("/");
}

export async function logout() {
    const session = await getSession();
    const cookieStore = await cookies();

    destroySession(cookieStore, session);
    redirect("/signin");
}