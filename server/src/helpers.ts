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

// Build env vars with VITE_ prefix for Vite (Vite only includes VITE_* vars in bundle)
export function buildEnv(widget: WidgetConfig, tenantId: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  console.log(`[${new Date().toISOString()}] Building with env vars:`);
  for (const [key, value] of Object.entries(widget)) {
    const upperKey = key.toUpperCase();
    env['VITE_' + upperKey] = value;
    console.log(`  VITE_${upperKey}=${value}`);
  }
  env['VITE_X_TENANT_ID'] = tenantId;
  console.log(`  VITE_X_TENANT_ID}=${tenantId}`);
  return env;
}

// Create build directory and init status
export function initBuildDir(tenantId: string, buildId: string): string {
  const buildDir = path.join(BUILDS_DIR, tenantId, buildId);
  fs.mkdirSync(buildDir, { recursive: true });
  writeStatus(buildDir, 'pending');
  return buildDir;
}

// Callback factory for build failure
export function onBuildError(buildDir: string, tenantId: string, buildId: string): (err: Error) => void {
  return (err) => {
    writeStatus(buildDir, 'failed', err.message);
    console.error(`[${new Date().toISOString()}] Build FAILED for ${tenantId}/${buildId}: ${err.message}`);
  };
}

// Callback factory for build success - copy dist output to build dir
export function onBuildSuccess(buildDir: string, tenantId: string, buildId: string): () => void {
  return () => {
    const srcDist = path.join(PROJECT_ROOT, 'dist');
    if (fs.existsSync(srcDist)) {
      fs.mkdirSync(path.join(buildDir, 'dist'), { recursive: true });
      fs.cpSync(srcDist, path.join(buildDir, 'dist'), { recursive: true });
    }
    writeStatus(buildDir, 'completed');
    console.log(`[${new Date().toISOString()}] Build COMPLETED for ${tenantId}/${buildId}`);
  };
}

export { BUILDS_DIR, PROJECT_ROOT };
