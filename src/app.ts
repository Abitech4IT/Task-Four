import express from "express";
import cors from "cors";
import employeeRoute from "./routes/employeeRoute";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/v1/employees", employeeRoute);

export default app;
