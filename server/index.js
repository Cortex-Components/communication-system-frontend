import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBuildRouter } from './routes/builds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const TENANTS_DIR = process.env.BUILDS_DIR || path.join(__dirname, '../builds');
const PROJECT_ROOT = __dirname;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

fs.mkdirSync(TENANTS_DIR, { recursive: true });

app.use('/builds', createBuildRouter(TENANTS_DIR, PROJECT_ROOT));

app.listen(PORT, () => {
    console.log(`Multi-Tenant Build API running at http://localhost:${PORT}`);
    console.log('POST   /builds                                - create build');
    console.log('GET    /builds?tenant_id=X                    - list tenant builds');
    console.log('GET    /builds/:tenant_id/:build_id/status    - get status');
    console.log('GET    /builds/:tenant_id/:build_id/download  - download zip');
    console.log('DELETE /builds/:tenant_id/:build_id           - delete build');
    console.log('DELETE /builds?tenant_id=X                   - delete all tenant builds');
});

export default app;
