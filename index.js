import express, { json } from 'express'
import mongoose from "mongoose";
import AdminRoutes from './src/routes/adminroutes.js'
const app = express();
const router = express.Router();
import dotenv from 'dotenv'
import cors from 'cors';
import connectToDb from './src/database/index.js';
dotenv.config();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json())
app.use("/api", AdminRoutes);
// app.listen(PORT, console.log(`Backend is running on port:${PORT}`));

const startServer = async () => {
    try {
        await connectToDb()
        app.listen(PORT, () => {
            console.log(`server running on ${PORT}`);
        })
    } catch (error) {
        console.log("MONGO db connection failed !!! ", error);
    }
}
startServer();