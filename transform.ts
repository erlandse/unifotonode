import fetch from 'node-fetch';
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

export function setConnection(conn) {
  connection = conn;
}



export async function updatePostInPostgres(content) {
  let sqlstring = "update usd_uio.billedbase set jsonfield=$molle$" + JSON.stringify(content.content) + "$molle$ WHERE usd_uio.billedbase.id=" + content.foto_kort_id;
  let q = await connection.query(sqlstring);
  let t = await writeElastic(content);
  let p: any = new Object();
  p.postgres = q;
  p.elastic = t;
  return JSON.stringify(p);
}

export async function insertRow(rowData, id) {
  let sqlString = "insert into usd_uio.billedbase(id,jsonfield) VALUES(" + id + ",$molle$" + JSON.stringify(rowData, null, 2) + "$molle$)";
  let q = await connection.query(sqlString);
  return q;
}

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

async function writeElastic(body) {
  try {
    const mitObjekt = {
      method: 'POST',
      body: JSON.stringify(body.content,null,2),
      headers: {
        'Accept': 'application/json, text/plain',
        'Content-Type': 'application/json'
      }

    };
    const result = await fetch('http://itfds-prod03.uio.no/elasticapi/unifotobase/billede/'+body.foto_kort_id, (mitObjekt));

    var answer = await result.text();
  }
  catch (error) {
    console.log("error: " + error);
  }
  await refreshIndex();
  return JSON.parse(answer);
}


async function refreshIndex(){
  try {
    const mitObjekt = {
      method: 'POST',
      body: "{}",
      headers: {
        'Accept': 'application/json, text/plain',
        'Content-Type': 'application/json'
      }

    };
    const result = await fetch('http://itfds-prod03.uio.no/elasticapi/unifotobase/_refresh', (mitObjekt));

    var answer = await result.text();
  }
  catch (error) {
    console.log("error: " + error);
  }
  return JSON.parse(answer);
}







export async function deletePost(content) {
  let sqlstring = "delete from usd_uio.billedbase where usd_uio.billedbase.id=" + content.foto_kort_id;
  let q = await connection.query(sqlstring);
  let t = await deleteElastic(content);
  await refreshIndex();
  let p: any = new Object();
  p.postgres = q;
  p.elastic = t;
  return JSON.stringify(p);
}


async function deleteElastic(body) {
  try {
    const mitObjekt = {
      method: 'DELETE',
      body: "{}",
      headers: {
        'Accept': 'application/json, text/plain',
        'Content-Type': 'application/json'
      }

    };
    const result = await fetch('http://itfds-prod03.uio.no/elasticapi/'+ body.resturl, (mitObjekt));
    var answer = await result.text();
  }
  catch (error) {
    console.log("error: " + error);
  }
  return JSON.parse(answer);
}


export async function postElastic(body) {
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
export async function getCall(fullUrl:string,req,res) {
  let pos=fullUrl.indexOf("40000/");
  let resturl= fullUrl.substr(pos+6);
  if(resturl.startsWith("/") == true)
    resturl = resturl.substr(1);
  try {
    const mitObjekt = {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain',
        'Content-Type': 'application/json'
      }

    };
    const result = await fetch('http://itfds-prod03.uio.no/elasticapi/'+resturl, (mitObjekt));
    var answer = await result.text();
  }
  catch (error) {
    console.log("error: " + error);
  }
  return JSON.parse(answer);
}