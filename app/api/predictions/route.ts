import { NextResponse } from 'next/server';
import { matchPredictionSchema } from '@/lib/validators/prediction';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = matchPredictionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({ ok: true, data: parsed.data });
}
