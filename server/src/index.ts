import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;
const PROJECT_ROOT = process.cwd();
const BUILDS_DIR = path.join(PROJECT_ROOT, 'builds');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

fs.mkdirSync(BUILDS_DIR, { recursive: true });

// POST /builds - Create a new build
app.post('/builds', (req, res) => {
  const { tenant_id, config } = req.body;

  if (!tenant_id || typeof tenant_id !== 'string') {
    res.status(400).json({ error: 'tenant_id is required' });
    return;
  }

  if (!config || typeof config !== 'object') {
    res.status(400).json({ error: 'config is required' });
    return;
  }

  const buildId = crypto.randomUUID();
  const buildDir = path.join(BUILDS_DIR, tenant_id, buildId);
  const distDir = path.join(buildDir, 'dist');

  fs.mkdirSync(buildDir, { recursive: true });

  // Write initial status
  fs.writeFileSync(
    path.join(buildDir, 'status.json'),
    JSON.stringify({ status: 'pending', updated_at: new Date().toISOString() })
  );

  // Build env with WIDGET_ prefix
  const buildEnv: NodeJS.ProcessEnv = { ...process.env };
  for (const [key, value] of Object.entries(config)) {
    buildEnv[`WIDGET_${key}`] = String(value);
  }

  // Start build asynchronously with env vars
  exec('npm run build', { cwd: PROJECT_ROOT, env: buildEnv, timeout: 300000 }, (error) => {
    if (error) {
      fs.writeFileSync(
        path.join(buildDir, 'status.json'),
        JSON.stringify({ status: 'failed', error: error.message, updated_at: new Date().toISOString() })
      );
      console.error(`Build failed for ${tenant_id}/${buildId}: ${error.message}`);
      return;
    }

    // Copy dist to build dir
    const srcDist = path.join(PROJECT_ROOT, 'dist');
    if (fs.existsSync(srcDist)) {
      fs.mkdirSync(distDir, { recursive: true });
      fs.cpSync(srcDist, distDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(buildDir, 'status.json'),
      JSON.stringify({ status: 'completed', updated_at: new Date().toISOString() })
    );
    console.log(`Build completed for ${tenant_id}/${buildId}`);
  });

  res.json({
    tenant_id,
    build_id: buildId,
    created_at: new Date().toISOString(),
    status: 'pending',
  });
});

// DELETE /builds/:tenant_id/:build_id - Delete a specific build
app.delete('/builds/:tenant_id/:build_id', (req, res) => {
  const { tenant_id, build_id } = req.params;
  const buildDir = path.join(BUILDS_DIR, tenant_id, build_id);

  if (!fs.existsSync(buildDir)) {
    res.status(404).json({ error: 'Build not found' });
    return;
  }

  fs.rmSync(buildDir, { recursive: true, force: true });
  res.json({ message: 'Build deleted', tenant_id, build_id });
});

// DELETE /builds?tenant_id=X - Delete all builds for a tenant
app.delete('/builds', (req, res) => {
  const tenant_id = req.query.tenant_id as string | undefined;

  if (!tenant_id || typeof tenant_id !== 'string') {
    res.status(400).json({ error: 'tenant_id query param is required' });
    return;
  }

  const tenantDir = path.join(BUILDS_DIR, tenant_id);

  if (!fs.existsSync(tenantDir)) {
    res.json({ message: 'No builds to delete', tenant_id });
    return;
  }

  fs.rmSync(tenantDir, { recursive: true, force: true });
  res.json({ message: 'Builds deleted', tenant_id });
});

app.listen(PORT, () => {
  console.log(`Build API running at http://localhost:${PORT}`);
  console.log('POST   /builds                    - create build');
  console.log('DELETE /builds/:tenant_id/:id     - delete build');
  console.log('DELETE /builds?tenant_id=X        - delete all tenant builds');
});

export default app;
