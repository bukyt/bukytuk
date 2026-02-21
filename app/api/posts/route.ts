// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
        include: {
            author: {
            select: { username: true } // Only get the username, not the password!
            },
            votes: true,
            replies: {
            include: {
                author: { select: { username: true } } // Also for replies
            }
            }
        },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (err) {
    console.error("Fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST new post
// app/api/posts/route.ts
export async function POST(req: NextRequest) {
  try {
    const { title, content, authorId } = await req.json();
    
    const post = await prisma.post.create({
      data: { 
        title, 
        content, 
        authorId: Number(authorId) // Ensure this is a number
      },
      include: {
        author: true,
        votes: true,   // Returns [] so .reduce() doesn't crash
        replies: true, // Returns [] so .map() doesn't crash
      }
    });

    return NextResponse.json(post);
  } catch (err) {
    console.error("Create post error:", err);
    return NextResponse.json({ error: "Could not create post" }, { status: 500 });
  }
}