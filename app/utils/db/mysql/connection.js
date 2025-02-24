import mysql from 'mysql';

const connectionsInterface = (() => {
    const sqlParams = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'chess_custom',
        insecureAuth : true,
        timezone: 'utc'
    };

    return {
        createConnection: () => {
            return mysql.createConnection(sqlParams);
        },

        endConnection: (con) => {
            con.end(function(err) {if(err) throw new Error(err)})
        }
    };
})();

export default connectionsInterface;