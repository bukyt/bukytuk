import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, password, username } = await req.json();

  if (!email || !password || !username) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        username, // Now this variable exists
        password: hashedPassword,
      },
    });
    // Return the username too so the frontend can use it
    return NextResponse.json({ id: user.id, email: user.email, username: user.username });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "User or Email already exists" }, { status: 400 });
  }
}