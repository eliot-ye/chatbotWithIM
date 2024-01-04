import { decrypt, getSignature, encrypt } from "@wecom/crypto";
import "dotenv/config";
import { Router, Request } from "express";
import { XMLParser } from "fast-xml-parser";
import { fast_gpt_chat } from "../../chatbot-engine/fastgpt";
import axios from "axios";

const router = Router();
export default router;

let access_token: string = "";

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

router.post(
  "/v1",
  async (
    req: Request<
      {},
      string,
      string,
      { msg_signature: string; timestamp: string; nonce: string },
      Record<string, any>
    >,
    res
  ) => {
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
      getChatData(req);

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
      <ToUserName>${callbackDataBody.FromUserName}</ToUserName>
      <FromUserName>${callbackDataBody.ToUserName}</FromUserName> 
      <CreateTime>${new Date().getTime()}</CreateTime>
      <MsgType>${callbackDataBody.MsgType}</MsgType>
      <Content>666: ${callbackDataBody.Content}</Content>
    </xml>`;

      const sendStrEncrypt = encrypt(
        process.env.wechatcom_encodingAESKey!,
        message,
        id,
        random
      );
      const sendStrTimestamp = new Date().getTime();
      const sendStrSignature = getSignature(
        process.env.wechatcom_token || "",
        sendStrTimestamp,
        nonce as string,
        sendStrEncrypt
      );
      const sendStr = `
    <xml> 
      <Nonce>${nonce}</Nonce>
      <TimeStamp>${sendStrTimestamp}</TimeStamp>
      <MsgSignature>${sendStrSignature}</MsgSignature>
      <Encrypt>${sendStrEncrypt}</Encrypt>
    </xml>`;

      res.send(sendStr);
    } else {
      console.info("POST 签名验证失败");
      res.send("111");
    }
  }
);

async function getChatData(
  req: Request<
    {},
    string,
    string,
    { msg_signature: string; timestamp: string; nonce: string },
    Record<string, any>
  >
) {
  if (!access_token) {
    get_provider_token();
  }
  const parseXML = new XMLParser();

  const body = parseXML.parse(req.body).xml;

  const EncryptStr = body.Encrypt;

  const {
    message: messageXML,
    id,
    random,
  } = decrypt(process.env.wechatcom_encodingAESKey!, EncryptStr);
  // 把解密后 xml 消息体字符串，解析成 json
  let messageBody = parseXML.parse(messageXML).xml;

  const fastRes = await fast_gpt_chat(
    {
      uid: messageBody.FromUserName,
      name: messageBody.FromUserName,
      chatId: `${messageBody.ToUserName}-${messageBody.FromUserName}`,
    },
    [{ role: "user", content: messageBody.Content }]
  );

  if (!access_token) {
    await get_provider_token();
  }

  fastRes.choices.forEach((item) => {
    axios(
      `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${access_token}`,
      {
        data: {
          touser: messageBody.FromUserName,
          agentid: messageBody.AgentID,
          msgtype: "text",
          text: {
            content: item.message.content,
          },
        },
      }
    );
  });
}

async function get_provider_token() {
  const res = await axios(
    "https://qyapi.weixin.qq.com/cgi-bin/service/get_provider_token",
    {
      data: {
        corpid: process.env.wechatcom_corpid,
        provider_secret: process.env.wechatcom_secret,
      },
    }
  );

  access_token = res.data.provider_access_token;

  return access_token;
}
