const express = require("express");
const history = require("connect-history-api-fallback");
const serveStatic = require("serve-static");
const port = process.env.PORT || 8080;

const app = express();

app.use(history());
app.use(serveStatic(__dirname + "/dist"));

app.listen(port, () => {
  console.log("server started " + port);
});
// const express = require('express');
// const serveStatic = require("serve-static")
// const path = require('path');
// app = express();
// app.use(serveStatic(path.join(__dirname, 'dist')));
// const port = process.env.PORT || 80;
// app.listen(port);
