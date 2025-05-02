import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();
const MONGODB_URI = process.env.URI
const connectToDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(MONGODB_URI)
        console.log("connected to mongodb");

    } catch (error) {
        console.error("MONGODB connection Failed: " + error);

    }
}
export default connectToDb;