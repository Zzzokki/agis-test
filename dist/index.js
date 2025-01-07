"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const js_base64_1 = require("js-base64");
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.get("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    const { data } = yield axios_1.default.post(`https://sso.gov.mn/oauth2/token`, {
        grant_type: "authorization_code",
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI,
    }, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    const { access_token } = data;
    const { data: data2 } = yield axios_1.default.get("https://sso.gov.mn/oauth2/api/v1/service", {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
    res.send(data2);
}));
app.get("/trigger", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const x = [
        {
            services: ["WS100101_getCitizenIDCardInfo"],
            wsdl: "https://xyp.gov.mn/citizen-1.5.0/ws?WSDL",
            params: {
                WS100101_getCitizenIDCardInfo: {
                    regnum: "УК00301879",
                },
            },
        },
    ];
    const base64 = (0, js_base64_1.encode)(JSON.stringify(x));
    try {
        const url = `https://sso.gov.mn/oauth2/authorize?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&scope=${base64}&state=2`;
        res.redirect(url);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message,
            base: base64,
            a: process.env.CLIENT_ID,
            b: process.env.REDIRECT_URI,
        });
    }
}));
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=index.js.map