import { decrypt, getSignature, encrypt } from "@wecom/crypto";
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
    console.info("GET 签名验证成功");
    // 如果签名校验正确，解密 message
    const { message } = decrypt(
      process.env.wechatcom_encodingAESKey!,
      echostr as string
    );
    // 返回 message 信息
    res.send(message);
  } else {
    console.info("GET 签名验证失败");
    res.send("111");
  }
});

router.post("/v1", (req, res) => {
  const parseXML = new XMLParser();
  const { msg_signature, timestamp, nonce } = req.query;

  const body = parseXML.parse(req.body).xml;

  const EncryptStr = body.Encrypt;

  const signature = getSignature(
    process.env.wechatcom_token || "",
    timestamp as string,
    nonce as string,
    EncryptStr as string
  );

  if (signature === msg_signature) {
    console.info("POST 签名验证成功");

    // 将加密消息体进行解密，解密后仍旧是 xml 字符串
    const {
      message: messageXML,
      id,
      random,
    } = decrypt(process.env.wechatcom_encodingAESKey!, EncryptStr);
    // 把解密后 xml 消息体字符串，解析成 json
    let callbackDataBody = parseXML.parse(messageXML).xml;

    const message = `
    <xml>
      <ToUserName>${callbackDataBody.ToUserName}</ToUserName>
      <FromUserName>${callbackDataBody.FromUserName}</FromUserName> 
      <CreateTime>${new Date().getTime()}</CreateTime>
      <MsgType>${callbackDataBody.MsgType}</MsgType>
      <Content>666: ${callbackDataBody.Content}</Content>
    </xml>`;
    const sendStr = `
    <xml> 
      <ToUserName>${body.ToUserName}</ToUserName>
      <AgentID>${body.AgentID}</AgentID>
      <Encrypt>${encrypt(
        process.env.wechatcom_encodingAESKey!,
        message,
        id,
        random
      )}</Encrypt>
    </xml>`;

    res.send(sendStr);
  } else {
    console.info("POST 签名验证失败");
    res.send("111");
  }
});

export default router;
