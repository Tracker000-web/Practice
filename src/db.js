const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Benito1997!',
    database: 'my_crm_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL Connection Failed:', err.message);
    } else {
        console.log('✅ Connected to MySQL Pool!');
        connection.release();
    }
});

// Export the promise-based pool
module.exports = pool.promise();