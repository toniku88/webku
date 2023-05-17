import server from "./server/core.js";
const {app}=server;
app.listen(80, () => console.log('app listening on port 80!'));
