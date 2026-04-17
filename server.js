import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import clientUserRoutes from './routes/clientUserRoutes.js';
import plantRoutes from './routes/plantroutes.js'
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
const PORT = process.env.PORT || 5000;


app.use('/api/v2/users', userRoutes);
app.use('/api/v2/client', clientUserRoutes);
app.use('/api/v2', plantRoutes)

// Test route
app.get("/test", (req, res) => {
    console.log("Test log working")
  res.send("working");
});

app.listen(80, "0.0.0.0", () => {
  console.log("Server running on 5000");
});
