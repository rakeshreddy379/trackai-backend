const pool=require('../services/postgre.js')
async function login_logs(req,res,next){
  try{
  const result=await pool.query(`
  SELECT * FROM login_logs`);
  res.status(200).json({result:result.rows})
  }
  catch(err){
    console.log('error in login_logs:',err)
    res.status(500).json({msg:'some internal server'})
  }
}
module.exports=login_logs
