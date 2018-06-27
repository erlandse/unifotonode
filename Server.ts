import * as path from 'path';

import * as express from "express";
import * as bodyParser from "body-parser";
import * as tools from './tools';
import * as transform from './transform';
import * as pg from 'pg';
import * as fs from 'fs';
const requestIp = require('request-ip');
//import * as nf from 'node-fetch';

var app = express();
var result;
import * as  ejs from 'ejs';
import * as najax from 'najax';
var message = "";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(path.join(__dirname, 'public')));

let pgConn = null;



var server = app.listen(40000, function () {

  var host = server.address().address
  var port = server.address().port
  openConnection();
  console.log("Listening at http://%s:%s", host, port);
  console.log(JSON.stringify(tools.dbConnection, null, 2));
})


async function openConnection() {
  var pgPool = new pg.Pool(tools.dbConnection);
  const pgConn = await pgPool.connect();
  try {
    transform.setConnection(pgConn);
//    await transform.loadResultset("select * from usd_uio.hurtigsoek_data"); // where usd_uio.hurtigsoek_data.kan_webpubliseres='1'
//    await transform.loadResultset("select * from usd_uio.hurtigsoek_data");
    
  } finally {
/*    pgConn.release();
    await pgPool.end();
    process.exit()*/

  }

}


app.post('/DeletePost', function (req, res) {
  //  console.log(JSON.stringify(req.body,null,2));
    deletePost(req,res);
  /*  let q= transform.updatePostInPostgres(req.body);
    console.log(q);
    res.send(q);*/
  
  })
  
  const deletePost = async (req,res) => {
    let q= await transform.deletePost(req.body);
    res.send(q);
   }
  

app.post('/savePost', function (req, res) {
//  console.log(JSON.stringify(req.body,null,2));
  save(req,res);
/*  let q= transform.updatePostInPostgres(req.body);
  console.log(q);
  res.send(q);*/

})


const save = async (req,res) => {
  let q= await transform.updatePostInPostgres(req.body);
  res.send(q);
 }


 /*
app.get('/test', function (req, res) {
//  console.log(JSON.stringify(req,null,2));
//  console.log(req.connection.remoteAddress);
  const clientIp = requestIp.getClientIp(req); 
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  res.send(fullUrl);  
//  res.send('Hello World!'+clientIp);
})
*/


app.get('/*', function (req,res,next) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    get(fullUrl,req,res);
  
  })
  
  const get = async (fullUrl,req,res) => {
    let q= await transform.getCall(fullUrl,req,res);
    res.send(q);
   }
  

app.post('/PassPost', function (req, res) {
  //  console.log(JSON.stringify(req.body,null,2));
    postElastic(req,res);
  /*  let q= transform.updatePostInPostgres(req.body);
    console.log(q);
    res.send(q);*/
  
  })
  

  const postElastic = async (req,res) => {
    let q= await transform.postElastic(req.body);
    res.send(q);
   }
  