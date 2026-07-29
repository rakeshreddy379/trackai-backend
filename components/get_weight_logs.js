const pool=require('../services/postgre')
async function getWeightLogs(req,res,next){
    try{
         const {userid}=req.query || req.body || req.params
         console.log('progress came')
         const result= await pool.query(`
            SELECT * FROM weight_logs WHERE userid=$1`,
        [userid]);
        if(result.rows.length===0){
            res.status(200).json({msg:'no data found'})
        }
        else{
        res.status(200).json({
            data:result.rows
        })
    }

    }
    catch(err){
        res.status(500).json({
            msg:'internal server'
        })
    }
}
module.exports=getWeightLogs