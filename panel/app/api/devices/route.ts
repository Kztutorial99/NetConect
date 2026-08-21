import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('devices')
    .select('*')
    .order('last_seen', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ devices: data || [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { device_id, label } = await req.json();

  if (!device_id) {
    return NextResponse.json({ error: 'device_id required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('devices')
    .update({ label })
    .eq('device_id', device_id);

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

  const deviceId = req.nextUrl.searchParams.get('device_id');
  if (!deviceId) {
    return NextResponse.json({ error: 'device_id required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('devices')
    .delete()
    .eq('device_id', deviceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: 'deleted' });
}
