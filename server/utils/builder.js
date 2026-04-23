import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { writeStatus } from './storage.js';

export function spawnBuild(projectRoot, tenantId, buildId, buildDir, onComplete) {
    writeStatus(buildDir, 'pending');

    // Use per-build temp directory to avoid race conditions
    const tempDist = path.join(projectRoot, '.dist-temp', buildId);

    const buildProcess = exec(
        'npm run build',
        { cwd: projectRoot, timeout: 300000 },
        (error) => {
            if (error) {
                console.error(`Build failed for ${tenantId}/${buildId}: ${error.message}`);
                writeStatus(buildDir, 'failed', error.message);
                // Cleanup temp dir on failure
                fs.rmSync(tempDist, { recursive: true, force: true });
                return;
            }

            const destDist = path.join(buildDir, 'dist');
            try {
                fs.mkdirSync(destDist, { recursive: true });
                fs.cpSync(tempDist, destDist, { recursive: true });
                // Cleanup temp dir
                fs.rmSync(path.join(projectRoot, '.dist-temp'), { recursive: true, force: true });
                writeStatus(buildDir, 'completed');
                console.log(`Build completed for ${tenantId}/${buildId}`);
                onComplete?.();
            } catch (copyError) {
                writeStatus(buildDir, 'failed', copyError.message);
            }
        }
    );

    buildProcess.stdout?.on('data', (data) => console.log(`Build: ${data}`));
    buildProcess.stderr?.on('data', (data) => console.error(`Build stderr: ${data}`));

    return buildProcess;
}
