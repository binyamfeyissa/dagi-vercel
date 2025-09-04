import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { verifyToken } from "../utils/verifyToken";

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);

    if (!user) return res.status(401).json({ error: "Invalid or expired token" });

   
    (req as any).user = user;

    return handler(req, res);
  };
}
