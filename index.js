const express = require("express");
const app = express();
require("dotenv").config();

const router = require("./router/router");

const PORT = process.env.PORT;
app.use(express.json());

app.use(router);

app.listen(PORT, () => {
  console.log("server listening at port " + PORT);
});
