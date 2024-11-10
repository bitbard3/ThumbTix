import { Hono } from "hono";
import userRouter from "./routes/user.routes";
import workerRouter from "./routes/worker.routes";

const app = new Hono().basePath("/api");

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

export default app;
