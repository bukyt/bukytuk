import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Adjust based on your db path

export async function POST(req: NextRequest) {
  try {
    const { postId, content, authorId, parentId } = await req.json();

    if (!content || !postId || !authorId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const reply = await prisma.reply.create({
      data: { 
        content,
        authorId: parseInt(authorId),
        postId: parseInt(postId),
        // If parentId is 0, null, or undefined, set to null
        parentId: parentId ? parseInt(parentId) : null
      },
    });

    return NextResponse.json(reply);
  } catch (error: any) {
    console.error("Reply API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}