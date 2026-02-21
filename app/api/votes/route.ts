// app/api/votes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, value, postId, replyId } = await req.json();
    const uId = parseInt(userId);

    // 1. Toggle: If value is 0, delete the record
    if (value === 0) {
      await prisma.vote.deleteMany({
        where: {
          userId: uId,
          postId: postId ? parseInt(postId) : null,
          replyId: replyId ? parseInt(replyId) : null,
        },
      });
      return NextResponse.json({ success: true });
    }

    // 2. Build the where clause based on the error log's suggested names
    let whereCondition: any = {};
    if (postId) {
      // Your error log suggested "postId_userId"
      whereCondition = { postId_userId: { userId: uId, postId: parseInt(postId) } };
    } else if (replyId) {
      whereCondition = { userId_replyId: { userId: uId, replyId: parseInt(replyId) } };
    }

    const vote = await prisma.vote.upsert({
      where: whereCondition,
      update: { value: parseInt(value) },
      create: { 
        userId: uId, 
        value: parseInt(value), 
        postId: postId ? parseInt(postId) : null,
        replyId: replyId ? parseInt(replyId) : null 
      },
    });

    return NextResponse.json(vote);
  } catch (error: any) {
    console.error("Vote Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}