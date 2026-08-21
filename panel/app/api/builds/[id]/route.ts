import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data: job, error } = await supabase
    .from('build_jobs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ job });
}

// Callback from GitHub Actions
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validate callback secret
  const secret = req.headers.get('x-callback-secret');
  if (!secret || secret !== process.env.PANEL_CALLBACK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { status, apk_url, error_message } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'status required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { status };
    if (apk_url) updateData.apk_url = apk_url;
    if (error_message) updateData.error_message = error_message;

    const { error } = await supabase
      .from('build_jobs')
      .update(updateData)
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'updated' });
  } catch (err) {
    console.error('Callback error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
