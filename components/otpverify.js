const pool=require('../services/postgre')
const {setUid,getUid}=require('../services/auth.js')
async function otpverify(req,res,next){
    try{
        console.log('verify otp')
    const {otp,userid}=req.body
    console.log(otp)
    const result=await pool.query('SELECT * FROM otpdetails WHERE userid=$1',[userid])
    if(!result.rows[0]){
                res.status(404).json({msg:'otp is mismatched'})
    }   
    console.log(result.rows[0],typeof result.rows[0].userid)
    console.log(otp,typeof userid)
    if (
    String(otp) === String(result.rows[0].otp) &&
    result.rows[0].otp_expires_at > new Date() &&
    String(userid) === String(result.rows[0].userid)
){
        const token=await setUid(result.rows[0])
        try  {  
            await pool.query("UpDATE login_details SET is_verified = true WHERE userid = $1", [userid]);
            res.cookie('otptoken', token, { httpOnly: false});
        console.log('cookie is done') // Cookie will expire in 1 hour);
        res.status(200).json({msg:'otp verified',userId:result.rows[0].userid})
    }
    catch(error){
            next(error)
         }
    }
    else{
        res.status(404).json({msg:'otp is mismatched'})
    }}
    catch(error){
        next(error)
    }
}
module.exports=otpverify