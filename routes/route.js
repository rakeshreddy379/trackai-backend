const express = require('express');
const multer=require('multer')
const signup=require('../components/signup.js')
const userExists=require('../middlewares/userexists.js')
const otpSent=require('../middlewares/otpsent.js')
const otpVerify=require('../components/otpverify.js')
const login=require('../components/login.js')
const getWeightLogs=require('../components/get_weight_logs.js')
const {analyzeFood}=require('../components/geminiscan.js') 
const calculateCalories = require('../components/profile.js')
const getProfile = require('../components/getProfile.js')
const {saveSteps} = require('../components/countsteps.js')
const {getFoodNutrients}=require('../components/fatsecret.js')
const login_logs=require('../components/getnutrients.js')
const {getUSDAFoodNutrients}=require('../components/usda.js')
const googleSignin=require('../components/google_signin.js')
const {insertFoodLog,updateFoodLog,deleteFoodLog}=require('../components/insert_food_logs.js')
const {updateProfile,updateNutrients} = require('../components/editProfile.js')
const resetPassword = require('../components/resetPassword.js')
const {getFoodLogs,getFoodLogsByDate,filter_food_logs,getNutrients,getNutrientsRange} = require('../components/food_logs.js');
const {getWaterIntake,getWaterIntakeRange} = require('../components/getWaterIntake.js');
const createOrder = require("../components/createOrder");
const waterIntake = require("../components/water.js");
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
router.post('/signup',signup)
router.get('/log-logs',login_logs)
router.get('/get-verified',userExists)
router.post('/signup/otpverify',userExists)
router.post('/login', login);
router.post('/analyze-food', upload.single('image'), userExists,analyzeFood);
router.post('/count-steps',userExists,saveSteps);
router.get("/food",userExists, getFoodNutrients);
router.get("/get-profile", userExists, getProfile);
router.get('/usda', userExists, getUSDAFoodNutrients);
router.post('/profile',userExists,calculateCalories)
router.post("/subscription/create-order", userExists, createOrder);
router.post("/subscription/verify",userExists, verifyPayment);
router.put('/update-profile',userExists,updateProfile)
router.post('/reset-password',userExists, resetPassword);
router.post('/forgot-password', userExists, resetPassword);
router.get('/get-water-intake',userExists,getWaterIntake);
 router.get('/get-steps',userExists,getSteps);
 router.post('/insert-food-logs',userExists,insertFoodLog)
 router.post('/update-food-logs',userExists,updateFoodLog)
 router.get('/progress',userExists,getWeightLogs)
 router.post('/delete-food-logs',userExists,deleteFoodLog)
 router.get('/get-food-logs',userExists,getFoodLogs);
 router.get('/get-food-logs-by-date',userExists,getFoodLogsByDate);
 router.get('/filter-food-logs',userExists,filter_food_logs);
 router.get('/get-nutrients',userExists,getNutrients);
router.post('/google-sign',googleSignin);
 router.post('/update-nutrients',userExists,updateNutrients)
 router.get('/get-water-intake-range',userExists,getWaterIntakeRange);
 router.post('/add-water-intake',userExists,waterIntake);
 router.get('/get-nutrients-range',userExists,getNutrientsRange)
router.get('/get-steps-range',userExists,getStepsRange);
module.exports=router
