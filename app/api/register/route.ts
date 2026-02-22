import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email, password, username } = await req.json();

  if (!email || !password || !username) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = randomBytes(32).toString("hex");

  try {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        verificationToken,
        isEmailVerified: false,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, username, verificationToken);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      message: "Registration successful! Please check your email to verify your account.",
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "User or Email already exists" }, { status: 400 });
  }
}