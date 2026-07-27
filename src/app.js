import express from "express";
import cors from "cors";
import { apiRateLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import apiRouter from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(apiRateLimiter);

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
