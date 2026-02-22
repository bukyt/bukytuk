"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json({
        success: true,
        message: "If this email exists, a password reset link has been sent",
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({
      success: true,
      message: "If this email exists, a password reset link has been sent",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
