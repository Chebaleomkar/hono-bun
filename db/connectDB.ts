
import mongoose from "mongoose";

export default async function connectDB (){
    await mongoose.connect(String(process.env.MONGODB_URL))
    console.log('DB connected Successfully ...')
}