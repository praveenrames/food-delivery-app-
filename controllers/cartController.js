import userModel from '../models/userModel.js';


// add items to cart

export const addToCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        if(!cartData[req.body.itemId]){
            cartData[req.body.itemId] = 1
        } else {
            cartData[req.body.itemId] += 1
        }

        await userModel.findByIdAndUpdate(req.body.userId, {cartData});
        return res.status(200).json({success:true, message:'Added to cart'});
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'});
    }
}

// remove items to user cart

export const removeFromCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;

        if (cartData[req.body.itemId]>0){
            cartData[req.body.itemId] -= 1;
        }

        await userModel.findByIdAndUpdate(req.body.userId, {cartData});
        return res.status(200).json({success:true, message:'Removed from cart'});
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'});
    }
}

// fetch user cart Data

export const getCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        res.status(200).json({success:true, cartData})
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'})
    }
}