import jwt from "jsonwebtoken";
import "dotenv/config";
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = payload._id;
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: "Token expired" });
        }
        else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: "Invalid token" });
        }
        else {
            return res.status(500).json({ error: "Internal server error" }); // Handle unexpected errors
        }
    }
};
export default authenticate;
