import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  // Validate ingest token
  const token = req.headers.get('x-ingest-token');
  if (!token || token !== process.env.INGEST_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { device_id, package_name, title, body: notifBody, posted_at, raw } = body;

    if (!device_id || !package_name) {
      return NextResponse.json({ error: 'device_id and package_name required' }, { status: 400 });
    }

    // Upsert device
    await supabase
      .from('devices')
      .upsert(
        { device_id, last_seen: new Date().toISOString() },
        { onConflict: 'device_id' }
      );

    // Check if package is blocked
    const { data: pkg } = await supabase
      .from('packages')
      .select('blocked')
      .eq('package_name', package_name)
      .single();

    const { data: filterModeSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'filter_mode')
      .single();

    const filterMode = filterModeSetting?.value as string || 'blocklist';

    // In blocklist mode: block if explicitly blocked
    // In allowlist mode: block unless explicitly not blocked (i.e., in list and blocked=false)
    let shouldStore = true;
    if (pkg) {
      if (filterMode === 'blocklist' && pkg.blocked) {
        shouldStore = false;
      }
    } else if (filterMode === 'allowlist') {
      // Package not in list and mode is allowlist = block
      shouldStore = false;
    }

    if (!shouldStore) {
      return NextResponse.json({ status: 'filtered' });
    }

    // Insert notification
    const { error } = await supabase.from('notifications').insert({
      device_id,
      package_name,
      title: title || null,
      body: notifBody || null,
      posted_at: posted_at || new Date().toISOString(),
      raw: raw || null,
    });

    if (error) {
      console.error('Insert notification error:', error);
      return NextResponse.json({ error: 'Failed to insert' }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error('Ingest error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
