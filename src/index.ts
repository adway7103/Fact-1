import express from "express";
import connectToDb from "./db/ConnectToDb.js";
import "dotenv/config";
import authRouter from "./routes/AuthRouter.js";
import TodoRouter from "./routes/TodoRouter.js";
import authenticate from "./middleware/authentication.js";
import inventoryRouter from "./routes/Inventory.js";
import productionRouter from "./routes/ProductionRouter.js";
import lifecycleRouter from "./routes/LifecycleRouter.js";
import cors from "cors";
import AddPermissions from "./controllers/Rules.js";
// import roleRouter from "./routes/RoleRouter.js";
import roleRouter from "./routes/RoleRouter.js";
import { checkPermissions } from "./middleware/checkPermissions.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);
app.use("/todo", authenticate, TodoRouter);
app.use("/inventory", authenticate, inventoryRouter);
app.use("/production", authenticate, productionRouter);
app.use("/lifecycle", authenticate, lifecycleRouter);
// app.use("/role",authenticate,checkPermissions("add-role"), roleRouter);
app.post("/role", AddPermissions);

app.get("/", (req, res) => {
  res.send("Welcome to Fact-1 Api");
});

app.listen(process.env.PORT as string, async () => {
  try {
    const db = await connectToDb(process.env.MONGO_URL as string);
    console.log(`Listening on port ${process.env.PORT}`);
  } catch (error) {
    console.log("Error connecting to the database: ", error);
  }
});
