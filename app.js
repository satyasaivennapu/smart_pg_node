import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import router from './src/router.js';

const app = express();
const PORT = process.env.PORT || 3500;

/* ✅ FIX: define __dirname in ES module */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* CORS */
app.use(cors({
   origin: '*',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization, x-channel-token'
}));

/* ✅ Serve static images */
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));

/* Middleware */
app.use(express.json());
app.use('/api', router);

/* Start server */
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
