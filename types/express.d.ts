import * as express from "express";
import type { DetailedUserType } from "../src/types/user.ts";
import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      _user: { username: string | ""; id: number };
      _fullUser: User;
    }
  }
}
