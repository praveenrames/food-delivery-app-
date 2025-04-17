import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './Database/db.config.js';
import userRouter from './routes/userRoute.js';
import foodRouter from './routes/foodRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
dotenv.config();

// app config
const app = express();

// middleware
app.use(express.json());
app.use(cors());


// Database connection
connectDB();

//api endpoints
app.use('/api/user', userRouter);
app.use('/images', express.static('uploads'));
app.use('/api/food', foodRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);


app.get('/', (req, res) => {
    res.status(200).json({message:'Welcom to API'})
})


app.listen(process.env.PORT, () => {
    console.log(`server is listen on PORT : ${process.env.PORT}`);
})


