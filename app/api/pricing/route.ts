import { getPricingData } from '@/actions/pricing';
import { NextResponse } from 'next/server';



export async function GET() {
  try {
    const data = await getPricingData();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Failed to load pricing data' },
      { status: 500 }
    );
  }
}
