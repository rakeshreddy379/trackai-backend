const pool  = require("../services/postgre");

async function getFoodLogs(req, res, next) {

    try {

        const userid = req.userid;

        const foodLogs = await pool.query(
            "SELECT * FROM analyzed_foods WHERE userid = $1 ORDER BY analyzed_at DESC",
            [userid]
        );

        res.status(200).json(foodLogs.rows);

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
    console.log(req.userid)
    const {userid} = req.query;
    const {date} = req.query || req.params  ;
    console.log(date)
    const result = await pool.query(
`
SELECT
    analyzed_at::date AS date,
    COALESCE(SUM((food->>'kcal')::numeric), 0) AS calories,
    COALESCE(SUM((food->>'protein')::numeric), 0) AS protein,
    COALESCE(SUM((food->>'carbs')::numeric), 0) AS carbs,
    COALESCE(SUM((food->>'fat')::numeric), 0) AS fat,
    COALESCE(SUM((food->>'fiber')::numeric), 0) AS fiber,
    COALESCE(SUM((food->>'sugar')::numeric), 0) AS sugar
FROM analyzed_foods
CROSS JOIN LATERAL json_array_elements(detected_foods) AS food
WHERE userid = $1
AND analyzed_at >= CURRENT_DATE - INTERVAL '7 days'
AND analyzed_at < CURRENT_DATE
GROUP BY analyzed_at::date
ORDER BY date DESC;
`,
[userid,date]
);  
res.status(200).json({data:result.rows});
}
async function getNutrientsRange(req, res, next) {
    console.log(req.userid)
    const {userid} = req.query;
    console.log(userid)
    const result = await pool.query(
`
SELECT
    COALESCE(SUM((food->>'kcal')::numeric), 0) AS calories,
    COALESCE(SUM((food->>'protein')::numeric), 0) AS protein,
    COALESCE(SUM((food->>'carbs')::numeric), 0) AS carbs,
    COALESCE(SUM((food->>'fat')::numeric), 0) AS fat,
    COALESCE(SUM((food->>'fiber')::numeric), 0) AS fiber,
    COALESCE(SUM((food->>'sugar')::numeric), 0) AS sugar
FROM analyzed_foods
CROSS JOIN LATERAL json_array_elements(detected_foods) AS food WHERE userid = $1 AND
analyzed_at >= NOW() - INTERVAL '7 days'`,
[userid]
);
res.status(200).json({data:result.rows});
}

module.exports = {
    getFoodLogs,
    filter_food_logs,
    getFoodLogsByDate,getNutrients,getNutrientsRange
};
