import * as express from "express";
import type { DetailedUserType } from "../src/types/user.ts";

declare global {
  namespace Express {
    interface Request {
      _user: { username: string | ""; id: number };
    }
  }
}
