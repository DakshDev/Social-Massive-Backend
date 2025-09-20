import { type NextFunction, type Request, type Response } from "express";
import ErrorType from "../types/error.js";

const activeUsers = new Set<string>();

async function manyRequestGuard(req: Request, res: Response, next: NextFunction) {
  const username = req._user.username;

  if (activeUsers.has(username)) {
    req.destroy();
    return res.status(429).send(ErrorType.ManyRequest);
  }

  // Mark user as active in Memory
  activeUsers.add(username);

  const cleanup = () => activeUsers.delete(username);
  res.on("finish", cleanup); // normal completion
  res.on("close", cleanup); // client disconnect
  res.on("error", cleanup); // stream errors

  next();
}

export default manyRequestGuard;
