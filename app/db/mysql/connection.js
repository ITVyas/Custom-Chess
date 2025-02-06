import mysql from 'mysql';

const connectionInterface = (() => {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'chess_custom',
        insecureAuth : true
    });

    connection.connect(function(err) {
        if (err) {
          console.error('error connecting: ' + err.stack);
          return;
        }
       
        console.log('connected as id ' + connection.threadId);
    });
    
    return {
        get: () => connection
    };
})();

export default connectionInterface;