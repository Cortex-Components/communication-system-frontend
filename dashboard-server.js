import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

const ENV_PATH = path.join(__dirname, '.env');

// Read config from .env
app.get('/api/config', (req, res) => {
    try {
        const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
        const config = dotenv.parse(envContent);
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read .env file', details: error.message });
    }
});

// Update config in .env
app.post('/api/config', (req, res) => {
    try {
        const newConfig = req.body;
        let envContent = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, 'utf-8') : '';
        
        for (const [key, value] of Object.entries(newConfig)) {
            // Safely quote value if it contains spaces and is not already quoted
            let safeValue = value;
            if (typeof value === 'string' && value.includes(' ') && !value.startsWith('"') && !value.startsWith("'")) {
                safeValue = `"${value}"`;
            }

            const regex = new RegExp(`^${key}=.*$`, 'm');
            if (regex.test(envContent)) {
                envContent = envContent.replace(regex, `${key}=${safeValue}`);
            } else {
                // Ensure there is a newline before appending if not empty
                if (envContent && !envContent.endsWith('\n')) {
                    envContent += '\n';
                }
                envContent += `${key}=${safeValue}\n`;
            }
        }
        
        fs.writeFileSync(ENV_PATH, envContent);
        res.json({ message: 'Config updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update .env file', details: error.message });
    }
});

// Trigger build
app.post('/api/build', (req, res) => {
    console.log('Building project...');
    exec('npm run build', (error, stdout, stderr) => {
        if (error) {
            console.error(`Build error: ${error.message}`);
            return res.status(500).json({ error: 'Build failed', details: error.message, stderr });
        }
        console.log('Build complete!');
        res.json({ 
            message: 'Build successful', 
            stdout,
            scriptLink: `http://localhost:${PORT}/cortex-chat-widget.umd.js`
        });
    });
});

app.listen(PORT, () => {
    console.log(`Dashboard backend running at http://localhost:${PORT}`);
    console.log(`Access the dashboard UI via Vite's dev server.`);
});
