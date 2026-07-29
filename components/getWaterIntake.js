const pool = require("../services/postgre.js");

async function getWaterIntake(req, res) {

    try {
        console.log('water came')
        const { userid, intake_date } = req.query;

        const result = await pool.query(
            `SELECT *
             FROM water_intake
             WHERE userid = $1
             AND intake_date = $2`,
            [userid, intake_date]
        );

        if (result.rows.length === 0) {

            return res.status(200).json({
                success: true,
                data: {
                    userid,
                    intake_date,
                    water_ml: 0
                }
            });

        }

        res.status(200).json({
            success: true,
            data: result.rows[0]
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

}
async function getWaterIntakeRange(req, res) {

    try {
        const { userid, start_date, end_date } = req.query;
        const result = await pool.query(
            `SELECT *
             FROM water_intake
             WHERE userid = $1
             AND intake_date BETWEEN $2 AND $3
             ORDER BY intake_date ASC`,
            [userid, start_date, end_date]
        );
         if (result.rows.length === 0) {

            return res.status(200).json({
                success: true,
                msg:"no data found"
            });

        }
        res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

}

module.exports = {  getWaterIntake, getWaterIntakeRange };