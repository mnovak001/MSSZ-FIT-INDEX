import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { saveMaterialFile } from '@/lib/storage';
import { MaterialKind } from '@prisma/client';

/**
 * POST /api/materials
 * Create a new material (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Neautorizováno' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    const topicId = formData.get('topicId') as string;
    const title = formData.get('title') as string;
    const kind = formData.get('kind') as MaterialKind;
    const url = formData.get('url') as string | null;
    const content = formData.get('content') as string | null;
    const description = formData.get('description') as string | null;
    const file = formData.get('file') as File | null;

    // Validate required fields
    if (!topicId || !title || !kind) {
      return NextResponse.json(
        { error: 'Chybějící povinné pole' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (!uuidRegex.test(topicId)) {
      return NextResponse.json(
        { error: 'Neplatný formát topic ID' },
        { status: 400 }
      );
    }

    let storageKey: string | undefined;

    // Handle file upload if kind is FILE
    if (kind === MaterialKind.FILE && file && file.size > 0) {
      try {
        storageKey = await saveMaterialFile(file);
      } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Chyba při nahrávání souboru' },
          { status: 400 }
        );
      }
    }

    // Create material in database
    const material = await prisma.material.create({
      data: {
        topicId,
        title,
        kind,
        url: kind === MaterialKind.LINK ? url : null,
        storageKey: kind === MaterialKind.FILE ? storageKey : null,
        content: kind === MaterialKind.NOTE ? content : null,
        description: description || null
      },
      include: {
        topic: {
          select: {
            title: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      material: {
        id: material.id,
        title: material.title,
        kind: material.kind,
        topic: material.topic
      }
    });

  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}