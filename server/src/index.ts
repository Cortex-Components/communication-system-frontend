import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { registerBuildRoutes } from './api.js';

const app = express();
const PORT = process.env.PORT || 8080;
const BUILDS_DIR = '/cortexhome/builds';

// Request logging middleware
app.use((req, _res, next) => {
  const start = Date.now();
  _res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${_res.statusCode} (${duration}ms)`);
  });
  next();
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Log incoming requests with body for debugging
app.use((req, _res, next) => {
  if (req.path === '/builds' && req.method === 'POST') {
    console.log(`[${new Date().toISOString()}] POST /builds - incoming body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

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
  console.log(`[${new Date().toISOString()}] Build API server started on port ${PORT}`);
  console.log(`[${new Date().toISOString()}] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[${new Date().toISOString()}] Builds directory: ${BUILDS_DIR}`);
});

export default app;
