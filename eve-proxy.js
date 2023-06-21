const crypto = require("crypto");
const http = require("http");
const connect = require("connect");
const colors = require("colors");
const bodyParser = require("body-parser");
const httpProxy = require("http-proxy");
const proxy = httpProxy.createProxyServer({});

// ////////////////////////////////////////////
// Super Private Storage

const EvePrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDPeTSOTgq7QhcS
H2gAsTXeeK4Amh5bDwOY0Cgg4yYBF7Met9U7WqNw16CWnEdYm7PbVU0Mln6tPOxT
EVjVaR+ajfSgse5ePCi+LB0Vz+0wErQ5FMYQ/MI2D6Uej+C/o6fxKWZsruhwm2Dw
XL6cwhS1OGVaaWtFPwMxJM2LOAEQTy0o50oSHX23Oy2kIfbwdwUs5YgVRzPRxZI5
rDQnCihiZNcWAGWA8KECw/8IBOZLEr/Qu5ujabkLsLvaXldwpDbjse2lU761hnbM
y2UjITc3eX4MMwGkSWg2uTQ5i5ji8ItrPIvFx0smoPgYOUiFsIYXJMIxAJQ0QPD9
uVir1RE7AgMBAAECggEAAMmCVeoaSPy0KNwWONEHNpqqeYlxfJ4zL9lkGr1wGqb1
AtD64+FyiAIoW04xapHeQk9IhKQV+WVDk7yo0p8qytbxkg4m2jCKr3mUCbGGgNM7
pw5dw+AzZfD567tuAwRMiXZLqNpNB5f8eeDkHMcekjGH+2YTkbCN2HrAtdzuMtuz
rAutAgAVo7URY6DXKnxJX9kogOoV/cNqaZF/PLJR938fY88zj5ObEd5+etUOJF8Q
W1S4dKOSD7aH1+44cs7z4z+Z6IJcRKvjfEGDj/jetSHTvjJxCMFCd3jG9c2Sd1yT
muaTCB5fhafsO+a5HHrxNTPBSQBme+6hp6CgXEWmAQKBgQDqFuKoqexfR3V7LdG/
8Kz8zDFZnPnAAIr1I3avCH71iYCPDc7NenNHcH+XvsKxv+/inImmIdqGjysX2aZ4
XMCKRp+H6qO9iJCD+NLXZJglQ0XGUrgTCjNc3d1TdboX8o+6FKYxGHrgKYZ0rsx1
7sURvpC6jVF7XJD0i07lz17EOwKBgQDi5JBwRlOUko2Wp+ifM1QeP8IHCs/B5oXS
LxS6WAnXOFJzAFUE7p1m+GqHGJeG4fsmg/cmPFJTXrH6+U7aSfm+5KmEHTSAMX1T
b+VuLF66vBOzToiyP8ZyYD/ly8I3p7bVZl9gHjovysSZa40jfQianLqm+NKQUhyW
EZMG1i8XAQKBgQDBLV+g9pFU04C0xUwZzIDFIbD8FdnYw9nokHqJ2UYEVJOd+jQW
R53Ib6Mr08WRsCZDaREC418VuiJCzV9eZpSRx9Qw8sZrS76O2hEMpTwVTB3Rm0PC
mqFmWsUh8b4/svE/C3lWfLAyOrJ1qiaakA9bJFsFSEfcuLf6xte2OFopLwKBgQCm
UFJL6lEDu/VLdKMAZ1iGn8ey78rgYADB078G5Ne5ydAt+hVX+yynuPolMvKHbYhy
cBMvFNJnyCcAR9T0D3ug4O4dKGc+fIhYK9JqUt3RVWG/cpaiyjrFxiWwZQ5lS2uq
u1K4GxAdzi0UJJEdbV5sLuxmzkdSgM3xdspmHYQBAQKBgCZC43hLDcdoR6D9mClf
JT/gJ8PHsC1es9rl0RWhb4YOtJhftR4REfy/X2xrvyKVhpMIEav8PZyIMZo9JQbf
Oy0h4l939MprXrT7UYABb6NGmrIaOPw11KLDd22joVrh0t18FK+mTjUpmeQDzzs3
RUhAgXCsw+RSfUQ2MH+oIufT
-----END PRIVATE KEY-----`;

const EvePubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAz3k0jk4Ku0IXEh9oALE1
3niuAJoeWw8DmNAoIOMmARezHrfVO1qjcNeglpxHWJuz21VNDJZ+rTzsUxFY1Wkf
mo30oLHuXjwoviwdFc/tMBK0ORTGEPzCNg+lHo/gv6On8SlmbK7ocJtg8Fy+nMIU
tThlWmlrRT8DMSTNizgBEE8tKOdKEh19tzstpCH28HcFLOWIFUcz0cWSOaw0Jwoo
YmTXFgBlgPChAsP/CATmSxK/0Lubo2m5C7C72l5XcKQ247HtpVO+tYZ2zMtlIyE3
N3l+DDMBpEloNrk0OYuY4vCLazyLxcdLJqD4GDlIhbCGFyTCMQCUNEDw/blYq9UR
OwIDAQAB
-----END PUBLIC KEY-----`;

