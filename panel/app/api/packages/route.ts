import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: packages, error: pkgError } = await supabase
    .from('packages')
    .select('*')
    .order('updated_at', { ascending: false });

  const { data: filterModeSetting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'filter_mode')
    .single();

  const filter_mode = (filterModeSetting?.value as string) || 'blocklist';

  if (pkgError) {
    return NextResponse.json({ error: pkgError.message }, { status: 500 });
  }

  return NextResponse.json({ packages: packages || [], filter_mode });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { package_name, blocked, note } = await req.json();

  if (!package_name) {
    return NextResponse.json({ error: 'package_name required' }, { status: 400 });
  }

  const { error } = await supabase.from('packages').upsert(
    { package_name, blocked: blocked || false, note: note || null },
    { onConflict: 'package_name' }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'ok' });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const name = req.nextUrl.searchParams.get('name');
  if (!name) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('packages')
    .delete()
    .eq('package_name', name);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'deleted' });
}
