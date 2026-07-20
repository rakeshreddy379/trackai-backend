const express = require('express');
const multer=require('multer')
const signup=require('../components/signup.js')
const userExists=require('../middlewares/userexists.js')
const otpSent=require('../middlewares/otpsent.js')
const otpVerify=require('../components/otpverify.js')
const login=require('../components/login.js')
const {analyzeFood}=require('../components/geminiscan.js') 
const calculateCalories = require('../components/profile.js')
const getProfile = require('../components/getProfile.js')
const {saveSteps} = require('../components/countsteps.js')
const {getFoodNutrients}=require('../components/fatsecret.js')
const {getUSDAFoodNutrients}=require('../components/usda.js')
const updateProfile = require('../components/editProfile.js')
const resetPassword = require('../components/resetPassword.js')
const createOrder = require("../components/createOrder");
const { getSteps, getStepsRange } = require('../components/getSteps.js');
const verifyPayment = require("../components/verifyPayment");
const router = express.Router();    
const upload = multer({
    dest: "uploads/"
});
router.post(
    "/analyze-food",
    upload.single("image"),
    analyzeFood
);
router.get('/health', (req, res)  => {
    res.status(200).json({ msg: 'Server is healthy' });
});
router.post('/signup',signup,otpSent)
router.post('/signup/otpverify',userExists,otpVerify)
router.post('/login', login);
router.post('/analyze-food', upload.single('image'), userExists,analyzeFood);
router.post('/count-steps',userExists,saveSteps);
router.get("/food",userExists, getFoodNutrients);
router.get("/get-profile", userExists, getProfile);
router.get('/usda', userExists, getUSDAFoodNutrients);
router.post('/profile',userExists,calculateCalories)
router.post("/subscription/create-order", userExists, createOrder);
router.post("/subscription/verify",userExists, verifyPayment);
router.put('/profile',userExists,updateProfile)
router.post('/reset-password',userExists, otpSent, resetPassword);
router.post('/forgot-password', userExists,otpVerify, resetPassword);

 router.get('/get-steps',userExists,getSteps);
router.get('/get-steps-range',userExists,getStepsRange);
module.exports=router
