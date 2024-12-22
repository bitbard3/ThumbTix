import { Hono } from "hono";
import userRouter from "./routes/user.routes.js";
import workerRouter from "./routes/worker.routes.js";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
const app = new Hono().basePath("/api");

app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Authorization", "Content-Type"],
  })
);

app.route("/user", userRouter);
app.route("/worker", workerRouter);

app.all("*", (c) => {
  console.log("Received request for:", c.req.url);
  return c.json(
    {
      error: "Route not found",
      requestedPath: c.req.path,
      method: c.req.method,
    },
    404
  );
});
serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 9009,
});
