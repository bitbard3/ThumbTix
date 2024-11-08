import { Hono } from "hono";
import app from "../index";

const worker = new Hono();

app.route("/worker", worker);
