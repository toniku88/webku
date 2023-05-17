import express from 'express';
import serverless from 'serverless-http';
import fs from "fs";
import unirest from "unirest";
import nodeGzip from "node-gzip";
const { gzip, ungzip} = nodeGzip;
const app = express();

const curlContent = async (id)=>{
  return new Promise((resolve,reject)=>{
    const api_db = "http://"+process.env["serverDb"]+"/get?key="+process.env["key"]+"&target=content&file="+id;
    let testCurl = unirest.request({
      uri:api_db,
      headers: headerDafult,
      gzip: true
    }).on('error', error => {
      resolve("err");
    });
    testCurl.on('response',(response)=>{
      try{
        testCurl.destroy();
        let backSend={};
        backSend.headers = response.headers;
        backSend.code = response.statusCode;
        resolve(backSend);
      }catch(e){
        resolve("err");
      }
    });
  });
};

app.use( async (req,res,next)=>{
  if(req.path.indexOf("/tugas/")==0){
    const path = req.path.split("/tugas/")[1];
    if(path){
      const data = await curlContent(path);
      console.log(data);
      res.end(path);
    };
  };
});

export default app;
export const handler = serverless(app);
