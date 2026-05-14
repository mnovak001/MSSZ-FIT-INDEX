import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * GET /api/materials/[id]/download
 * Download a material file (public access)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Public access - no authentication required for downloads

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Neplatné ID materiálu' },
        { status: 400 }
      );
    }

    // Get material from database
    const material = await prisma.material.findUnique({
      where: { id }
    });

    if (!material || !material.storageKey) {
      return NextResponse.json(
        { error: 'Materiál nenalezen' },
        { status: 404 }
      );
    }

    // Build file path - storageKey is like "/uploads/filename.ext"
    const fileName = path.basename(material.storageKey);
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'Soubor neexistuje na serveru' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath);

    // Determine content type
    const extension = path.extname(fileName).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed'
    };

    const contentType = contentTypes[extension] || 'application/octet-stream';

    // For PDF files, allow inline display (preview)
    // For other files, force download
    const disposition = extension === '.pdf' 
      ? `inline; filename="${fileName}"`
      : `attachment; filename="${fileName}"`;

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Error downloading material:', error);
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}