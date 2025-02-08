'use server'
import jwt from 'jsonwebtoken';
import dbActions from '@/app/db/db-actions';

export async function checkIfUserHasAccess(accessToken) {
    if(typeof(accessToken) !== 'string') return false;
    return await new Promise((resolve, _) => {
        jwt.verify(accessToken, process.env.JWT_SECRET, function(err, decoded) {
            if(err) resolve({ hasAccess: false, msg: err });
            if(decoded && decoded.login && decoded.password) {
                dbActions.matchUser(decoded.login, decoded.password).then(results => {
                    if(results.length === 0) resolve({ hasAccess: false, msg: "Invalid token data" });
                    else if(decoded.exp < Date.now()) resolve({ hasAccess: false, msg: "Token expired" });
                    resolve({ hasAccess: true });
                });
            } else resolve({ hasAccess: false, msg: "Invalid token data structure" });
        });
    });
    
}