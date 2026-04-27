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

registerBuildRoutes(app);

app.listen(PORT, () => {
  console.log(`Build API running at http://localhost:${PORT}`);
  console.log('POST   /builds                    - create build');
  console.log('DELETE /builds/:tenant_id/:id     - delete build');
  console.log('DELETE /builds?tenant_id=X        - delete all tenant builds');
});

export default app;
