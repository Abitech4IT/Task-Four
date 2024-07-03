import express from "express";
import employeeRoute from "./routes/employeeRoute";

const app = express();

app.use(express.json());

app.use("/api/v1/employees", employeeRoute);

export default app;
