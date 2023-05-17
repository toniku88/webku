import express from 'express';
import serverless from 'serverless-http';
import fs from "fs";
import unirest from "unirest";
import nodeGzip from "node-gzip";
const { gzip, ungzip} = nodeGzip;
const app = express();

const curlContent = async (id)=>{
  return new Promise((resolve)=>{
    const api_db = "http://"+process.env["serverDb"]+"/get?key="+process.env["key"]+"&target=content&file="+id;
    unirest.get(api_db).then((response) => {
      resolve(response.body);
    }).catch((e)=>{
       resolve("err");
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
