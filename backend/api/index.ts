import { Hono } from "hono";
// import userRouter from "../src/routes/user.routes";
// import workerRouter from "../src/routes/worker.routes";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
const app = new Hono().basePath("/api");

app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Authorization", "Content-Type"],
  })
);

// app.route("/user", userRouter);
// app.route("/worker", workerRouter);

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

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
