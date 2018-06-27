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
const node_fetch_1 = require("node-fetch");
let connection = null;
let index = -1;
let rows = null;
/*
var objectKeys = {
  "dokId": {
    "type": "integer"
  },
  "alledata":{
    "type":"text",
    "fielddata": true,
    "analyzer":"standard"
  },
  "persondata": {
    "type": "text",
    "analyzer": "norwegian"
  },
  "foto_kort_id": {
    "type": "integer",
    "store": true
  },
  "fra_År": {
    "type": "integer"
  },
  "til_År": {
    "type": "integer"
  },
  "sted": {
    "type": "text",
    "analyzer": "norwegian"
  },
  "motiv": {
    "type": "text",
    "analyzer": "norwegian"
  },
  "tema": {
    "type": "keyword",
    "store": true
  },
  "mediagruppe_enhets_id": {
    "type": "integer"
  },

  "datering_dato": {
    "type": "date",
    "format": "dd.MM.yyyy",
    "store": true
  },
  "fotograf": {
    "type": "text",
    "analyzer": "norwegian"
  },

  "annen_info": {
    "type": "text",
    "analyzer": "norwegian"
  },
  "kan_webpubliseres": {
    "type": "keyword",
    "store": true
  }
}

*/
function setConnection(conn) {
    connection = conn;
}
exports.setConnection = setConnection;
function updatePostInPostgres(content) {
    return __awaiter(this, void 0, void 0, function* () {
        let sqlstring = "update usd_uio.billedbase set jsonfield=$molle$" + JSON.stringify(content.content) + "$molle$ WHERE usd_uio.billedbase.id=" + content.foto_kort_id;
        let q = yield connection.query(sqlstring);
        let t = yield writeElastic(content);
        let p = new Object();
        p.postgres = q;
        p.elastic = t;
        return JSON.stringify(p);
    });
}
exports.updatePostInPostgres = updatePostInPostgres;
function insertRow(rowData, id) {
    return __awaiter(this, void 0, void 0, function* () {
        let sqlString = "insert into usd_uio.billedbase(id,jsonfield) VALUES(" + id + ",$molle$" + JSON.stringify(rowData, null, 2) + "$molle$)";
        let q = yield connection.query(sqlString);
        return q;
    });
}
exports.insertRow = insertRow;
/*
async function fwriteElastic(body) {
  var formData: any = new Object();
  formData.elasticdata = JSON.stringify(body.content);
  formData.id = body.foto_kort_id;
  let bodyContent = JSON.stringify(formData);
  try {
    const mitObjekt = {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Accept': 'application/json, text/plain',
        'Content-Type': 'application/json'
      }

    };
    const result = await fetch('http://itfds-prod03.uio.no/node/BilledUpdate', (mitObjekt));

    var answer = await result.text();
  }
  catch (error) {
    console.log("error: " + error);
  }
  return JSON.parse(answer);
}
*/
function writeElastic(body) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const mitObjekt = {
                method: 'POST',
                body: JSON.stringify(body.content, null, 2),
                headers: {
                    'Accept': 'application/json, text/plain',
                    'Content-Type': 'application/json'
                }
            };
            const result = yield node_fetch_1.default('http://itfds-prod03.uio.no/elasticapi/unifotobase/billede/' + body.foto_kort_id, (mitObjekt));
            var answer = yield result.text();
        }
        catch (error) {
            console.log("error: " + error);
        }
        yield refreshIndex();
        return JSON.parse(answer);
    });
}
function refreshIndex() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const mitObjekt = {
                method: 'POST',
                body: "{}",
                headers: {
                    'Accept': 'application/json, text/plain',
                    'Content-Type': 'application/json'
                }
            };
            const result = yield node_fetch_1.default('http://itfds-prod03.uio.no/elasticapi/unifotobase/_refresh', (mitObjekt));
            var answer = yield result.text();
        }
        catch (error) {
            console.log("error: " + error);
        }
        return JSON.parse(answer);
    });
}
function deletePost(content) {
    return __awaiter(this, void 0, void 0, function* () {
        let sqlstring = "delete from usd_uio.billedbase where usd_uio.billedbase.id=" + content.foto_kort_id;
        let q = yield connection.query(sqlstring);
        let t = yield deleteElastic(content);
        yield refreshIndex();
        let p = new Object();
        p.postgres = q;
        p.elastic = t;
        return JSON.stringify(p);
    });
}
exports.deletePost = deletePost;
function deleteElastic(body) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const mitObjekt = {
                method: 'DELETE',
                body: "{}",
                headers: {
                    'Accept': 'application/json, text/plain',
                    'Content-Type': 'application/json'
                }
            };
            const result = yield node_fetch_1.default('http://itfds-prod03.uio.no/elasticapi/' + body.resturl, (mitObjekt));
            var answer = yield result.text();
        }
        catch (error) {
            console.log("error: " + error);
        }
        return JSON.parse(answer);
    });
}
function postElastic(body) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const mitObjekt = {
                method: 'POST',
                body: JSON.stringify(body.elasticdata, null, 2),
                headers: {
                    'Accept': 'application/json, text/plain',
                    'Content-Type': 'application/json'
                }
            };
            const result = yield node_fetch_1.default('http://itfds-prod03.uio.no/elasticapi/' + body.resturl, (mitObjekt));
            var answer = yield result.text();
        }
        catch (error) {
            console.log("error: " + error);
        }
        return JSON.parse(answer);
    });
}
exports.postElastic = postElastic;
/*
export async function getElastic(body) {
  try {
    const mitObjekt = {
      method: 'POST',
      body: JSON.stringify(body.elasticdata,null,2),
      headers: {
        'Accept': 'application/json, text/plain',
        'Content-Type': 'application/json'
      }

    };
    const result = await fetch('http://itfds-prod03.uio.no/elasticapi/'+body.resturl, (mitObjekt));

    var answer = await result.text();
  }
  catch (error) {
    console.log("error: " + error);
  }
  return JSON.parse(answer);
}
*/
function getCall(fullUrl, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let pos = fullUrl.indexOf("40000/");
        let resturl = fullUrl.substr(pos + 6);
        if (resturl.startsWith("/") == true)
            resturl = resturl.substr(1);
        try {
            const mitObjekt = {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain',
                    'Content-Type': 'application/json'
                }
            };
            const result = yield node_fetch_1.default('http://itfds-prod03.uio.no/elasticapi/' + resturl, (mitObjekt));
            var answer = yield result.text();
        }
        catch (error) {
            console.log("error: " + error);
        }
        return JSON.parse(answer);
    });
}
exports.getCall = getCall;
//# sourceMappingURL=transform.js.map