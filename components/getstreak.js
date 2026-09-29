const pool = require("../services/postgre");
async function getStreak(req,res,next){
    try{
    const {userid}=req.query || req.params
  const result = await pool.query(`
    SELECT *
    FROM streaks
    WHERE userid = $1
      AND streak_date::DATE = (CURRENT_TIMESTAMP - INTERVAL '1 day')::DATE
`, [userid]);
console.log(result.rows);
res.status(200).json({data:result.rows[0]})
  }
  catch(error){
    res.status(500).json({msg:"internel server"})

  }
}
module.exports=getStreak
