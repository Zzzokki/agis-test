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

app.get("/auth", async (req, res) => {
  const { code } = req.query;

  const { data } = await axios.post(
    `https://sso.gov.mn/oauth2/token`,
    {
      grant_type: "authorization_code",
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token } = data;

  const { data: data2 } = await axios.get(
    "https://sso.gov.mn/oauth2/api/v1/service",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const { image } = data2[0];

  res.send(
    `<img src="data:image/png;base64, ${image}" style="width:300px;height:300px"  />`
  );
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
    const url = `https://sso.gov.mn/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=${base64}&state=2`;

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
