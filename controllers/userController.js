import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';
import validator from 'validator';


// login user

export const loginUser = async (req, res) => {
    const {email, password} = req.body
    try {
        const user = await userModel.findOne({email});
        if (!user){
            return res.status(200).json({success:false, message:'user does not exist'});
        }
        const userPassword = await bcrypt.compare(password, user.password);
        if (!userPassword){
            return res.status(300).json({success:false, message:'Invalid password'})
        }
        const token = createToken(user._id);
        res.status(200).json({success:true, token});
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'});
    }
};

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET)
}

// register user

export const registerUser = async (req, res) => {
    const {name, email, password} = req.body;
    try {
        // checking if user already exits
        const exists = await userModel.findOne({email});
        if (exists){
            return res.json({success:false, message:'User already exists'});
        }

        // validating email format and strong password
        if (!validator.isEmail(email)){
            return res.status(300).json({success:false, message:'Please enter a valid email'});
        }

        if (password.length < 8) {
            return res.status(301).json({success:false, message:'Please enter a strong password'});
        };

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword,
        });
        const user = await newUser.save();
        const token = createToken(user._id);
        return res.status(200).json({success:true, token})
    } catch (error) {
        console.log(error);
        return res.status(401).json({success:false, message:'Internal server error'});
    }
}

// user frogot password

export const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        let users = await userModel.findOne({email});
        if (!users){
            return res.status(200).json({success:false, message:'User Not Found'})
        }
        const generatedOTP = () => {
            let characters = '0123456789';
            return Array.from({ length: 6 },
                () => characters[Math.floor(Math.random() * characters.length)]
            ).join('');
        };
        const OTP = generatedOTP();
        users.resetPasswordOtp = OTP;
        users.resetPasswordExpires = new Date(Date.now() + 3600000);
        await users.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
               user:process.env.USER_MAILER,
               pass:process.env.PASS_MAILER
            }
        });
        const mailOptions = {
            from: 'praveen123@gmail.com',
            to: users.email,
            subject: 'Password Reset',
            html: `
              <p>Dear: ${users.name}</P>
              <p>we received a request to reset your password. Here is your one-Time password (OTP): <strong>${OTP}</strong></P>
              <p>Please Click the following link to reset your passsword:</P>
              <a href=''>Reset Password</a>
              <p>Thank you</p>  
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
        res.status(401).json({success:false, message:'Internal server error'});
    }
}


// user Reset password

export const resetPassword = async (req, res) => {
     try {
        const {email, OTP, newpassword} = req.body;

        if (!email || !OTP || !newpassword) {
            return res.status(300).json({message:'Email, OTP and new password are required'});
        }

        const users = await userModel.findOne({
            email,
            resetPasswordOtp: OTP,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!users){
            const message = users ? 'OTP is Expired' : 'Invalid OTP';
            return res.status(300).json({message})
        }

        const saltRounds = 15;
        const hashPassword = await bcrypt.hash(newpassword, saltRounds);
        console.log(hashPassword);
        users.password = hashPassword;
        users.resetPasswordOtp = null;
        users.resetPasswordExpires = null;

        await users.save()

        res.status(200).json({success:true, message:'Password reset successfully'})

     } catch (error) {
        console.log(error);
        res.status(401).json({message:'Internal server error'})
     }
}