const pool = require("../services/postgre.js");

async function addWaterIntake(req, res) {

    try {

        const { userid, water_ml, intake_date } = req.body;

        await pool.query(
            `INSERT INTO water_intake
            (
                userid,
                intake_date,
                water_ml
            )
            VALUES
            (
                $1,
                $2,
                $3
            )
            ON CONFLICT (userid, intake_date)
            DO UPDATE SET
                water_ml = water_intake.water_ml + EXCLUDED.water_ml,
                updated_at = CURRENT_TIMESTAMP`,
            [userid, intake_date, water_ml]
        );

        res.status(200).json({
            success: true,
            message: "Water intake updated successfully"
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

}

module.exports = addWaterIntake;