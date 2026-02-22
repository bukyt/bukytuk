import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  // In Next.js App Router, params is often a Promise in newer versions
  // Using await ensures compatibility
  const { filename } = await (params as any); 
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

  try {
    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();

    // Map extensions to Mime Types
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
        // Cache for 1 year so the browser doesn't keep asking for the same GIF
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error(`Error serving file ${filename}:`, error);
    return new NextResponse('File not found', { status: 404 });
  }
}