"use server";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, value, postId, replyId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const uId = Number(userId);
    const val = Number(value);

    if (postId) {
      const vote = await (prisma as any).postVote.upsert({
        where: { userId_postId: { userId: uId, postId: Number(postId) } },
        update: { value: val },
        create: { userId: uId, postId: Number(postId), value: val },
      });
      return NextResponse.json(vote);
    }

    if (replyId) {
      const vote = await (prisma as any).replyVote.upsert({
        where: { userId_replyId: { userId: uId, replyId: Number(replyId) } },
        update: { value: val },
        create: { userId: uId, replyId: Number(replyId), value: val },
      });
      return NextResponse.json(vote);
    }

    return NextResponse.json({ error: "No target provided" }, { status: 400 });
  } catch (error: any) {
    console.error("Vote API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}