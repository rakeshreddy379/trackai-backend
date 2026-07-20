const pool = require("../services/postgre");

async function getWaterIntake(req, res) {

    try {

        const { userid, intake_date } = req.query;

        const result = await pool.query(
            `
            SELECT
                COALESCE(SUM(water_ml),0) AS water_ml
            FROM water_logs
            WHERE userid = $1
            AND intake_date = $2
            `,
            [
                userid,
                intake_date
            ]
        );

        return res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

}

module.exports = getWaterIntake;