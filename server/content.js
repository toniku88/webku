import express from 'express';
import serverless from 'serverless-http';
import compression from 'compression';
import expressStaticGzip from 'express-static-gzip';
import fs from "fs";
import unirest from "unirest";
import nodeGzip from "node-gzip";
const { gzip, ungzip} = nodeGzip;
const app = express();

import curl from "../core/curl.js";

app.use( async (req,res,next)=>{
  res.end(req.url);
});

app.use(compression());

export default app;
export const handler = serverless(app);
