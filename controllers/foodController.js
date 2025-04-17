import foodModel from '../models/foodModel.js';
import fs from 'fs'; // file system prebuilt in node

// add food item

export const addFood = async (req, res) => {
    let image_filename = `${req.file.filename}`;

    const food = new foodModel ({
        name : req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename
    });
    try {
        await food.save();
        res.status(200).json({success:true, message:'Food successfully added'})
    } catch (error) {-
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'})
    }
}

// list all food

export const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.status(200).json({success:true, data:foods});
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'})
    }
}

// remove food item

export const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`,() => {});

        await foodModel.findByIdAndDelete(req.body.id);
        res.status(200).json({success:true, message:'Food Removed'});
    } catch (error) {
        console.log(error);
        res.status(401).json({success:true, message:'Internal server error'});
    }
}

// update food item

export const updateFood = async (req, res) => {
    try {
        const foodId = req.params.id;
        const food = req.body;
        const findFood = await foodModel.findById(foodId);
        if (!findFood){
            return res.status(300).json({success:false, message:'Food item not found'});
        }
        const UpdateFoodItem = await foodModel.findByIdAndUpdate(
            findFood,
            { $set: food },
            { new: true, runValidators: true },
        );
        return res.status(200).json({success:true, message:'Food Item updated successfully', data:[UpdateFoodItem]});
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'})
    }
}