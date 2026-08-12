const pool=require('../services/postgre.js')
async function getLogin(req,res,next){
  try{
   const r=await  pool.query(`select current_database()`)
  const result=await pool.query(`
  SELECT * FROM login_details`);
  res.status(200).json({result:result.rows,r:r})
  }
  catch(err){
    console.log('error in login_logs:',err)
    res.status(500).json({msg:'some internal server'})
  }
}
module.exports=getLogin
