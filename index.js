const express = require("express");
const app = express();
require("dotenv").config();

const router = require("./router/router");
const { configLoader } = require("./core/loadConfig");

const PORT = process.env.PORT;
app.use(express.json());

configLoader
  .init()
  .then((data) => {
    console.log("Config loaded successfully.");

    app.use(router);

    app.listen(PORT, () => {
      console.log("server listening at port " + PORT);
    });
  })
  .catch((e) => {
    console.error("Error loading config file:", e);
  });
