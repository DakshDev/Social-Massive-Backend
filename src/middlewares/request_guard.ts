import { type NextFunction, type Request, type Response } from "express";
import ErrorType from "../types/error.js";

const activeUsers = new Set<string>();

async function RequestGuard(req: Request, res: Response, next: NextFunction) {
  const username = req._user.username;
  if (activeUsers.has(username)) {
    return res.status(429).send(ErrorType.ManyRequest);
  } else {
    activeUsers.add(username);

    const cleanup = () => {
      activeUsers.delete(username);
    };
    res.on("finish", cleanup);
    next();
  }
}
export default RequestGuard;
