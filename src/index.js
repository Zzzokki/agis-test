require("dotenv").config();

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
  var base64;

  try {
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

    base64 = btoa(JSON.stringify(x));

    const { data } = await axios.get(
      "https://www.sso.gov.mn/oauth2/authorize",
      {
        params: {
          response_type: "code",
          client_id: process.env.CLIENT_ID,
          redirect_uri: process.env.REDIRECT_URI,
          scope: base64,
          state: "1",
        },
      }
    );

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
      base64,
      a: process.env.CLIENT_ID,
      b: process.env.REDIRECT_URI,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
