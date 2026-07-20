const pool = require("../services/postgre");

async function getSteps(req, res) {

    try {

        const { userid, step_date } = req.query;

        const result = await pool.query(
            `
            SELECT
                step_date,
                steps,
                distance_km,
                calories_burned
            FROM daily_steps
            WHERE userid = (
                SELECT userid FROM login_details WHERE userid = $1
            )
            AND step_date = $2
            `,
            [userid, step_date]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No step data found."
            });
        }

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

async function getStepsRange(req, res) {

    try {

        const { userid, start_date, end_date } = req.query;

        const result = await pool.query(
            `
            SELECT
                step_date,
                steps,
                distance_km,
                calories_burned
            FROM daily_steps
            WHERE userid = $1
            AND step_date BETWEEN $2 AND $3
            ORDER BY step_date ASC
            `,
            [
                userid,
                start_date,
                end_date
            ]
        );

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
module.exports = {getSteps, getStepsRange};
