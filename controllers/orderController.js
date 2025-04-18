import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import dotenv from 'dotenv';
dotenv.config();
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECERET_KEY)

// Placing user order for frontend

export const placeOrder = async (req, res) => {
    const frontend_url = 'https://delivery-website-admin.netlify.app';
    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        })

        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, {cartData:{}});

        const line_items = req.body.items.map((item) => ({
            price_data : {
                currency: 'lkr',
                product_data: {
                    name: item.name
                },
                unit_amount:item.price*100*300
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data:{
               currency: 'lkr',
               product_data:{
                name:'Delivery Charges'
               },
               unit_amount:2*100*80 
            },
            quantity:1
        })

        const session = await stripe.checkout.sessions.create({
            line_items:line_items,
            mode:'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`
        })

        return res.status(200).json({success:true, session_url:session.url})
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message: 'Internal server error'})
    }
}

export const verifyOrder = async (req, res) => {
    const {orderId, success} = req.body;
    try {
        if (success=='true'){
            await orderModel.findOneAndUpdate(orderId, {payment:true});
            res.status(300).json({success:true, message:'Paid'})
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.status(301).json({success:false, message:'Not Paid'})
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'})
    }
}

// user orders for frontend

export const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({userId:req.body.userId});
        return res.status(200).json({success:true, data:orders})
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'})
    }
}

// listing orders for admin panel

export const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        return res.status(200).json({success:true, data:orders})
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'})
    }
}

// api for updating order status

export const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, {status:req.body.status});
        return res.status(200).json({success:true, message:'Internal server error'});
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'});
    }
}