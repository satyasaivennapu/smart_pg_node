import mysql from 'mysql2/promise';

// Create a connection pool (recommended for performance)
const pool = mysql.createPool({
  host: '127.0.0.1',       // 🔹 your DB host
  user: 'root',            // 🔹 your DB username
  password: 'root',    // 🔹 your DB password
  database: 'smart_pg',// 🔹 your database name
  waitForConnections: true,
  connectionLimit: 10,     // adjust as needed
  queueLimit: 0
});

export default pool;
