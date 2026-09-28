import express, { type Express, type RequestHandler } from "express";
import cors from "cors";
import pinoHttpModule from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

type PinoHttpRequest = {
  id?: string | number;
  method?: string;
  url?: string;
};

type PinoHttpResponse = {
  statusCode?: number;
};

const pinoHttp = pinoHttpModule as unknown as (options: {
  logger: typeof logger;
  serializers: {
    req(req: PinoHttpRequest): Record<string, unknown>;
    res(res: PinoHttpResponse): Record<string, unknown>;
  };
}) => RequestHandler;

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
