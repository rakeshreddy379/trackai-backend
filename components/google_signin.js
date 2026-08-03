const { OAuth2Client } = require("google-auth-library");
const pool=require('../services/postgre.js')
const generateUserId=require('../components/generateUserId.js')
require("dotenv").config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const generateUserId=require('./generateUserId.js')
async function googleLogin(req, res) {

    const { idToken } = req.body;
    try{
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    console.log(payload);
    const email=payload.email
    const googleId = payload.sub;
     const result=await pool.query(`
        select * from login_details where email=$1`,[email])
    
    if(result.rows.length===0){
        const userid=await generateUserId();
        console.log(userid);
          await pool.query(`insert into login_details(email,userid,is_verified,google_id) values($1,$2,$3,$4)`,[email,userid,true,googleId]

          )
           res.status(200).json({userid:userid})
    }
    else{
       
        res.status(200).json({userid:result.rows[0].userid})
    }
}
    catch(err){
        res.status(401).json({msg:'invalid google token'})
    }
    /*
    payload.email
    payload.name
    payload.picture
    payload.sub
    */

}
module.exports=googleLogin
