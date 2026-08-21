import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { filter_mode } = await req.json();

  if (!filter_mode || !['blocklist', 'allowlist'].includes(filter_mode)) {
    return NextResponse.json({ error: 'Invalid filter_mode' }, { status: 400 });
  }

  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'filter_mode', value: filter_mode }, { onConflict: 'key' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'ok' });
}
