import { decrypt, getSignature } from "@wecom/crypto";
import "dotenv/config";
import { Router } from "express";
import { XMLParser } from "fast-xml-parser";

const router = Router();

router.get("/v1", (req, res) => {
  const { msg_signature, timestamp, nonce, echostr } = req.query;

  const signature = getSignature(
    process.env.wechatcom_token || "",
    timestamp as string,
    nonce as string,
    echostr as string
  );

  if (signature === msg_signature) {
    console.info("签名验证成功");
    // 如果签名校验正确，解密 message
    const { message } = decrypt(
      process.env.wechatcom_encodingAESKey,
      echostr as string
    );
    // 返回 message 信息
    res.send(message);
  } else {
    console.info("签名验证失败");
    res.send("111");
  }
});

router.post("/v1", (req, res) => {
  const parseXML = new XMLParser();
  const { msg_signature, timestamp, nonce } = req.query;
  const echostr: string = parseXML.parse(req.body).Encrypt;

  const signature = getSignature(
    process.env.wechatcom_token || "",
    timestamp as string,
    nonce as string,
    req.body as string
  );

  if (signature === msg_signature) {
    console.info("签名验证成功");

    // 将加密消息体进行解密，解密后仍旧是 xml 字符串
    const messageXML = decrypt(process.env.wechatcom_encodingAESKey, echostr);
    // 把解密后 xml 消息体字符串，解析成 json
    let callbackDataBody = parseXML.parse(messageXML.message);

    console.info("callbackDataBody", callbackDataBody);

    res.send("666: " + messageXML.message);
  } else {
    console.info("签名验证失败");
    res.send("111");
  }
});

export default router;
