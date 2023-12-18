import { Express, Router } from "express";
import WeChatCom from "./WeChatCom";

// 路由配置接口
interface RouterConf {
  path: string;
  router: Router;
  meta?: unknown;
}

// 路由配置
const routerConf: Array<RouterConf> = [
  { path: "/wechat_com", router: WeChatCom },
];

function routes(app: Express) {
  routerConf.forEach((conf) => app.use(conf.path, conf.router));
}

export default routes;
