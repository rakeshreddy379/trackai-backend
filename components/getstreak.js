const pool = require("../services/postgre");
async function getStreak(req,res,next){
    try{
    const {userid}=req.query || req.params
  const result = await pool.query(`
    SELECT *
    FROM streaks
    WHERE userid = $1
`, [userid]);
console.log(result.rows);
res.status(200).json({data:result.rows})
  }
  catch(error){
    res.status(500).json({msg:"internel server"})

  }
}
module.exports=getStreak
