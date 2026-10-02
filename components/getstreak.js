const pool = require("../services/postgre");
async function getStreak(req,res,next){
    try{
    const {userid}=req.query || req.params
  const calories = await pool.query(`
    SELECT *
    FROM streaks
    WHERE userid = $1
`, [userid]);
const water=await pool.query(`select * from water_streaks where userid=$1`,[userid])
const nutrients=await pool.query(`select * from nutrients_streaks where userid=$1`,[userid])

res.status(200).json({calories:calories.rows,nutrients:nutrients.rows,water:water.rows})
  }
  catch(error){
    console.log(error)
    res.status(500).json({msg:"internel server"})

  }
}
module.exports=getStreak
