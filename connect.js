import sqlite3 from "sqlite3";
const sql3 = sqlite3.verbose();

//const DB = new sql3.Database('memory:', sqlite3.OPEN_READWRITE, connected); //create DB in memory while node is running, shut down when node is not running
//const DB = new sql3.Database('', sqlite3.OPEN_READWRITE, connected); //anonymous file
const DB = new sql3.Database('./data.db', sqlite3.OPEN_READWRITE, connected);//actual db file

function connected(err){
    if(err){
        console.log(err.message);
        return;
    }

console.log("Created the DB or SQlite DB does already exist");
}

let sql = `CREATE TABLE IF NOT EXISTS users(
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`;
DB.run(sql, [], (err)=>{
    //callback function
    if (err) {
         console.log('error creating users table');
         return;
}
    console.log('CREATED TABLE')
}); //inserting, updating, creating, deleting info inside the db

export {DB};