import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { postId, parentId, content, authorId } = await req.json();

    if (!postId || !content || !authorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reply = await (prisma as any).reply.create({
      data: {
        content,
        postId: Number(postId),
        authorId: Number(authorId),
        parentId: parentId ? Number(parentId) : undefined,
      },
      include: {
        author: { select: { username: true } },
        replies: true,
      },
    });

    return NextResponse.json(reply);
  } catch (error: any) {
    console.error("Create reply error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}