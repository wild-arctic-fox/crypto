const express = require("express");
const crypto = require("crypto");
const colors = require("colors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 8811;

// Not used, but leave it here
// const BobPubKey = `-----BEGIN PUBLIC KEY-----
// MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQB4w8hQKKiZnaGxdKVzYp62
// R35P0LzWHJRTx0RR8g8b8iEGciBCNVratlkIAjtN7tftffXMv48+hIQ+9ZrYU1Ua
// WAL54XJCCwZdCtugDJUACBoC2/1oQq8WlkxqMmW1VGfp5VDca+TRXQt0z658brzp
// rZDr7Oc/kpFnaYM2WdVYiYKOa/YCvZUfMURIV3nuc0OGbPwrKxbJWBETNZ4OkoUj
// PAt/Ha63Xz3nwSwI/Esbbg/q6kHIsS+ua85NmSY5LEWxUUWbtIMPH2PQHMUHVXwM
// u7zfwmpiMn7wgKpAK1aHD5uOWpmmng45mZoPrtnk/6EuYwjuVJdB+JTghNcjqfu/
// AgMBAAE=
// -----END PUBLIC KEY-----`;

// ////////////////////////////////////////////
// Super Private Storage

const BobPrivateKeyStr = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCq38pMnijZ9L3D
CJ2PI7mMDkZ1In9j8z/NBAwdWdIQjppT+wb4E+riVxfUvXiPndaOMRJuQU7xBmMF
I2HLP2nyavbdaeKlSKfPzNdBSsBkP0ajoteHopq7CkDAtqghGx2M5qIsSv5P4KJJ
D9f4//eeN5wJUunIDooPuVTgumr9qlHWMTwKI064poU4VvMNtdFM8cn+JkAmgysF
JVKeyir+ba3soImT5Jm0ATcbmkBIyR4xoz4bWgRp9aGbLyWLxRHcr5dJ12Qk9oVc
y8mrHFTREmrBLe1JXmQgCRAc1cywTXKbcRkMDZcPRHm87dnRd0XCt8fHcW5tfyO6
nMbqpUx5AgMBAAECggEADg0QRHfifdbCZnfuReOfCcFwQYhUT6akbdJKAT1eOOKT
FfoP1wVDRLi68tFgSTYGW0O1g2e/KzJ2YMkprOYSax7o3SjsfGEyvHOYlUvFcZDi
+QiGXubMALqte7NhdLR3O/uIpSoHCtA65BVnkfgRd3sU647b/smUSIn5zO+DZgex
gdIGYdYMg/sEj34+yDAYJxuM7tv7KyvmWMU7Q6AI0B8ES0iBj+oaCGVHSSPZaavC
u+bs6Vf4e1rycSw+4TuXeNlNtKxjtO5zUJKv0gWrFJ5xMASlv3vzq7UaIn4zRBEg
E3b4D7MkSamm9RfLjnFmqN6zwLy4J8PwNudP7UrK8QKBgQC/YFtNlVlvuRvqNgaF
WIL2+Is+ZQlrVwSh+Msa9w+f8rurzFs2q4uRLCwTmx8S4i4b0j08qoWIqKPmFxQd
ACaxNSuqxGHrag3Je8sX6+8z9kailSvjRI2fCltVynaP6uxNQ+0ASe2gLMaIc9t1
Oaixc4Km77KXbtW/JM38YrMacQKBgQDkkxugbViBkG+jvj7c84jUQGdsFAHUlWUP
msBDpQfT4NmHaU9xg+aTwZx4hLhoA0AibG4z7HlnkZUBp5HRePgYXo+vLBVQMdrz
xuxnWNfkHUH3hcFKq5DIJBzPM2bkEfEY3jb67J5b2ZUBaDK3tknDBZEHbnZQTO+1
1bdJAMWGiQKBgQCrljFGtomh6k5lCFuAY4PI+7+dCeoQG81DjFZOrwWLW4940ZlW
wyg32WsLiSGrRLAisbXGFv3zMYECY97cwa3vZMTqL3m8ITKLXDsUD65A4KckTqsy
8dwopJiPqx/ymaeU/zoX8DDmVD8NSROTX0cpE3ApTPDLZcyvvMgTaks7gQKBgQCw
h+jjSu/7CMkgBlNYpAG+I4t8jisnusXVemgZFkDoY5S9HxlLC1quLO6iqaYeNrx2
mZW3JmBRG7+gCoH07N93OrjvyjUfvZFjivOTkasTM4F6IGQ7PivQVwuk/wbtB+pT
kXOW8d4QBAgvkQDyn6dyJj9vJOHdfL35inhGuoDTOQKBgHAryA3FZIrDdcyF15ZG
k8hr9eLJ65abPEou+9mY2ZeeJexb4eybvTLg7RiUOnDJa6y8CFPuPHiSdpMp1Rz4
cSlOzL8o3q4aKwSeGnmAAtZDs952BtVkakp73l3cME/1eHMvshpfGbZsIF9VuJ2s
myJINKYTdpqMP5wWS3kmW6Ap
-----END PRIVATE KEY-----`;

app.post("/handle/message", (req, res) => {
  const { container, alisePubKey: aPubKey } = req.body;

  const alisePubKey = crypto.createPublicKey(aPubKey);
  const BobPrivateKey = crypto.createPrivateKey(BobPrivateKeyStr);

  console.log(colors.green(`Received Container:`));
  console.log(colors.green(container.toString()));

  console.log(colors.blue(`Received Alise Public Key:`));
  console.log(colors.blue(aPubKey));

  // decrypt container with Bob`s Private Key
  const decryptedData = crypto.privateDecrypt(
    {
      key: BobPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(container, "base64")
  );

  console.log(colors.rainbow(`Decrypted message with Bob's Private Key:`));
  console.log(colors.rainbow(decryptedData.toString()));

  // encrypt same message with Alise`s Public Key
  const encryptedData = crypto.publicEncrypt(
    {
      key: alisePubKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(decryptedData.toString())
  );

  console.log(colors.magenta(`Encrypted message with  Alise's Public Key:`));
  console.log(colors.magenta(encryptedData.toString("base64")));

  res.json({ confirmation: encryptedData.toString("base64") });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
