import express from 'express';
const app=express();
import router from './src/router.js';
import cors from 'cors';

const PORT= process.env.port || 3000;
app.use(cors({
  origin: 'http://localhost:4200',  // Angular app
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization, x-channel-token'
}));
// Middleware to parse JSON
app.use(express.json());
app.use('/api', router);

app.listen(PORT,()=>{
 console.log(`Server is running on http://localhost:${PORT}`);
});