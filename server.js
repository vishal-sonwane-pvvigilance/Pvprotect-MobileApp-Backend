import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import clientUserRoutes from './routes/clientUserRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;


app.use('/api/users', userRoutes);
app.use('/api/client', clientUserRoutes);

// Test route
app.get("/test", (req, res) => {
    console.log("Test log working")
  res.send("working");
});

app.listen(5000, () => {
  console.log("Server running on 5000");
});
