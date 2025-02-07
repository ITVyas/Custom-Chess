import connectionInterface from "./mysql/connection";
import { convertDatetimeUTCStrToMySQLDatetime } from "../util";

const dbActions = {};

dbActions.matchUser = async (login, password) => {
    return new Promise((resolve, reject) => {
        connectionInterface.get().query(`SELECT * FROM users WHERE login="${login}" AND password="${password}";`,
        function (error, results, fields) {
            if(error) reject(new Error(error));
            if(results.length === 0) resolve(null);
            resolve(results[0]);
        });
    });
};

dbActions.matchUserById = async (userId) => {
    return new Promise((resolve, reject) => {
        connectionInterface.get().query(`SELECT * FROM users WHERE id="${userId}";`,
        function (error, results, fields) {
            if(error) reject(new Error(error));
            if(results.length === 0) resolve(null);
            resolve(results[0]);
        });
    });
};

dbActions.addRefreshToken = async (user_id, refreshToken, livingTimeMs) => {
    return new Promise((resolve, reject) => {
        const expiration = convertDatetimeUTCStrToMySQLDatetime(
            new Date(Date.now() + livingTimeMs).toISOString()
        );

        connectionInterface.get().query(`INSERT INTO refresh_tokens (token, user_id, expiration) VALUES ("${refreshToken}", ${user_id}, "${expiration}")`, (error) => {
            if(error) reject(new Error(error));
            resolve();
        });
    });
};

dbActions.matchRefreshToken = async (refreshToken) => {
    return new Promise((resolve, _) => {
        connectionInterface.get().query(`SELECT * FROM refresh_tokens WHERE token="${refreshToken}";`,
            function(error, results) {
                if(error) reject(new Error(error));
                if(results.length === 0) resolve(null);
                resolve(results[0]);
            }
        );
    });
};



export default dbActions;