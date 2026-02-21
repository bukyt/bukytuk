import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Recursively fetch nested replies
async function getRepliesWithNested(parentId: number | null, postId: number): Promise<any[]> {
  const replies = await (prisma as any).reply.findMany({
    where: {
      postId,
      parentId,
    },
    include: {
      author: { select: { username: true } },
      replies: true,
    },
  });

  // Recursively fetch replies to each reply
  for (const reply of replies) {
    if (!reply.replies) {
      reply.replies = [];
    }
    reply.replies = await getRepliesWithNested(reply.id, postId);
  }

  return replies;
}

export async function GET() {
  try {
    const posts = (await (prisma as any).post.findMany({
      include: {
        author: { select: { username: true } },
        votes: true,
        media: true,
      },
    })) as any[];

    // Manually fetch nested replies for each post
    for (const post of posts) {
      post.replies = await getRepliesWithNested(null, post.id);
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, content, authorId } = await req.json();
    const post = await (prisma as any).post.create({
      data: { title, content, authorId: Number(authorId) },
      include: {
        author: true,
        votes: true,
        media: true,
      },
    });
    return NextResponse.json(post);
  } catch (err) {
    console.error("Create post error:", err);
    return NextResponse.json({ error: "Could not create post" }, { status: 500 });
  }
}