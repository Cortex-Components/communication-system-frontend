import express from 'express';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import crypto from 'crypto';
import { getBuildDir, writeEnvFile, listBuilds, readStatus, BUILD_FILES } from '../utils/storage.js';
import { spawnBuild } from '../utils/builder.js';

const router = express.Router();

export function createBuildRouter(tenantsDir, projectRoot) {
    router.post('/', (req, res) => {
        const { tenant_id, config } = req.body;
        if (!tenant_id || !config) {
            return res.status(400).json({ error: 'tenant_id and config are required' });
        }

        const buildId = crypto.randomUUID();
        const buildDir = getBuildDir(tenantsDir, tenant_id, buildId);

        fs.mkdirSync(buildDir, { recursive: true });
        writeEnvFile(buildDir, config);
        spawnBuild(projectRoot, tenant_id, buildId, buildDir);

        res.json({ tenant_id, build_id: buildId, created_at: new Date().toISOString(), status: 'pending' });
    });

    router.get('/', (req, res) => {
        const { tenant_id } = req.query;
        if (!tenant_id) {
            return res.status(400).json({ error: 'tenant_id query param is required' });
        }
        res.json({ tenant_id, builds: listBuilds(tenantsDir, tenant_id) });
    });

    router.get('/:tenant_id/:build_id/status', (req, res) => {
        const { tenant_id, build_id } = req.params;
        const buildDir = getBuildDir(tenantsDir, tenant_id, build_id);

        if (!fs.existsSync(buildDir)) {
            return res.status(404).json({ error: 'Build not found' });
        }

        const status = readStatus(buildDir);
        const hasDist = fs.existsSync(path.join(buildDir, 'dist'));

        res.json({
            tenant_id, build_id,
            status: status?.status || 'unknown',
            error: status?.error,
            updated_at: status?.updated_at,
            files: hasDist ? BUILD_FILES : []
        });
    });

    router.get('/:tenant_id/:build_id/download', (req, res) => {
        const { tenant_id, build_id } = req.params;
        const buildDir = getBuildDir(tenantsDir, tenant_id, build_id);
        const distDir = path.join(buildDir, 'dist');

        if (!fs.existsSync(buildDir)) {
            return res.status(404).json({ error: 'Build not found' });
        }

        const status = readStatus(buildDir);
        if (status?.status !== 'completed') {
            return res.status(400).json({ error: 'Build not completed yet', status: status?.status });
        }

        const zipPath = path.join(buildDir, 'build.zip');
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            res.download(zipPath, `${tenant_id}-${build_id}.zip`, (err) => {
                if (err) console.error('Download error:', err);
                try { fs.unlinkSync(zipPath); } catch (e) { /* ignore cleanup fail */ }
            });
        });

        archive.on('error', (err) => {
            try { fs.unlinkSync(zipPath); } catch (e) { /* ignore cleanup fail */ }
            res.status(500).json({ error: 'Failed to create zip' });
        });

        archive.pipe(output);
        archive.directory(distDir, 'dist');
        archive.finalize();
    });

    router.delete('/:tenant_id/:build_id', (req, res) => {
        const { tenant_id, build_id } = req.params;
        const buildDir = getBuildDir(tenantsDir, tenant_id, build_id);

        try {
            fs.rmSync(buildDir, { recursive: true, force: true });
            res.json({ message: 'Build deleted', tenant_id, build_id });
        } catch (error) {
            if (error.code === 'ENOENT') {
                return res.status(404).json({ error: 'Build not found' });
            }
            res.status(500).json({ error: 'Failed to delete build', details: error.message });
        }
    });

    router.delete('/', (req, res) => {
        const { tenant_id } = req.query;
        if (!tenant_id) {
            return res.status(400).json({ error: 'tenant_id query param is required' });
        }

        const tenantDir = path.join(tenantsDir, tenant_id);
        try {
            fs.rmSync(tenantDir, { recursive: true, force: true });
            res.json({ message: 'Builds deleted', tenant_id });
        } catch (error) {
            if (error.code === 'ENOENT') {
                return res.json({ message: 'No builds to delete', tenant_id });
            }
            res.status(500).json({ error: 'Failed to delete builds', details: error.message });
        }
    });

    return router;
}
