import { Router } from 'express';
import { BuildConfig } from './types.js';
import { createBuild, deleteBuild, deleteAllTenantBuilds } from './services.js';

const router = Router();

export function registerBuildRoutes(app: import('express').Application): void {
  app.use(router);

  router.post('/builds', (req, res) => {
    const { tenant_id, config } = req.body as { tenant_id: string; config: BuildConfig };

    if (!tenant_id || typeof tenant_id !== 'string') {
      res.status(400).json({ error: 'tenant_id is required' });
      return;
    }

    if (!config || typeof config !== 'object') {
      res.status(400).json({ error: 'config is required' });
      return;
    }

    try {
      const buildId = createBuild(tenant_id, config);
      res.json({
        tenant_id,
        build_id: buildId,
        created_at: new Date().toISOString(),
        status: 'pending',
      });
    } catch (err) {
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.delete('/builds/:tenant_id/:build_id', (req, res) => {
    const { tenant_id, build_id } = req.params;

    if (deleteBuild(tenant_id, build_id)) {
      res.json({ message: 'Build deleted', tenant_id, build_id });
    } else {
      res.status(404).json({ error: 'Build not found' });
    }
  });

  router.delete('/builds', (req, res) => {
    const tenant_id = req.query.tenant_id as string | undefined;

    if (!tenant_id || typeof tenant_id !== 'string') {
      res.status(400).json({ error: 'tenant_id query param is required' });
      return;
    }

    const deleted = deleteAllTenantBuilds(tenant_id);
    if (deleted) {
      res.json({ message: 'Builds deleted', tenant_id });
    } else {
      res.json({ message: 'No builds to delete', tenant_id });
    }
  });
}
