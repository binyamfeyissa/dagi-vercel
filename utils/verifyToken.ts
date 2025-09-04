import jwt from "jsonwebtoken";

export function verifyToken(token: string) {
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (error) {
    return null;
  }
}
