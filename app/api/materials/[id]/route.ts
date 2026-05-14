import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/materials/[id]
 * Delete a material (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Neautorizováno' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Neplatné ID materiálu' },
        { status: 400 }
      );
    }

    // Delete material
    await prisma.material.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Materiál byl smazán'
    });

  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}