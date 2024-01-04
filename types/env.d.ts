declare namespace NodeJS {
  interface ProcessEnv {
    readonly wechatcom_token: string;
    readonly wechatcom_encodingAESKey: string;
    readonly wechatcom_corpid: string;
    readonly wechatcom_secret: string;
    readonly wechatcom_agentId: string;

    readonly fastgpt_apikey: string;
    readonly fastgpt_baseurl: string;
  }
}
