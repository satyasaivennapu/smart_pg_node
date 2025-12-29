import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import router from './src/router.js';

const app = express();
const PORT = process.env.PORT || 3000;

/* ✅ FIX: define __dirname in ES module */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* CORS */
app.use(cors({
  origin: 'http://localhost:4200',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization, x-channel-token'
}));

/* ✅ Serve static images */
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));

/* Middleware */
app.use(express.json());
app.use('/api', router);

/* Start server */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
