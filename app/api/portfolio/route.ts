import { getPortfolioData } from '@/actions/portfolio';
import { NextResponse } from 'next/server';

// OPTIONAL: Force static generation if this route doesn't rely on cookies/headers
// export const dynamic = 'force-static'; 

export async function GET() {
  try {
    const data = await getPortfolioData();
    
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        // Cache for 1 hour (3600s) in CDN, 
        // allow stale data while revalidating for another hour
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600',
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to load portfolio data' },
      { status: 500 }
    );
  }
}