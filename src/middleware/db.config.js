import mysql from 'mysql2/promise';

// Create a connection pool (recommended for performance)
const pool = mysql.createPool({
  host: 'bank.c1ee6g068mq3.ap-south-1.rds.amazonaws.com',       // 🔹 your DB host
  user: 'admin',            // 🔹 your DB username
  password: 'Pass#coperative321$',    // 🔹 your DB password
  database: 'bank',// 🔹 your database name
  waitForConnections: true,
  connectionLimit: 10,     // adjust as needed
  queueLimit: 0
});

export default pool;
