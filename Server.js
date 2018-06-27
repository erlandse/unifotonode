"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const tools = require("./tools");
const transform = require("./transform");
const pg = require("pg");
const requestIp = require('request-ip');
//import * as nf from 'node-fetch';
var app = express();
var result;
var message = "";
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, 'public')));
let pgConn = null;
var server = app.listen(40000, function () {
    var host = server.address().address;
    var port = server.address().port;
    openConnection();
    console.log("Listening at http://%s:%s", host, port);
    console.log(JSON.stringify(tools.dbConnection, null, 2));
});
function openConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        var pgPool = new pg.Pool(tools.dbConnection);
        const pgConn = yield pgPool.connect();
        try {
            transform.setConnection(pgConn);
            //    await transform.loadResultset("select * from usd_uio.hurtigsoek_data"); // where usd_uio.hurtigsoek_data.kan_webpubliseres='1'
            //    await transform.loadResultset("select * from usd_uio.hurtigsoek_data");
        }
        finally {
            /*    pgConn.release();
                await pgPool.end();
                process.exit()*/
        }
    });
}
app.post('/DeletePost', function (req, res) {
    //  console.log(JSON.stringify(req.body,null,2));
    deletePost(req, res);
    /*  let q= transform.updatePostInPostgres(req.body);
      console.log(q);
      res.send(q);*/
});
const deletePost = (req, res) => __awaiter(this, void 0, void 0, function* () {
    let q = yield transform.deletePost(req.body);
    res.send(q);
});
app.post('/savePost', function (req, res) {
    //  console.log(JSON.stringify(req.body,null,2));
    save(req, res);
    /*  let q= transform.updatePostInPostgres(req.body);
      console.log(q);
      res.send(q);*/
});
const save = (req, res) => __awaiter(this, void 0, void 0, function* () {
    let q = yield transform.updatePostInPostgres(req.body);
    res.send(q);
});
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
app.get('/*', function (req, res, next) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    get(fullUrl, req, res);
});
const get = (fullUrl, req, res) => __awaiter(this, void 0, void 0, function* () {
    let q = yield transform.getCall(fullUrl, req, res);
    res.send(q);
});
app.post('/PassPost', function (req, res) {
    //  console.log(JSON.stringify(req.body,null,2));
    postElastic(req, res);
    /*  let q= transform.updatePostInPostgres(req.body);
      console.log(q);
      res.send(q);*/
});
const postElastic = (req, res) => __awaiter(this, void 0, void 0, function* () {
    let q = yield transform.postElastic(req.body);
    res.send(q);
});
//# sourceMappingURL=Server.js.map