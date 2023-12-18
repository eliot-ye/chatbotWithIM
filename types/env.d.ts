declare namespace NodeJS {
  interface ProcessEnv {
    readonly wechatcom_token: string;
    readonly wechatcom_appid: string;
    readonly wechatcom_appsecret: string;
    readonly wechatcom_encodingAESKey: string;
    readonly wechatcom_mchid: string;
    readonly wechatcom_partnerkey: string;
    readonly wechatcom_paysignkey: string;
    readonly wechatcom_notifyurl: string;
  }
}
