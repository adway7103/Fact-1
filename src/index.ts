import express from "express";
import connectToDb from "./db/ConnectToDb.js";
import "dotenv/config";
import authRouter from "./routes/AuthRouter.js";

import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Fact-1 Api");
});

app.listen(process.env.PORT as string, () => {
  try {
    connectToDb(process.env.MONGO_URL as string);
    console.log(`Listening on port ${process.env.PORT}`);
  } catch (error) {
    console.log("Error connecting to the database: ", error);
  }
});
