const {pool}= require("../services/postgre.js");
async function getFoodLogs(req, res,next) {
    try {
        const { userid } = req.userId
        const foodLogs = await pool.query("SELECT * FROM food_logs WHERE user_id = $1", [userid]);
        res.json(foodLogs.rows);
    }catch(err){
        console.error("Error retrieving food logs:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function filter_food_logs(req, res, next) {
    try {
        const { userid } = req.userId;
        const { startDate, endDate } = req.query;

        const foodLogs = await pool.query(
            "SELECT * FROM food_logs WHERE user_id = $1 AND consumed_at >= $2 AND consumed_at <= $3",
            [userid, startDate, endDate]
        );
        res.json(foodLogs.rows);
    } catch (err) {
        console.error("Error filtering food logs:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function getFoodLogsByDate(req, res, next) {
    try {
        const { userid } = req.userId;
        const { date } = req.query; 
        const foodLogs = await pool.query(
            "SELECT * FROM food_logs WHERE user_id = $1 AND (meal_date) = $2",
            [userid, date]
        );
        res.json(foodLogs.rows);
    }catch (err) {  
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    getFoodLogs,
    filter_food_logs,
    getFoodLogsByDate
};

