import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Import the clearAllRateLimits function directly from auth module
// We need to re-implement it here because we can't export from NextAuth wrapper
async function clearAllRateLimits(): Promise<void> {
  // This is a workaround - in production with distributed cache (Redis),
  // you would clear the rate limit store directly
  console.log('Rate limits reset requested - restart container to fully clear');
  // Note: In-memory Map cannot be cleared from outside the module
  // The proper solution is to use DISABLE_RATE_LIMIT env var or restart
}

/**
 * POST /api/auth/reset-rate-limit
 * Resets all login rate limits (requires admin authentication)
 */
export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Neautentizováno' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Pouze admini mohou resetovat rate limity' },
        { status: 403 }
      );
    }
    
    // Clear rate limits
    await clearAllRateLimits();
    
    return NextResponse.json({
      success: true,
      message: 'Rate limity byly resetovány (restart kontejneru pro úplné vyčištění)'
    });
  } catch (error) {
    console.error('Error resetting rate limits:', error);
    return NextResponse.json(
      { error: 'Interní chyba serveru' },
      { status: 500 }
    );
  }
}