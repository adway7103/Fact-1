var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import connectToDb from "./db/ConnectToDb.js";
import "dotenv/config";
import authRouter from "./routes/AuthRouter.js";
import TodoRouter from "./routes/TodoRouter.js";
import authenticate from "./middleware/authentication.js";
import inventoryRouter from "./routes/Inventory.js";
import productionRouter from "./routes/ProductionRouter.js";
import lifecycleRouter from "./routes/LifecycleRouter.js";
import issuanceRouter from "./routes/IssuanceRecordRouter.js";
import notificationRouter from "./routes/notificationRouter.js";
import activityLogsRouter from "./routes/LogsRouter.js";
import cors from "cors";
import AddPermissions from "./controllers/Rules.js";
import logMiddleware from "./middleware/logsMiddleware.js";
const app = express();
app.use(express.json());
app.use(cors());
app.use(logMiddleware);
app.use("/auth", authRouter);
app.use("/todo", authenticate, TodoRouter);
app.use("/inventory", authenticate, inventoryRouter);
app.use("/production", authenticate, productionRouter);
app.use("/lifecycle", authenticate, lifecycleRouter);
app.use("/issuance", authenticate, issuanceRouter);
app.use("/", authenticate, notificationRouter);
app.use("/", authenticate, activityLogsRouter);
// app.use("/role",authenticate,checkPermissions("add-role"), roleRouter);
app.post("/role", AddPermissions);
app.get("/", (req, res) => {
    res.send("Welcome to Fact-1 Api");
});
app.listen(process.env.PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield connectToDb(process.env.MONGO_URL);
        console.log(`Listening on port ${process.env.PORT}`);
    }
    catch (error) {
        console.log("Error connecting to the database: ", error);
    }
}));
