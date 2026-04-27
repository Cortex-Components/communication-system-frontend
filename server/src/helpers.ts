import fs from 'fs';
import path from 'path';
import { WidgetConfig } from './types.js';

const PROJECT_ROOT = process.cwd();
const BUILDS_DIR = path.join(PROJECT_ROOT, 'builds');

// Write status.json to build dir
export function writeStatus(buildDir: string, status: string, error?: string): void {
  fs.writeFileSync(
    path.join(buildDir, 'status.json'),
    JSON.stringify({ status, error, updated_at: new Date().toISOString() })
  );
}

// Build env vars with WIDGET_ prefix for Vite
export function buildEnv(widget: WidgetConfig): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  for (const [key, value] of Object.entries(widget)) {
    env['WIDGET_' + key] = value;
  }
  return env;
}

// Create build directory and init status
export function initBuildDir(tenantId: string, buildId: string): string {
  const buildDir = path.join(BUILDS_DIR, tenantId, buildId);
  fs.mkdirSync(buildDir, { recursive: true }); // create tenant/build_id/ dir tree
  writeStatus(buildDir, 'pending');
  return buildDir;
}

// Callback factory for build failure
export function onBuildError(buildDir: string, tenantId: string, buildId: string): (err: Error) => void {
  return (err) => {
    writeStatus(buildDir, 'failed', err.message);
    console.error('Build failed for ' + tenantId + '/' + buildId + ': ' + err.message);
  };
}

// Callback factory for build success - copy dist output to build dir
export function onBuildSuccess(buildDir: string, tenantId: string, buildId: string): () => void {
  return () => {
    const srcDist = path.join(PROJECT_ROOT, 'dist');
    if (fs.existsSync(srcDist)) {
      fs.mkdirSync(path.join(buildDir, 'dist'), { recursive: true });
      fs.cpSync(srcDist, path.join(buildDir, 'dist'), { recursive: true }); // copy widget bundle to build dir
    }
    writeStatus(buildDir, 'completed');
    console.log('Build completed for ' + tenantId + '/' + buildId);
  };
}

export { BUILDS_DIR, PROJECT_ROOT };