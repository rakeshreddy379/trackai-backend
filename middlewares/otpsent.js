const nodemailer=require('nodemailer')
const pool=require('../services/postgre')
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
async function otpSent(req,res,next){
try{
    const {email}=req.body
    console.log(email)
    const r=await pool.query('SELECT * FROM login_details WHERE email=$1;',[email])
    
    const userId=r.rows[0].userid
    console.log(userId)
    if(r.rows.length===0){  
        res.status(404).json({msg:'user not found'})
    }
    console.log("Before sendMail");

    const transporter=nodemailer.createTransport({
      host: 'smtp.gmail.com',
  port: 465,
  secure: true,
        auth:{
            user:'gyanrock379@gmail.com',
            pass:'yljj cjhm pwnm difz'}
    })
    const random=Math.floor(Math.random()*100000
)
    const mailoptions={
        from:'gyanrock379@gmail.com',
        to:email,
        subject:`Your one time password(OTP) is ${random}`
    }
    try{
        console.time("sendMail");

    const response=await transporter.sendMail(mailoptions)
     await pool.query(
        "DELETE FROM otpdetails WHERE email = $1",
        [email]
    );
        console.timeEnd("sendMail");
    const result = await pool.query(`
        INSERT INTO otpdetails
        (userid,email,otp,otp_expires_at)
        VALUES ($1,$2,$3,$4)`, [userId, email, random, new Date(Date.now() + 10 * 60 * 1000)]);
if(result){ 
     res.status(400).json({userid:userId,msg:'verify your account, please check your email for the OTP '})
}
    
    else{
res.status(404).json({msg:'error'})
    }}
    catch(error){
        next(error)
    }
}
catch(error){
    next(error)
}

}
module.exports=otpSent
