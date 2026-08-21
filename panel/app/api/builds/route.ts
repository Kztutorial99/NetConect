import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { dispatchWorkflow, buildWorkflowInputs } from '@/lib/github';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: jobs, error } = await supabase
    .from('build_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { app_name, package_name } = await req.json();

    if (!app_name || !package_name) {
      return NextResponse.json({ error: 'app_name and package_name required' }, { status: 400 });
    }

    // Validate package name format
    if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(package_name)) {
      return NextResponse.json({ error: 'Invalid package name format' }, { status: 400 });
    }

    // Create build job
    const { data: job, error: insertError } = await supabase
      .from('build_jobs')
      .insert({
        app_name,
        package_name,
        status: 'queued',
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Dispatch GitHub workflow
    const inputs = buildWorkflowInputs({
      app_name,
      package_name,
      job_id: job.id,
    });

    const result = await dispatchWorkflow('build-apk.yml', inputs);

    if (result.error) {
      await supabase
        .from('build_jobs')
        .update({ status: 'failed', error_message: result.error })
        .eq('id', job.id);

      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Update job with run ID
    await supabase
      .from('build_jobs')
      .update({
        status: 'running',
        github_run_id: result.run_id || null,
      })
      .eq('id', job.id);

    return NextResponse.json({ job_id: job.id, status: 'running' });
  } catch (err) {
    console.error('Build error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
