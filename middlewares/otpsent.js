const nodemailer=require('nodemailer')
const pool=require('../services/postgre')
async function otpSent(req,res,next){
try{
    const {userId}=req.body;
    const r=await pool.query('SELECT email FROM login_details WHERE userid=$1',[userId])
    const email=r.rows[0].email
    if(!email){
        res.status(404).json({msg:'user not found'})
    }
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
    const response=await transporter.sendMail(mailoptions)
     await pool.query(
        "DELETE FROM otpdetails WHERE userid = $1",
        [userId]
    );
    const result = await pool.query(`
        INSERT INTO otpdetails
        (userid,email,otp,otp_expires_at)
        VALUES ($1,$2,$3,$4)`, [userId, email, random, new Date(Date.now() + 10 * 60 * 1000)]);
if(result){ 
     res.status(200).json({msg:'Your account has been created successfully, please check your email for the OTP '})
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