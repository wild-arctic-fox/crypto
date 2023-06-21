const express = require("express");
const crypto = require("crypto");
const axios = require("axios");
const colors = require("colors");

const port = 8807;
const app = express();

const BobPubKeyStr = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqt/KTJ4o2fS9wwidjyO5
jA5GdSJ/Y/M/zQQMHVnSEI6aU/sG+BPq4lcX1L14j53WjjESbkFO8QZjBSNhyz9p
8mr23WnipUinz8zXQUrAZD9Go6LXh6KauwpAwLaoIRsdjOaiLEr+T+CiSQ/X+P/3
njecCVLpyA6KD7lU4Lpq/apR1jE8CiNOuKaFOFbzDbXRTPHJ/iZAJoMrBSVSnsoq
/m2t7KCJk+SZtAE3G5pASMkeMaM+G1oEafWhmy8li8UR3K+XSddkJPaFXMvJqxxU
0RJqwS3tSV5kIAkQHNXMsE1ym3EZDA2XD0R5vO3Z0XdFwrfHx3FubX8jupzG6qVM
eQIDAQAB
-----END PUBLIC KEY-----`;

const AlisePubKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlB5TN9YJREOCc48Qw+5s
B6aJ9wliqT4ixTlYszrVGtKXuCQqgKk7v8Sg8D8SN+C6KzMzjJkJ65z+TK9jaF+0
O83FJb5w51PTx16G5sjYsWDV+RDlPfBXAKUhg3sMdJh34wbotPZ3Gvh0w/UYLIoq
KbK28URxS+C0IZmbiAfXOOgSuDPoNDUp/pHSKBhWnNwThYucUTw6C1yCqJMh6lxD
gYOP3bjUoqEdbo11drMQiPQmpFWMoLy5ZWfwxwXYnAv5LvReseoiH9NZR3HR3IOt
OhSYV8wDHCLw7Vlhm6a+QV4+0adzZvPhmG/+14CVoyjnGvvKrEI0ocnKJ0q0Mof3
HwIDAQAB
-----END PUBLIC KEY-----`;

// ////////////////////////////////////////////
// Super Private Storage

const AlisePrivateKeyStr = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCUHlM31glEQ4Jz
jxDD7mwHpon3CWKpPiLFOVizOtUa0pe4JCqAqTu/xKDwPxI34LorMzOMmQnrnP5M
r2NoX7Q7zcUlvnDnU9PHXobmyNixYNX5EOU98FcApSGDewx0mHfjBui09nca+HTD
9RgsiiopsrbxRHFL4LQhmZuIB9c46BK4M+g0NSn+kdIoGFac3BOFi5xRPDoLXIKo
kyHqXEOBg4/duNSioR1ujXV2sxCI9CakVYygvLllZ/DHBdicC/ku9F6x6iIf01lH
cdHcg606FJhXzAMcIvDtWWGbpr5BXj7Rp3Nm8+GYb/7XgJWjKOca+8qsQjShycon
SrQyh/cfAgMBAAECggEAP3dc/hxavSLWN1DShLnZFVAhZrZhTZZ/zJVdcfLgFE2v
T+pDQf0BypJkyXylAEdtTgxy5qg+rXQILPCr/jGf504szxbyhtSO9qsEz8e4vgx5
su6v46HjjbW0DgQAGsen+yHfPYcsEuTqF3siQBd1qIdYxzml+DbQyGLq11dQu6Ni
Txz5CyR2frqyedR2+CR0+SH6u2jPsaW2Fyp0uao8ybNzt9hKRtyClWyJLFonSu5k
emQOTq9BXQg26PbpxgLw2kK5+4EDFwatBEwX5x1EG04XPIMgk7LqiNfQ70Zy9j/p
V8L+aSltcd5nPt+sR8FqJ9i2R6EUmwYVtCflL1x+0QKBgQDH4CmWDFlFBGcTt14I
YwT3eAg53iWrWKQ4LjEKvpD4fGfnSE4KPJ0Q/UCpTyaC7yePhroL12LZ/vch/S4W
P4PobpYEPEmz+sRp5MVokdoiaCbgXvid+rYDrIgkzYP41E9o32ABzVDxunEi+A1G
rJiTcdVNsM9STKpDjaPDfBGKkQKBgQC9tafRUEyFUoxHDqsn9GNj91C+oC59ytMF
unrHTByf7zsyep/L3pFD91TlfWF7U4rk8+njUW80VGq+9fxTwiPcLP95F8Bb/BUl
wWQcy3FFDoXiI3pLvRdgiAIP3+U+M6h+u8h/VRxNNgdYWoyCVZKCztfN2G8qxRVh
vZ/MkZlerwKBgEvzEvpQUO+X368vQ0z+i1mZw85xanD0qtoqOzpw9Vdmtni9EeJz
698TzKlJSUIBrE+uiy2Kt6ZMaw4ATa3ojrAYrWqImh0I0e/HHXhBy9i9KOCjVed5
6AX3XnhVm6tGybH5B1tH8FUaWnlGNo0/cm68l6gA4pbMSPqIbM0QbP3xAoGAdA9U
UcvMZKwxwa8JqvHqdFfzgAvDJZYWL6T8RD0eLgJPtvwqErFhMbF4sMVaA/cCPDu0
1SsW227ht14KNrvI8IRe7xhGyH+Z+HUt6CfWbicKZWTLBtbyHE5Y5JlXSAyWgqIj
cTMCk4IAUF9lIr9zWK9uezJ0IDhecmNuBdr1d2UCgYBf4XfeUSjCCqrHl169f+KW
c7vRGwgrblKzuZtn+VYYYzz0JjnDI4eCKImLGhVTGVPJhg25+LzOxPlJ/gK51V4o
glMoXPcy/+bKl+I2O7CFO33GVD9dMsCMv07IWkmrhIcDsm2e1ydQecYNlLa5Ct8y
eOUIXytgCpvjZG2ANYrRlA==
-----END PRIVATE KEY-----`;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/send/message", async (req, res) => {
  // get message that need to be encrypted
  const message = req.query.message;
  const BobPubKey = crypto.createPublicKey(BobPubKeyStr);
  const AlisePrivateKey = crypto.createPrivateKey(AlisePrivateKeyStr);

  // encrypt message with Bob`s PubKey and send to Bob
  const encryptedData = crypto.publicEncrypt(
    {
      key: BobPubKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(message)
  );

  console.log(colors.green(`Encrypted by Bob's Public Key:`));
  console.log(colors.green(encryptedData.toString("base64")));

  console.log(colors.blue(`Alise Public Key:`));
  console.log(colors.blue(AlisePubKey));

  // send encrypted message and Alise`s Public Key
  const result = await axios({
    url: "http://127.0.0.1:8811/handle/message",
    method: "post",
    data: {
      container: encryptedData.toString("base64"),
      alisePubKey: AlisePubKey,
    },
  });

  console.log(
    colors.yellow(`Receive confirmation encrypted by Alises's Public Key:`)
  );
  console.log(colors.yellow(result.data.confirmation));

  const conf = result.data.confirmation;

  // decrypt confirmation with Alise`s Private Key
  const decryptedConf = crypto.privateDecrypt(
    {
      key: AlisePrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(conf, "base64")
  );

  console.log(colors.rainbow(`Decrypted message:`));
  console.log(colors.rainbow(decryptedConf.toString()));

  // compare initial message
  res.json({ success: decryptedConf.toString() === message });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
