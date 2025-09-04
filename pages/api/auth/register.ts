import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { RegisterSchema } from "../../../schemas/reg";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log("Registration request body:", req.body);
    const parsed = RegisterSchema.parse(req.body);
    console.log("Parsed data:", parsed);

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    const user = await prisma.user.create({
      data: {
        username: parsed.name,
        email: parsed.email,
        password: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPass } = user;

    return res.status(201).json({ message: "User registered", user: userWithoutPass });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    if (error && typeof error === 'object' && 'errors' in error) {
      return res.status(400).json({ error: (error as { errors: unknown }).errors });
    }
    if (error && typeof error === 'object' && 'issues' in error) {
      // Zod validation errors
      const issues = (error as { issues: { message: string }[] }).issues;
      return res.status(400).json({ error: issues.map((issue) => issue.message).join(", ") });
    }
    return res.status(500).json({ error: "Something went wrong", details: error instanceof Error ? error.message : 'Unknown error' });
  }
}
