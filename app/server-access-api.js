'use server';
import { cookies } from "next/headers";
import dbActions from "./db/db-actions";
import { convertDateToInt, formatDate } from "./util";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export async function clearRefreshTokenFromCookie() {
    const cookieStore = await cookies();
    cookieStore.delete('refreshToken');
}

function generateRefreshToken() {
    return crypto.randomUUID();
}

function generateAccessToken(creds, livingTimeMs) {
    return jwt.sign(
        { 
            ...creds,
            exp: Date.now() + livingTimeMs
        },
        process.env.JWT_SECRET,
    );
}

export async function generateAccessAndRefreshTokens(creds, accessLivingTimeMs, refreshLivingTimeMs) {
    const refreshToken = generateRefreshToken();
    const refreshTokenPromise = dbActions.addRefreshToken(creds.id, refreshToken, refreshLivingTimeMs);
    const accessToken = generateAccessToken(creds, accessLivingTimeMs);

    return await refreshTokenPromise.then(async () => {
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'refreshToken',
            value: refreshToken,
            httpOnly: true,
            path: '/',
        });

        return {
            success: true,
            accessToken: accessToken,
        };
    }).catch((err) => {
        return { success: false, msg: err.message };
    });
}


const REFRESH_LIVING_TIME_MS = 60 * 1000;
const ACCESS_LIVING_TIME_MS = 30 * 1000;

export async function refreshAccessToken() {
    const cookieStore = await cookies();
   
    if(!cookieStore.has('refreshToken') || !cookieStore.has('userId')) return {
        success: false,
        msg: "No user or refresh token"
    }; 

    const refreshToken = cookieStore.get('refreshToken').value;
    const userId = cookieStore.get('userId').value;
    const user = await dbActions.matchUserById(userId);
    if(!user) {
        clearAllCookies();
        return {
            success: false,
            msg: "Stored userId is not matching any user"
        };
    }

    const result = await dbActions.matchRefreshToken(refreshToken);
    if(!result) return {
        success: false,
        msg: "No such refresh token found"
    };

    console.log(result.expiration);
    console.log(`Now: ${Date.now()}, Exp: ${Date.parse(result.expiration)}, Diff: ${(Date.now() - Date.parse(result.expiration))/1000/60}`);
    const timeDiff = Date.now() - Date.parse(result.expiration);
    if(timeDiff > 0) {
        return {
            success: false,
            msg: "Refresh token expired"
        };
    }

    return await generateAccessAndRefreshTokens(user, ACCESS_LIVING_TIME_MS, REFRESH_LIVING_TIME_MS);
}

export async function clearAllCookies() {
    const cookieStore = await cookies();
    cookieStore.getAll().forEach((cookie) => {
        cookieStore.delete(cookie.name);
    });
}