import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

async function getUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    if (!payload.id) return null; 
    return { id: payload.id, role: payload.role };
  } catch {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
 
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized or invalid token" });

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
 
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        message,
        userId: user.id
      },
    });

    return res.status(201).json({ message: "Your message has been sent!", contact });
  } catch (error) {
    console.error("Contact API error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