// restream parsed body before proxying
proxy.on("proxyReq", function (proxyReq, req, res, options) {
  if (!req.body || !Object.keys(req.body).length) {
    return;
  }

  const contentType = proxyReq.getHeader("Content-Type");
  let bodyData;

  if (contentType === "application/json") {
    bodyData = JSON.stringify(req.body);
  }

  if (bodyData) {
    proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }
});

// temporal storage for Alise Public Key
let aliseKey = "";

// ///////////////////////////////////////////////
// MODIFY RESPONSE FROM BOB TO ALICE
// listen for the `proxyRes` event on `proxy`.
proxy.on("proxyRes", function (proxyRes, req, res) {
  let body = [];
  proxyRes.on("data", function (chunk) {
    body.push(chunk);
  });
  proxyRes.on("end", function () {
    body = Buffer.concat(body);

    console.log(colors.magenta("Received response from Bob to Alise:"));
    console.log(colors.magenta(body.toString()));

    const alisePubKey = crypto.createPublicKey(aliseKey);
    const EvePrivateKeys = crypto.createPrivateKey(EvePrivateKey);

    const jsonData = JSON.parse(body.toString());

    // decrypt message with Eve Private Key
    const decryptedConf = crypto.privateDecrypt(
      {
        key: EvePrivateKeys,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(jsonData.confirmation, "base64")
    );

    console.log(colors.rainbow("Decrypted message via Eve Private Key:"));
    console.log(colors.rainbow(decryptedConf.toString()));

    // encrypt message with Alise public Key and send
    const encryptedData = crypto.publicEncrypt(
      {
        key: alisePubKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(decryptedConf.toString())
    );

    const response = {
      confirmation: encryptedData.toString("base64"),
    };

    console.log(colors.yellow("Encrypted with Alise Public Key:"));
    console.log(colors.yellow(encryptedData.toString("base64")));

    res.end(Buffer.from(JSON.stringify(response)));
  });
});

//  Eve`s Http Proxy Server
const app = connect()
  .use(bodyParser.json())
  .use(function async(req, res) {
    // read request body that Alise sends Bob
    console.log(colors.green("Received Container:"));
    console.log(colors.green(req.body.container));

    console.log(colors.blue("Alise Public Key:"));
    console.log(colors.blue(req.body.alisePubKey));

    console.log(colors.red("Eve Public Key:"));
    console.log(colors.red(EvePubKey));

    // //////////////////////////////////////
    // MODIFY REQUEST FROM ALICE TO BOB

    // save Alise Public Key for future use
    aliseKey = req.body.alisePubKey;

    // replace Alise Public Key by Eve Public Key
    req.body = {
      alisePubKey: EvePubKey,
      container: req.body.container,
    };

    proxy.web(req, res, {
      target: "http://[::1]:8811",
      selfHandleResponse: true,
    });
  });
http.createServer(app).listen(6603, function () {
  console.log("proxy linsten 6603");
});
