import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get('device_id');
  if (!deviceId) {
    return NextResponse.json({ error: 'device_id required' }, { status: 400 });
  }

  try {
    // Get filter mode
    const { data: filterModeSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'filter_mode')
      .single();

    const mode = (filterModeSetting?.value as string) || 'blocklist';

    // Get all packages
    const { data: packages } = await supabase
      .from('packages')
      .select('package_name, blocked');

    return NextResponse.json({
      mode,
      packages: packages || [],
    });
  } catch (err) {
    console.error('Config error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
