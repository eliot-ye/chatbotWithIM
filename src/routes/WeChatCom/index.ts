import { decrypt, getSignature } from "@wecom/crypto";
import "dotenv/config";
import { Router } from "express";

const router = Router();

router.get("/v1", (req, res) => {
  const { msg_signature, timestamp, nonce, echostr } = req.query;

  const signature = getSignature(
    process.env.wechatcom_token,
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
    console.log("message", message);
    // 返回 message 信息
    res.send(message);
  }
});

export default router;
