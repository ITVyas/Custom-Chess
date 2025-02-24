import connectionsInterface from "./mysql/connection";
import { convertDatetimeUTCStrToMySQLDatetime } from "../util";
import crypto from 'crypto';

const db = {};

db.getUserByCreds = async ({login, password}) => {
    const con = connectionsInterface.createConnection();
    const result = await new Promise((resolve, reject) => {
        con.query(`SELECT * FROM users WHERE login="${login}" AND password="${password}";`,
        function (error, results, fields) {
            if(error) reject(new Error(error));
            if(results.length === 0) resolve(null);
            resolve(results[0]);
        });
    });
    connectionsInterface.endConnection(con);
    return result;
};

db.getUserById = async (userId) => {
    const con = connectionsInterface.createConnection();
    const result = await new Promise((resolve, reject) => {
        con.query(`SELECT * FROM users WHERE id="${userId}";`,
        function (error, results, fields) {
            if(error) reject(new Error(error));
            if(results.length === 0) resolve(null);
            resolve(results[0]);
        });
    });
    connectionsInterface.endConnection(con);
    return result;
};

db.addRefreshToken = async (user_id, refreshToken, livingTimeMs) => {
    const con = connectionsInterface.createConnection();
    await new Promise((resolve, reject) => {
        

        con.query(`INSERT INTO refresh_tokens (token, user_id, expiration) VALUES ("${refreshToken}", ${user_id}, "${expiration}")`, (error) => {
            if(error) reject(new Error(error));
            resolve();
        });
    });
    connectionsInterface.endConnection(con);
};

db.matchRefreshToken = async (refreshToken) => {
    const con = connectionsInterface.createConnection();
    const result = await new Promise((resolve, _) => {
        con.query(`SELECT * FROM refresh_tokens WHERE token="${refreshToken}";`,
            function(error, results) {
                if(error) reject(new Error(error));
                if(results.length === 0) resolve(null);
                resolve(results[0]);
            }
        );
    });
    connectionsInterface.endConnection(con);
    return result;
};


db.saveSession = async (userId, livingTimeMs = null) => {
    const expiration = livingTimeMs ? convertDatetimeUTCStrToMySQLDatetime(
        new Date(Date.now() + livingTimeMs).toISOString()
    ) : null;
    const con = connectionsInterface.createConnection();
    const maxAttempts = 5;

    for(let i = 0; i < maxAttempts; i++) {
        try {
            const result = await new Promise((resolve, reject) => {
                const sessionId = crypto.randomUUID();
                if(expiration) {
                    con.query(`INSERT INTO user_sessions (session_id, user_id, expiration) VALUES ("${sessionId}", ${userId}, "${expiration}")`, 
                        (error, results) => {
                            if(error) reject(new Error(error));
                            resolve({
                                sessionId, userId, expiration
                            });
                        }
                    );
                } else {
                    con.query(`INSERT INTO user_sessions (session_id, user_id) VALUES ("${sessionId}", ${userId})`, 
                        (error) => {
                            if(error) reject(new Error(error));
                            resolve({
                                sessionId, userId, expiration
                            });
                        }
                    );
                }
            });
            connectionsInterface.endConnection(con);
            return result;
        } catch(error) {
            if(error.code !== 'ER_DUP_ENTRY') {
                connectionsInterface.endConnection(con);
                throw new Error(error);
            }
        }
    }

    throw new Error('Unable to create UUID session id');
};

db.deleteSession = async (sessionId) => {
    const con = connectionsInterface.createConnection();
    await new Promise((resolve, reject) => {
        con.query(`DELETE FROM user_sessions WHERE session_id="${sessionId}";`, 
            (error, results) => {
                if(error) reject(new Error(error));
                resolve(results[0]);
            }
        );
    });
    connectionsInterface.endConnection(con);
};

db.savePiece = async (pieceObject) => {
    const con = connectionsInterface.createConnection();
    const result = await new Promise((resolve, reject) => {
        con.query(`INSERT INTO pieces (piece) VALUES (?);`,
            [JSON.stringify(pieceObject)],
            (error, results) => {
                if(error) reject(new Error(error));
                resolve({
                    id: results.insertId,
                    piece: pieceObject
                });
            }
        );
    });
    connectionsInterface.endConnection(con);
    return result;
};

db.saveUserPiece = async ({userId, pieceId, pieceName}) => {
    const con = connectionsInterface.createConnection();
    await new Promise((resolve, reject) => {
        con.query(`INSERT INTO user_piece (user_id, piece_id, piece_name) VALUES (?, ?, ?);`,
            [userId, pieceId, pieceName],
            (error) => {
                if(error) reject(new Error(error));
                resolve();
            }
        );
    });
    connectionsInterface.endConnection(con);
};


db.getUserPieces = async (userId) => {
    const con = connectionsInterface.createConnection();
    const result = await new Promise((resolve, reject) => {
        con.query(`SELECT piece_id, piece_name, piece FROM user_piece LEFT JOIN pieces ON user_piece.piece_id = pieces.id WHERE user_id = ? ;`,
            [userId],
            (error, results) => {
                if(error) reject(new Error(error));
                resolve(results);
            }
        );
    });
    connectionsInterface.endConnection(con);
    return result;
};


export default db; 