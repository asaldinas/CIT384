import{ DB } from './connect.js';

import express from 'express';
import bodyParser from 'body-parser';
const app = express();
app.use(bodyParser.json());

app.get('/', (req, res)=> {
    res.status(200);
    res.send('Service is online');
});

app.get('/api', (req, res)=>{

    res.set('content-type', 'application/json');
    const sql = `SELECT * FROM users`;
    let data = {users: []}
    try{
        DB.all(sql, [], (err, rows)=>{
            if(err){
                throw err;
            }
            rows.forEach(row=> {
                data.users.push({id: row.Id, name:row.username, password:row.hashed_password});
            });
            let content = JSON.stringify(data);
            res.send(content);
        });
    }catch(err){
        console.log(err.message);
        res.status(467);
        res.send(`{"code":467, "status":"${err.message}"}`);
    }
});
app.post('/api', (req, res)=>{
    console.log(req.body);

    res.set('content-type', 'application/json');
    const sql = `INSERT INTO users(username, hashed_password) VALUES (? , ?)`;
    let newID;
    try{
        DB.run(sql, [req.body.name, req.body.password], function(err){
            if(err) throw err;
            newID = this.lastID;//provides the autoincrement integer user ID
            res.status(201);
            let data = { status: 201, message: `username ${newID} saved.`};
            let content = JSON.stringify(data);
            res.send(content);
        });
    }catch(err){
        console.log(err.message);
        res.status(468);
        res.send(`{"code":468, "status":"${err.message}"}`);
    }

});
app.delete('/api', (req, res)=>{});
app.listen(3000, (err) => {
    if (err) {
        console.log('ERROR: ', err.message);
    }
    console.log('LISTENING on port 3000')
})