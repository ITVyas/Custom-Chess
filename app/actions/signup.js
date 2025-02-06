'use server'

import dbActions from "../db/db-actions";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers'

export async function signup(formData) {
    const creds = {
        login: formData.get('login'),
        password: formData.get('password')
    };
    const results = await dbActions.matchUser(creds.login, creds.password);
    if(results.length === 0) return { success: false, msg: "No such user" };

    const refreshToken = crypto.randomUUID();
    const refreshTokenPromise = dbActions.addRefreshToken(results[0].id, refreshToken, 60*1000);
    const accessToken = jwt.sign(
        { 
            login: results[0].login, 
            password: results[0].password,
            exp: Date.now() + 30*1000
        },
        process.env.JWT_SECRET,
    );

    return await refreshTokenPromise.then(async () => {
        const cookieStore = await cookies();
        cookieStore.set({
            name: 'refreshToken',
            value: refreshToken,
            httpOnly: true,
            path: '/',
        });
        console.log(refreshToken, accessToken);
        return {
            success: true,
            accessToken: accessToken
        };
    }).catch((err) => {
        console.log(err);
        return { success: false, msg: err };
    });
}