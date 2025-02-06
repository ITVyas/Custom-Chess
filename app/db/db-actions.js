import connectionInterface from "./mysql/connection";
import { formatDate } from "../util";

const dbActions = {};

dbActions.matchUser = async (login, password) => {
    return new Promise((resolve, reject) => {
        connectionInterface.get().query(`SELECT * FROM users WHERE login="${login}" AND password="${password}";`,
        function (error, results, fields) {
            if(error) reject(new Error(error));
            resolve(results);
        });
    });
};

dbActions.addRefreshToken = async (user_id, refreshToken, livingTimeMs) => {
    return new Promise((resolve, reject) => {
        const expiration = formatDate(Date.now() + livingTimeMs);

        connectionInterface.get().query(`INSERT INTO refresh_tokens (token, user_id, expiration) VALUES ("${refreshToken}", ${user_id}, "${expiration}")`, (error) => {
            if(error) reject(error);
            resolve();
        });
    });
};



export default dbActions;