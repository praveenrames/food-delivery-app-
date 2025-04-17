import express from 'express';
import { addFood,listFood,removeFood,updateFood } from '../controllers/foodController.js';
import multer from 'multer';

const foodRoute = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({
    destination:'uploads',
    filename: (req,file,cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({storage:storage})
foodRoute.post('/addfood', upload.single('image'),addFood);
foodRoute.get('/listfood', listFood);
foodRoute.post('/removefood', removeFood);
foodRoute.put('/updatefood', updateFood);

export default foodRoute;