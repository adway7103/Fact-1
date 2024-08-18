import jwt from "jsonwebtoken";
import "dotenv/config";
import { Request, Response, NextFunction } from "express";
interface User {
  _id: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader: any = req.headers.authorization;
  console.log(authHeader)
  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("1")
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as User;
    req.body.user_id = payload._id;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      return res.status(500).json({ error: "Internal server error" }); // Handle unexpected errors
    }
  }
};

export default authenticate;
