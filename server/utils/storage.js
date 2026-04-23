import fs from 'fs';
import path from 'path';

export const BUILD_FILES = ['cortex-chat-widget.es.js', 'cortex-chat-widget.umd.js'];

export function getBuildDir(tenantsDir, tenantId, buildId) {
    return path.join(tenantsDir, tenantId, buildId);
}

export function writeEnvFile(buildDir, config) {
    let envContent = '';
    for (const [key, value] of Object.entries(config)) {
        let safeValue = value;
        if (typeof value === 'string' && value.includes(' ') && !value.startsWith('"') && !value.startsWith("'")) {
            safeValue = `"${value}"`;
        }
        envContent += `${key}=${safeValue}\n`;
    }
    fs.writeFileSync(path.join(buildDir, '.env'), envContent);
}

export function writeStatus(buildDir, status, error = null) {
    const obj = { status, updated_at: new Date().toISOString() };
    if (error) obj.error = error;
    fs.writeFileSync(path.join(buildDir, 'status.json'), JSON.stringify(obj, null, 2));
}

export function readStatus(buildDir) {
    const p = path.join(buildDir, 'status.json');
    try {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
    } catch {
        return null;
    }
}

export function listBuilds(tenantsDir, tenantId) {
    const tenantDir = path.join(tenantsDir, tenantId);
    if (!fs.existsSync(tenantDir)) return [];

    return fs.readdirSync(tenantDir, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(entry => {
            const buildDir = getBuildDir(tenantsDir, tenantId, entry.name);
            const status = readStatus(buildDir);
            const hasDist = fs.existsSync(path.join(buildDir, 'dist'));
            return {
                build_id: entry.name,
                tenant_id: tenantId,
                status: status?.status || 'unknown',
                files: hasDist ? BUILD_FILES : []
            };
        });
}
