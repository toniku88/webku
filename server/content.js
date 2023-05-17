import express from 'express';
import serverless from 'serverless-http';
import fs from "fs";
import unirest from "unirest";
import nodeGzip from "node-gzip";
const { gzip, ungzip} = nodeGzip;
const app = express();

const curlLink = async (url)=>{
  return new Promise((resolve,reject)=>{
    let testCurl = unirest.request({
      uri:url,
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
      await res.write(String(process.env));
      res.end(path);
    };
  };
});

export default app;
export const handler = serverless(app);
