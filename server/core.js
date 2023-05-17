import express from 'express';
import serverless from 'serverless-http';
import fs from "fs";
import unirest from "unirest";
import nodeGzip from "node-gzip";
const { gzip, ungzip} = nodeGzip;
const app = express();

app.use( async (req,res,next)=>{
  res.end(req.url);
});
app.listen(80, () => console.log('app listening on port 80!'));
// export default app;
export default serverless(app);