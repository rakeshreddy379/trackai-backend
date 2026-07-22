const { pool } = require("../services/postgre.js");

async function getFoodLogs(req, res, next) {

    try {

        const userid = req.userid;

        const foodLogs = await pool.query(
            "SELECT * FROM analyzed_foods WHERE userid = $1 ORDER BY analyzed_at DESC",
            [userid]
        );

        res.json(foodLogs.rows);

    } catch (err) {

        console.error("Error retrieving food logs:", err);

        res.status(500).json({
            error: "Internal server error"
        });

    }

}

async function filter_food_logs(req, res, next) {

    try {

        const userid = req.userid;

        const { startDate, endDate } = req.query;

        const foodLogs = await pool.query(
            `SELECT *
             FROM analyzed_foods
             WHERE userid = $1
             AND analyzed_at BETWEEN $2 AND $3
             ORDER BY analyzed_at ASC`,
            [userid, startDate, endDate]
        );

        res.json(foodLogs.rows);

    } catch (err) {

        console.error("Error filtering food logs:", err);

        res.status(500).json({
            error: "Internal server error"
        });

    }

}

async function getFoodLogsByDate(req, res, next) {

    try {

        const userid = req.userid;

        const { date } = req.query;

        const foodLogs = await pool.query(
            `SELECT *
             FROM analyzed_foods
             WHERE userid = $1
             AND analyzed_at::date = $2`,
            [userid, date]
        );

        res.json(foodLogs.rows);

    } catch (err) {

        console.error("Error retrieving food logs by date:", err);

        res.status(500).json({
            error: "Internal server error"
        });

    }

}
async function getNutrients(req, res, next) {
    const { userid } = req.userid;
    result = await pool.query(
`
SELECT 
    COALESCE(SUM((food->>'kcal')::numeric),0) AS total_calories,
    COALESCE(SUM((food->>'protein')::numeric),0) AS total_protein,
    COALESCE(SUM((food->>'carbs')::numeric),0) AS total_carbs,
    COALESCE(SUM((food->>'fat')::numeric),0) AS total_fat
FROM analyzed_foods,
jsonb_array_elements(detect_foods::jsonb) AS food
WHERE userid = $1
AND analyzed_at::date = CURRENT_DATE;
`,
[userid]
);
return result.rows[0];
}

module.exports = {
    getFoodLogs,
    filter_food_logs,
    getFoodLogsByDate,getNutrients
};