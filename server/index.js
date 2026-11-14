import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { assertProductionConfig, isProduction, port } from './config.js';

assertProductionConfig();

const app = express();
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

app.set('trust proxy', 1);
app.use(express.json({ limit: '32kb' }));
app.use(session({
  name: 'sfdesk.sid',
  secret: process.env.SESSION_SECRET || 'local-development-only-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.COOKIE_SECURE === 'true' || isProduction,
    maxAge: 8 * 60 * 60 * 1000,
  },
}));

app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

if (isProduction) {
  app.use(express.static(path.join(projectRoot, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(projectRoot, 'dist', 'index.html')));
}

app.listen(port, () => console.log(`Salesforce Desk server listening on ${port}`));
