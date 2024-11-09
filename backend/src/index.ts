import { Hono } from "hono";
import userRouter from "./routes/user.routes";
import workerRouter from './routes/worker.routes'

const app = new Hono().basePath("/api");
app.route("user", userRouter);
app.route("worker",workerRouter)

export default app;
