import path from "path";
import express from "express";
import routes from "./routes";
import { envConfig } from "./config";

const app = express();

async function main() {
  app.use(function (req, res, next) {
    var data = "";
    req.on("data", function (chunk) {
      data += chunk;
    });
    req.on("end", function () {
      req.body = data;
      next();
    });
  });
  app.use(express.static(path.join(__dirname, "../public")));
  routes(app);

  app.listen(envConfig.port, () => {
    console.log(`App is running at http://localhost:${envConfig.port}`);
  });
}

main().catch(console.error);
