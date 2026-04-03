import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const PgStore = connectPgSimple(session);

const app: Express = express();

app.set("trust proxy", 1);

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

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

app.use(
  session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      tableName: "session",
      pruneSessionInterval: 60 * 15, // prune expired sessions every 15 min
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../../hd-rivic/dist/public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

export default app;
