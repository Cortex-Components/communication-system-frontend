import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { registerBuildRoutes } from './api.js';

const app = express();
const PORT = process.env.PORT || 3000;
const BUILDS_DIR = path.join(process.cwd(), 'builds');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

fs.mkdirSync(BUILDS_DIR, { recursive: true });

app.get('/health', (_req, res) => {
  const testFile = path.join(BUILDS_DIR, '.health-check-tmp');
  try {
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    res.json({ status: 'ok', builds_write: true, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', builds_write: false, error: (err as Error).message, timestamp: new Date().toISOString() });
  }
});

registerBuildRoutes(app);

app.listen(PORT, () => {
  console.log(`Build API running at http://localhost:${PORT}`);
  console.log('POST   /builds                    - create build');
  console.log('DELETE /builds/:tenant_id/:id     - delete build');
  console.log('DELETE /builds?tenant_id=X        - delete all tenant builds');
});

export default app;
