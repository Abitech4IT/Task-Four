import dotenv from "dotenv";
import mongoose from "mongoose";

import app from "./app";

// const DB_URL: string =
//   process.env.DB_URL ||
//   "mongodb+srv://abitechit:Wg4rTkUeQDJ3415g@employee.dguo9et.mongodb.net/";

//Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("shutting down the server for handling uncaught exception");
});

//config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({
    path: "./src/.env",
  });
}

//Connect DB
const DB_URL: string = process.env.DB_URL ?? "";

if (!DB_URL) {
  throw new Error("Database URL not provided in environment variables");
}

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as any)
  .then((data) => {
    console.log(`mongodb connection with server: ${data.connection.host}`);
  });

//Starting Server
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`app listening on port ${port}...`);
});

//unhandle promise rejection
process.on("unhandledRejection", (err: any) => {
  console.log(`Shutting down the server for ${err.message}`);
  console.log("Shutting down the server for unhandle promise rejection");

  server.close(() => {
    process.exit(1);
  });
});
