var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Log from "../models/LogsModel.js";
const logMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.method !== "GET") {
        res.on("finish", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const logEntry = {
                    user: req.body.user_id || "Anonymous",
                    action: `${req.method} ${req.originalUrl}`,
                    details: res.locals.createdDocument || req.body,
                    timestamp: new Date(),
                };
                yield Log.create(logEntry);
            }
            catch (error) {
                console.error("Failed to log action:", error);
            }
        }));
    }
    next();
});
export default logMiddleware;
