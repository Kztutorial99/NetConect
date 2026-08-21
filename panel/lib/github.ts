const GITHUB_API = 'https://api.github.com';

export async function dispatchWorkflow(
  workflowId: string,
  inputs: Record<string, string>
): Promise<{ run_id?: string; error?: string }> {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!token || !owner || !repo) {
    return { error: 'GitHub credentials not configured' };
  }

  try {
    // Dispatch the workflow
    const dispatchRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs,
        }),
      }
    );

    if (!dispatchRes.ok) {
      const text = await dispatchRes.text();
      return { error: `Failed to dispatch: ${dispatchRes.status} ${text}` };
    }

    // Wait a moment then get the latest run
    await new Promise((r) => setTimeout(r, 2000));

    const runsRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/actions/runs?branch=main&status=queued&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (runsRes.ok) {
      const data = await runsRes.json();
      if (data.workflow_runs?.[0]?.id) {
        return { run_id: String(data.workflow_runs[0].id) };
      }
    }

    return { run_id: undefined };
  } catch (err) {
    return { error: String(err) };
  }
}

export function buildWorkflowInputs(params: {
  app_name: string;
  package_name: string;
  job_id: string;
}): Record<string, string> {
  return {
    app_name: params.app_name,
    package_name: params.package_name,
    api_url: process.env.NEXTAUTH_URL || '',
    ingest_token: process.env.INGEST_TOKEN || '',
    device_id: 'panel-build',
    job_id: params.job_id,
  };
}
