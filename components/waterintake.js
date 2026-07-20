const pool = require("../services/postgre");

async function addWaterIntake(req, res) {

    try {

        const { userid, water_ml } = req.body;

        await pool.query(
            `
            INSERT INTO water_logs
            (
                userid,
                water_ml,
                intake_date,
                intake_time
            )
            VALUES
            (
                $1,
                $2,
                CURRENT_DATE,
                CURRENT_TIMESTAMP
            )
            `,
            [
                userid,
                water_ml
            ]
        );

        return res.status(201).json({
            success: true,
            message: "Water intake added."
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }

}

module.exports = addWaterIntake;