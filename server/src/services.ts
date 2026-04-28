import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { BuildConfig } from './types.js';
import { validateBuildId, validateWidgetConfig } from './validation.js';
import { onBuildError, onBuildSuccess, initBuildDir, buildEnv, BUILDS_DIR } from './helpers.js';

export function createBuild(tenantId: string, config: BuildConfig): string {
  const buildId = validateBuildId(config.build_id) ?? (() => { throw new Error('config.build_id must be a valid UUID'); })();
  const widget = validateWidgetConfig(config.widget) ?? (() => { throw new Error('config.widget is required with all expected string fields'); })();

  const buildDir = initBuildDir(tenantId, buildId);
  const env = buildEnv(widget);

  exec('npm run build', { cwd: process.cwd(), env, timeout: 300000 }, (err) => {
    if (err) {
      onBuildError(buildDir, tenantId, buildId)(err);
      return;
    }
    onBuildSuccess(buildDir, tenantId, buildId)();
  });

  return buildId;
}

export function deleteBuild(tenantId: string, buildId: string): boolean {
  const buildDir = path.join(BUILDS_DIR, tenantId, buildId);
  if (!fs.existsSync(buildDir)) return false;
  fs.rmSync(buildDir, { recursive: true, force: true });
  return true;
}

export function deleteAllTenantBuilds(tenantId: string): boolean {
  const tenantDir = path.join(BUILDS_DIR, tenantId);
  if (!fs.existsSync(tenantDir)) return false;
  fs.rmSync(tenantDir, { recursive: true, force: true });
  return true;
}
