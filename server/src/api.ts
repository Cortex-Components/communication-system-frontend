import { Router } from 'express';
import { BuildConfig } from './types.js';
import { createBuild, deleteBuild, deleteAllTenantBuilds } from './services.js';

const router = Router();

export function registerBuildRoutes(app: import('express').Application): void {
  app.use(router);

  router.post('/builds', (req, res) => {
    console.log(`[${new Date().toISOString()}] POST /builds - received request`);
    
    if (!req.body) {
      console.error(`[${new Date().toISOString()}] POST /builds - ERROR: Request body is undefined or empty`);
      res.status(400).json({ error: 'Request body is required' });
      return;
    }

    const { tenant_id, config } = req.body as { tenant_id: string; config: BuildConfig };
    console.log(`[${new Date().toISOString()}] POST /builds - tenant_id: ${tenant_id}, config:`, JSON.stringify(config, null, 2));

    if (!tenant_id || typeof tenant_id !== 'string') {
      console.error(`[${new Date().toISOString()}] POST /builds - ERROR: tenant_id is missing or invalid`);
      res.status(400).json({ error: 'tenant_id is required' });
      return;
    }

    if (!config || typeof config !== 'object') {
      console.error(`[${new Date().toISOString()}] POST /builds - ERROR: config is missing or invalid`);
      res.status(400).json({ error: 'config is required' });
      return;
    }

    try {
      console.log(`[${new Date().toISOString()}] POST /builds - Creating build for tenant: ${tenant_id}`);
      const buildId = createBuild(tenant_id, config);
      console.log(`[${new Date().toISOString()}] POST /builds - Build created with ID: ${buildId}`);
      res.json({
        tenant_id,
        build_id: buildId,
        created_at: new Date().toISOString(),
        status: 'pending',
      });
    } catch (err) {
      console.error(`[${new Date().toISOString()}] POST /builds - ERROR: ${(err as Error).message}`);
      res.status(400).json({ error: (err as Error).message });
    }
  });

  router.delete('/builds/:tenant_id/:build_id', (req, res) => {
    const { tenant_id, build_id } = req.params;
    console.log(`[${new Date().toISOString()}] DELETE /builds/${tenant_id}/${build_id}`);

    if (deleteBuild(tenant_id, build_id)) {
      console.log(`[${new Date().toISOString()}] DELETE /builds/${tenant_id}/${build_id} - SUCCESS`);
      res.json({ message: 'Build deleted', tenant_id, build_id });
    } else {
      console.warn(`[${new Date().toISOString()}] DELETE /builds/${tenant_id}/${build_id} - NOT FOUND`);
      res.status(404).json({ error: 'Build not found' });
    }
  });

  router.delete('/builds', (req, res) => {
    const tenant_id = req.query.tenant_id as string | undefined;
    console.log(`[${new Date().toISOString()}] DELETE /builds?tenant_id=${tenant_id}`);

    if (!tenant_id || typeof tenant_id !== 'string') {
      console.error(`[${new Date().toISOString()}] DELETE /builds - ERROR: tenant_id query param is required`);
      res.status(400).json({ error: 'tenant_id query param is required' });
      return;
    }

    const deleted = deleteAllTenantBuilds(tenant_id);
    if (deleted) {
      console.log(`[${new Date().toISOString()}] DELETE /builds?tenant_id=${tenant_id} - SUCCESS`);
      res.json({ message: 'Builds deleted', tenant_id });
    } else {
      console.log(`[${new Date().toISOString()}] DELETE /builds?tenant_id=${tenant_id} - NO BUILDS TO DELETE`);
      res.json({ message: 'No builds to delete', tenant_id });
    }
  });
}
