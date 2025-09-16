import { type Request, type Response } from "express";

const defaultRoute = async (req: Request, res: Response) => {
  return res.status(200).send({
    loginAccount: { method: "POST", api: "/api/auth/login" },
    createAccount: { method: "POST", api: "/api/auth/create" },
  });
};

export { defaultRoute };
