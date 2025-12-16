// test-pscale.js
import pool from "./connect.js";

const test = async () => {
  try {
    const [rows] = await pool.query("SHOW TABLES");
    console.log(rows);
  } catch (err) {
    console.error("Error:", err);
  }
};

test();
