const pool= require('../services/postgre.js');
const {getNutrients} = require('./food_logs.js');
const {getWaterIntake} = require('./getWaterIntake.js');
async function getAll(req, res) {
    try {
        const { userid } = req.userid;
        const nutrients = await getNutrients(userid);
        const waterIntake = await getWaterIntake(userid);

        
    }catch(err){
        console.log(err);
        res.status(500).json({
            success: false,
            message: err.message
        });

    }
}