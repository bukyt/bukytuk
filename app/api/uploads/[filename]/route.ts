import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> } // Define params as a Promise
) {
  // We must await the params in Next.js 15+
  const { filename } = await params; 
  
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

  try {
    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();

    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
    };

    const contentType = mimeMap[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    // If file doesn't exist, return 404
    return new NextResponse('File not found', { status: 404 });
  }
}