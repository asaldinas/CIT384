// connect.js
import "dotenv/config";
import mysql from "mysql2/promise";

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Check your .env file and PlanetScale connection string."
  );
}

const pool = mysql.createPool(DATABASE_URL);

export default pool;
