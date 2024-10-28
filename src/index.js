require("dotenv").config();

const { encode } = require("js-base64");
const { default: axios } = require("axios");
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/auth", (req, res) => {
  const data = JSON.stringify(req.query, null, 2);
  const filePath = path.join(__dirname, "request_data.json");

  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error("Error writing to file", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    console.log("Request data written to file");
  });

  res.send("Hello");
});

app.post("/trigger", async (req, res) => {
  const x = [
    {
      services: ["WS100101_getCitizenIDCardInfo"],
      wsdl: "https://xyp.gov.mn/citizen-1.5.0/ws?WSDL",
      params: {
        WS100101_getCitizenIDCardInfo: {
          regnum: "УХ96091670",
        },
      },
    },
  ];

  const base64 = encode(JSON.stringify(x));

  try {
    const url = `https://sso.gov.mn/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=${base64}&state=1`;

    res.json({
      url,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
      base: base64,
      a: process.env.CLIENT_ID,
      b: process.env.REDIRECT_URI,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
