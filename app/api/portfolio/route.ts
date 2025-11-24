
import { getPortfolioData } from '@/actions/portfolio';
import { NextResponse } from 'next/server';



export async function GET() {
  try {
    const data = await getPortfolioData();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to load portfolio data' },
      { status: 500 }
    );
  }
}
