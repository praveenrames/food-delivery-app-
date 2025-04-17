import express from 'express';
import { loginUser, registerUser,forgotPassword, resetPassword } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/forgotpassword', forgotPassword);
userRouter.post('/resetPassword', resetPassword);

export default userRouter