import { config } from "dotenv";

config();

import { encode } from "js-base64";
import axios from "axios";
import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/auth", async (req, res) => {
  console.log("hi");
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

  console.log(data);

  const { access_token } = data;

  const { data: data2 } = await axios.get(
    "https://sso.gov.mn/oauth2/api/v1/service",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  res.send(data2);
});

app.get("/trigger", async (req, res) => {
  const x = [
    {
      services: ["WS100103_getCitizenAddressInfo"],
      wsdl: "https://xyp.gov.mn/citizen-1.5.0/ws?WSDL",
      params: {
        WS100103_getCitizenAddressInfo: {
          regnum: "УК00301879",
        },
      },
    },
  ];

  const base64 = encode(JSON.stringify(x));

  try {
    const url = `https://sso.gov.mn/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=${base64}&state=adgad`;

    res.redirect(url);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
