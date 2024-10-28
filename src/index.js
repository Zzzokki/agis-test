require("dotenv").config();

const { encode } = require("js-base64");
const { default: axios } = require("axios");
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/auth", (req, res) => {
  console.log(req);

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
    const { data } = await axios.get("https://sso.gov.mn/oauth2/authorize", {
      params: {
        response_type: "code",
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.REDIRECT_URI,
        scope: base64,
        state: "1",
      },
    });

    res.json(data);
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
