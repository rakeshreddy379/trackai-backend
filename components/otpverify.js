const pool=require('../services/postgre')
const {setUid,getUid}=require('../services/auth.js')
async function otpverify(req,res,next){
    try{
    const {otp,userId}=req.body
    console.log(otp,userId)
    const result=await pool.query('SELECT * FROM otpdetails WHERE userid=$1',[userId])
    if(!result.rows[0]){
                res.status(404).json({msg:'otp is mismatched'})
    }   
    console.log(result.rows[0],typeof result.rows[0].userid)
    console.log(otp,typeof userId)
    if(otp==result.rows[0].otp && (result.rows[0].expirytime)<new Date() && String(userId)==result.rows[0].userid){
        const token=await setUid(result.rows[0])
        try  {  
            await pool.query("UpDATE login_details SET is_verified = true WHERE userid = $1", [userId]);
            res.cookie('otptoken', token, { httpOnly: false});
        console.log('cookie is done') // Cookie will expire in 1 hour);
        res.status(200).json({msg:'otp verified',userid:result.rows[0].userid})
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